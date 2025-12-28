import React from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Song } from '@swipesound/shared-types';
import { Heart, X } from 'lucide-react';

interface SwipeCardProps {
  song: Song;
  onSwipe: (direction: 'left' | 'right') => void;
  isActive: boolean;
  custom?: 'left' | 'right' | null;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ song, onSwipe, isActive, custom }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const heartOpacity = useTransform(x, [50, 150], [0, 1]);
  const xOpacity = useTransform(x, [-50, -150], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  const cardVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: (direction: 'left' | 'right' | null) => ({
      x: direction === 'right' ? 1000 : direction === 'left' ? -1000 : 0,
      opacity: 0,
      scale: 0.5,
      transition: { duration: 0.6 }
    })
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag={isActive ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      custom={custom}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="absolute w-full max-w-[340px] aspect-[3/4] cursor-grab active:cursor-grabbing z-10"
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
        {/* Album Art */}
        <img 
          src={song.album.cover_big} 
          alt={song.title}
          className="w-full h-full object-cover pointer-events-none"
        />

        {/* Visual Feedback Overlays */}
        <motion.div 
          style={{ opacity: heartOpacity }}
          className="absolute inset-0 bg-green-500/20 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-white rounded-full p-6 shadow-lg">
            <Heart className="w-12 h-12 text-green-500 fill-green-500" />
          </div>
        </motion.div>

        <motion.div 
          style={{ opacity: xOpacity }}
          className="absolute inset-0 bg-red-500/20 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-white rounded-full p-6 shadow-lg">
            <X className="w-12 h-12 text-red-500" />
          </div>
        </motion.div>

        {/* Song Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-20">
          <h2 className="text-2xl font-bold truncate leading-tight">{song.title}</h2>
          <p className="text-slate-300 font-medium truncate opacity-90">{song.artist.name}</p>
        </div>
      </div>
    </motion.div>
  );
};

