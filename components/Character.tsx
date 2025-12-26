import React, { useEffect, useState } from 'react';
import { Direction } from '../types';
import { ANIMATION_SPEED_MS } from '../constants';

interface CharacterProps {
  direction: Direction;
  isMoving: boolean;
  sprites: Record<string, string[]>;
}

const Character: React.FC<CharacterProps> = ({ direction, isMoving, sprites }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    // Reset to first frame when stopping
    if (!isMoving) {
      setFrame(0);
      return;
    }

    // Cycle frames when moving
    const interval = setInterval(() => {
      setFrame(prev => {
        const sequence = sprites[direction] || [];
        if (sequence.length === 0) return 0;
        return (prev + 1) % sequence.length;
      });
    }, ANIMATION_SPEED_MS);

    return () => clearInterval(interval);
  }, [isMoving, direction, sprites]);

  const sequence = sprites[direction];
  // Safety check to default to first frame if something goes wrong
  const spriteUrl = (sequence && sequence[frame]) ? sequence[frame] : '';

  if (!spriteUrl) return null;

  return (
    <div className="w-full h-full relative">
      {/* Sprite Image */}
      <img 
        src={spriteUrl} 
        alt="Character" 
        className="w-full h-full object-contain" 
        style={{ 
          imageRendering: 'pixelated', // Keeps pixel art crisp
          filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.5))' // Adds a nice shadow to the character
        }}
      />
    </div>
  );
};

export default Character;