import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';

export const useAudioPlayer = (url?: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { volume, isMuted } = useStore();

  useEffect(() => {
    if (!url) return;

    // Create new audio instance
    const audio = new Audio(url);
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    // Setup listeners
    const handleCanPlay = () => {
      audio.play().catch(err => {
        console.log('Autoplay blocked:', err);
      });
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.pause();
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.src = '';
      audioRef.current = null;
    };
  }, [url]);

  // Handle Volume/Mute changes on the fly
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const toggle = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  return { isPlaying, toggle };
};

