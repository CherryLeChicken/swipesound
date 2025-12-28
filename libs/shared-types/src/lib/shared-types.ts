export interface Artist {
  id: number;
  name: string;
  link: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  tracklist: string;
  type: string;
}

export interface Album {
  id: number;
  title: string;
  cover: string;
  cover_small: string;
  cover_medium: string;
  cover_big: string;
  cover_xl: string;
  md5_image: string;
  tracklist: string;
  type: string;
}

export interface Song {
  id: number;
  readable: boolean;
  title: string;
  title_short: string;
  title_version: string;
  link: string;
  duration: number;
  rank: number;
  explicit_lyrics: boolean;
  explicit_content_lyrics: number;
  explicit_content_cover: number;
  preview: string;
  md5_image: string;
  artist: Artist;
  album: Album;
  type: string;
  genreId?: number; // Added to track genre
}

export enum SwipeType {
  LIKE = 'LIKE',
  SKIP = 'SKIP',
}

export interface SwipeRequest {
  songId: number;
  type: SwipeType;
  title?: string;
  artistName?: string;
  albumArt?: string;
  previewUrl?: string;
  genreId?: number;
}

export interface LikedSong extends Song {
  likedAt: Date;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    preferredGenres?: number[];
  };
  accessToken: string;
}

export interface Genre {
  id: number;
  name: string;
  picture?: string;
}

export interface UpdateGenresRequest {
  genreIds: number[];
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}
