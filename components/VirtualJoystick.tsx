import React, { useEffect, useRef, useState, useCallback } from 'react';

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const touchId = useRef<number | null>(null);

  const handleStart = useCallback((clientX: number, clientY: number, id: number | null) => {
    if (active) return;
    setActive(true);
    setOrigin({ x: clientX, y: clientY });
    setPosition({ x: 0, y: 0 });
    touchId.current = id;
    onMove(0, 0);
  }, [active, onMove]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!active) return;

    const dx = clientX - origin.x;
    const dy = clientY - origin.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 40; // Joystick radius

    let moveX = dx;
    let moveY = dy;

    // Clamp to radius
    if (distance > maxDist) {
      const ratio = maxDist / distance;
      moveX = dx * ratio;
      moveY = dy * ratio;
    }

    setPosition({ x: moveX, y: moveY });
    
    // Normalize output -1 to 1
    onMove(moveX / maxDist, moveY / maxDist);
  }, [active, origin, onMove]);

  const handleEnd = useCallback(() => {
    setActive(false);
    setPosition({ x: 0, y: 0 });
    touchId.current = null;
    onMove(0, 0);
  }, [onMove]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (touchId.current !== null) {
        const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId.current);
        if (touch) {
          handleMove(touch.clientX, touch.clientY);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchId.current !== null) {
        const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId.current);
        if (touch) {
          handleEnd();
        }
      }
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMove, handleEnd]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-8 left-8 w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 touch-none select-none flex items-center justify-center z-50"
      onTouchStart={(e) => {
        const touch = e.changedTouches[0];
        handleStart(touch.clientX, touch.clientY, touch.identifier);
      }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY, null)}
      onMouseMove={(e) => {
        if (touchId.current === null) handleMove(e.clientX, e.clientY);
      }}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      <div
        className="w-12 h-12 rounded-full bg-white shadow-lg transition-transform duration-75 ease-linear"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          opacity: active ? 0.8 : 0.4
        }}
      />
    </div>
  );
};

export default VirtualJoystick;