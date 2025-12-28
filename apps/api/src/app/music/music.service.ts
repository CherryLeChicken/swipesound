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
  private readonly ALL_GENRE_IDS = [132, 116, 152, 113, 129, 106, 165, 85]; // Supported genres

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Interaction)
    private readonly interactionRepository: Repository<Interaction>,
  ) {}

  async getDiscoverSongs(sessionId?: string, user?: User): Promise<Song[]> {
    try {
      let baseSongs: Song[] = [];
      const recommendedSongs: Song[] = [];

      // 1. Fetch recent history to analyze behavior
      const recentHistory = await this.interactionRepository.find({
        where: user ? { user: { id: user.id } } : { sessionId },
        take: 20,
        order: { createdAt: 'DESC' }
      });

      // Analyze genre-specific skip rates
      const genreStats: Record<number, { likes: number, skips: number }> = {};
      recentHistory.forEach(i => {
        if (!i.genreId) return;
        if (!genreStats[i.genreId]) genreStats[i.genreId] = { likes: 0, skips: 0 };
        if (i.type === SwipeType.LIKE) genreStats[i.genreId].likes++;
        else genreStats[i.genreId].skips++;
      });

      const hatedGenres = Object.entries(genreStats)
        .filter(([_, stats]) => {
          const total = stats.likes + stats.skips;
          return total >= 3 && (stats.skips / total) >= 0.8; // Hated if 80% skip rate with at least 3 samples
        })
        .map(([id]) => parseInt(id, 10));

      const skipCount = recentHistory.slice(0, 10).filter(i => i.type === SwipeType.SKIP).length;
      const isFatigued = skipCount >= 7; // High skip rate in last 10 songs

      // 2. Try recommendations from liked songs (only if not fatigued)
      if (!isFatigued && ((sessionId && sessionId !== 'undefined') || user)) {
        const likedInteractions = recentHistory.filter(i => i.type === SwipeType.LIKE).slice(0, 5);

        if (likedInteractions.length > 0) {
          const randomLiked = likedInteractions[Math.floor(Math.random() * likedInteractions.length)];
          try {
            const relatedResponse = await firstValueFrom(
              this.httpService.get(`${this.DEEZER_API_URL}/track/${randomLiked.songId}/related?limit=20`)
            );
            if (relatedResponse.data?.data) {
              const tracks = relatedResponse.data.data as Song[];
              // Try to preserve genre if possible
              tracks.forEach(t => t.genreId = randomLiked.genreId);
              recommendedSongs.push(...tracks);
            }
          } catch (e) {
            console.error('Failed to fetch recommendations:', e.message);
          }
        }
      }

      // 3. Fetch chart tracks
      let genreIdsToFetch = [...this.ALL_GENRE_IDS];
      
      if (isFatigued) {
        // SHAKEUP: Pick genres that are NOT in user's preferred list AND NOT hated
        const userPrefs = user?.preferredGenres || [];
        genreIdsToFetch = this.ALL_GENRE_IDS.filter(id => !userPrefs.includes(id) && !hatedGenres.includes(id));
        if (genreIdsToFetch.length === 0) genreIdsToFetch = this.ALL_GENRE_IDS.filter(id => !hatedGenres.includes(id));
        console.log(`Discovery Shakeup: User is skipping too much. Trying fresh genres.`);
      } else if (user?.preferredGenres && user.preferredGenres.length > 0) {
        // Use preferred genres but exclude hated ones
        genreIdsToFetch = user.preferredGenres.filter(id => !hatedGenres.includes(id));
        if (genreIdsToFetch.length === 0) genreIdsToFetch = this.ALL_GENRE_IDS.filter(id => !hatedGenres.includes(id));
      } else {
        // Exclude hated ones from the default pool
        genreIdsToFetch = this.ALL_GENRE_IDS.filter(id => !hatedGenres.includes(id));
      }

      // If we've hated EVERYTHING (somehow), fallback to all
      if (genreIdsToFetch.length === 0) genreIdsToFetch = [...this.ALL_GENRE_IDS];

      // Pick 2-3 random genres from the filtered list to mix
      const selectedGenres = shuffleArray(genreIdsToFetch).slice(0, 3);
      
      for (const genreId of selectedGenres) {
        try {
          const response = await firstValueFrom(
            this.httpService.get(`${this.DEEZER_API_URL}/chart/${genreId}/tracks?limit=40`),
          );
          if (response.data?.data) {
            const tracks = response.data.data as Song[];
            // Tag tracks with the genre they came from
            tracks.forEach(t => t.genreId = genreId);
            baseSongs.push(...tracks);
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
        baseSongs.forEach(t => t.genreId = 0);
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
      genreId: swipe.genreId, // Save the genre ID
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

