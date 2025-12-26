import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Interaction } from '../interaction.entity';
import { User } from '../user.entity';
import { Song, SwipeRequest, SwipeType } from '@swipesound/shared-types';
import { shuffleArray } from '@swipesound/shared-utils';

@Injectable()
export class MusicService {
  private readonly DEEZER_API_URL = 'https://api.deezer.com';

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Interaction)
    private readonly interactionRepository: Repository<Interaction>,
  ) {}

  async getDiscoverSongs(sessionId?: string, user?: User): Promise<Song[]> {
    try {
      let baseSongs: Song[] = [];
      const recommendedSongs: Song[] = [];

      // 1. Try recommendations from liked songs
      if ((sessionId && sessionId !== 'undefined') || user) {
        const likedInteractions = await this.interactionRepository.find({
          where: user ? { user: { id: user.id }, type: SwipeType.LIKE } : { sessionId, type: SwipeType.LIKE },
          take: 5,
          order: { createdAt: 'DESC' }
        });

        if (likedInteractions.length > 0) {
          const randomLiked = likedInteractions[Math.floor(Math.random() * likedInteractions.length)];
          try {
            const relatedResponse = await firstValueFrom(
              this.httpService.get(`${this.DEEZER_API_URL}/track/${randomLiked.songId}/related?limit=20`)
            );
            if (relatedResponse.data?.data) {
              recommendedSongs.push(...(relatedResponse.data.data as Song[]));
            }
          } catch (e) {
            console.error('Failed to fetch recommendations:', e.message);
          }
        }
      }

      // 2. Fetch chart tracks (prioritize preferred genres if user has them)
      let genreIdsToFetch = [0, 132, 116, 152, 113]; // Default genres
      
      if (user?.preferredGenres && user.preferredGenres.length > 0) {
        genreIdsToFetch = user.preferredGenres;
      }

      // Pick 2 random genres from the list to mix
      const selectedGenres = shuffleArray(genreIdsToFetch).slice(0, 2);
      
      for (const genreId of selectedGenres) {
        try {
          const response = await firstValueFrom(
            this.httpService.get(`${this.DEEZER_API_URL}/chart/${genreId}/tracks?limit=50`),
          );
          if (response.data?.data) {
            baseSongs.push(...(response.data.data as Song[]));
          }
        } catch (e) {
          console.error(`Failed to fetch tracks for genre ${genreId}:`, e.message);
        }
      }

      // Fallback if genres failed
      if (baseSongs.length === 0) {
        const fallback = await firstValueFrom(
          this.httpService.get(`${this.DEEZER_API_URL}/chart/0/tracks?limit=50`),
        );
        baseSongs = fallback.data.data as Song[];
      }
      
      // Mix them
      const finalPool = [...recommendedSongs, ...baseSongs];
      const shuffled = shuffleArray(finalPool);
      
      return shuffled;
    } catch (error) {
      console.error('Error fetching from Deezer:', error);
      throw new InternalServerErrorException('Failed to fetch songs from Deezer');
    }
  }

  async handleSwipe(swipe: SwipeRequest, sessionId?: string, user?: User): Promise<void> {
    const interaction = this.interactionRepository.create({
      songId: swipe.songId,
      type: swipe.type,
      sessionId,
      user,
      title: swipe.title,
      artistName: swipe.artistName,
      albumArt: swipe.albumArt,
      previewUrl: swipe.previewUrl,
    });
    
    await this.interactionRepository.save(interaction);
  }

  async getLikedSongs(sessionId?: string, user?: User): Promise<Song[]> {
    // If not logged in, must have a sessionId
    if (!user && (!sessionId || sessionId === 'undefined' || sessionId === '')) {
      return [];
    }

    const interactions = await this.interactionRepository.find({
      where: user ? { user: { id: user.id }, type: SwipeType.LIKE } : { sessionId, type: SwipeType.LIKE },
      order: {
        createdAt: 'DESC',
      },
    });

    // Map interactions back to Song objects (using cached metadata)
    const uniqueSongs = new Map<number, Song>();
    
    interactions.forEach(i => {
      // Skip legacy records with no metadata
      if (!i.title) return;

      const songId = typeof i.songId === 'string' ? parseInt(i.songId, 10) : i.songId;

      if (!uniqueSongs.has(songId)) {
        uniqueSongs.set(songId, {
          id: songId,
          title: i.title,
          preview: i.previewUrl || '',
          artist: { name: i.artistName || 'Unknown Artist' } as any,
          album: { cover_big: i.albumArt, cover_small: i.albumArt } as any,
        } as Song);
      }
    });

    return Array.from(uniqueSongs.values());
  }

  async deleteLikedSong(songId: number, sessionId?: string, user?: User): Promise<void> {
    await this.interactionRepository.delete(
      user ? { songId, user: { id: user.id }, type: SwipeType.LIKE } : { songId, sessionId, type: SwipeType.LIKE }
    );
  }
}

