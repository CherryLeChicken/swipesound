import { Controller, Get, Post, Delete, Body, Headers, Header, Param, UseGuards } from '@nestjs/common';
import { MusicService } from './music.service';
import { Song, SwipeRequest } from '@swipesound/shared-types';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../user.entity';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get('discover')
  @UseGuards(OptionalJwtAuthGuard)
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async getDiscover(
    @Headers('x-session-id') sessionId?: string,
    @GetUser() user?: User,
  ): Promise<Song[]> {
    return this.musicService.getDiscoverSongs(sessionId, user);
  }

  @Post('swipe')
  @UseGuards(OptionalJwtAuthGuard)
  async swipe(
    @Body() swipeRequest: SwipeRequest,
    @Headers('x-session-id') sessionId?: string,
    @GetUser() user?: User,
  ): Promise<{ success: true }> {
    await this.musicService.handleSwipe(swipeRequest, sessionId, user);
    return { success: true };
  }

  @Get('liked')
  @UseGuards(OptionalJwtAuthGuard)
  async getLiked(
    @Headers('x-session-id') sessionId?: string,
    @GetUser() user?: User,
  ): Promise<Song[]> {
    return this.musicService.getLikedSongs(sessionId, user);
  }

  @Delete('liked/:songId')
  @UseGuards(OptionalJwtAuthGuard)
  async deleteLiked(
    @Param('songId') songId: string,
    @Headers('x-session-id') sessionId?: string,
    @GetUser() user?: User,
  ): Promise<{ success: true }> {
    await this.musicService.deleteLikedSong(parseInt(songId, 10), sessionId, user);
    return { success: true };
  }

  @Get('test-deezer')
  async testDeezer(): Promise<any> {
    return this.musicService.getDiscoverSongs();
  }
}

