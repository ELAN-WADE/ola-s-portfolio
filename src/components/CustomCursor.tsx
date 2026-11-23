import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailing, setTrailing] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('button') || target.closest('a') || target.closest('[data-cursor-hover]'))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    let animId: number;
    const lerp = () => {
      setTrailing((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.2,
        y: prev.y + (pos.y - prev.y) * 0.2,
      }));
      animId = requestAnimationFrame(lerp);
    };
    animId = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(animId);
  }, [pos, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Subtle Grayscale Follower Ring */}
      <div
        className="fixed -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/[0.03] transition-[width,height] duration-200 ease-out"
        style={{
          left: `${trailing.x}px`,
          top: `${trailing.y}px`,
          width: isHovered ? '44px' : '28px',
          height: isHovered ? '44px' : '28px',
        }}
      />
      {/* Center Precision Dot */}
      <div
        className="fixed -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-200 transition-transform duration-100 ease-out"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: isHovered ? '5px' : '3.5px',
          height: isHovered ? '5px' : '3.5px',
        }}
      />
    </div>
  );
};
