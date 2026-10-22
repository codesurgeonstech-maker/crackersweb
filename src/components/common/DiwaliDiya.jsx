import React from 'react';

/**
 * DiwaliDiya - An animated traditional glowing Diwali Diya lamp SVG
 * with flickering flame and twinkling sparkles.
 */
export default function DiwaliDiya({
  size = 'md',
  className = '',
  withSparkles = false,
  glow = true
}) {
  const sizeMap = {
    xs: { width: 20, height: 20 },
    sm: { width: 28, height: 28 },
    md: { width: 38, height: 38 },
    lg: { width: 52, height: 52 },
    xl: { width: 72, height: 72 }
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`inline-flex items-center justify-center relative shrink-0 ${className}`}
      style={{ width: dim.width, height: dim.height }}
      aria-label="Diwali Diya"
      role="img"
    >
      {/* Ambient Radial Glow */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full bg-amber-400/25 blur-sm pointer-events-none animate-festive-pulse"
          style={{ transform: 'scale(1.3)' }}
        />
      )}

      {/* Twinkling mini sparkles if enabled */}
      {withSparkles && (
        <>
          <span
            className="absolute -top-1 -right-1 text-amber-300 text-[10px] pointer-events-none select-none animate-sparkle-twinkle"
            style={{ animationDelay: '0.2s' }}
          >
            ✦
          </span>
          <span
            className="absolute -top-2 left-0 text-yellow-200 text-[8px] pointer-events-none select-none animate-sparkle-twinkle"
            style={{ animationDelay: '0.8s' }}
          >
            ✧
          </span>
        </>
      )}

      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Flame Gradient */}
          <linearGradient id="flameGrad" x1="32" y1="6" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="75%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>

          {/* Diya Clay Base Gradient */}
          <linearGradient id="clayGrad" x1="12" y1="32" x2="52" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="30%" stopColor="#D97706" />
            <stop offset="70%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Diya Rim Gold Accent */}
          <linearGradient id="goldRim" x1="8" y1="34" x2="56" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>
        </defs>

        {/* Flickering Flame with CSS Animation */}
        <g className="animate-diwali-flame" style={{ transformOrigin: '32px 32px' }}>
          {/* Outer Flame Glow */}
          <path
            d="M32 4C30 14 23 20 23 28C23 33.5 27 37 32 37C37 37 41 33.5 41 28C41 20 34 14 32 4Z"
            fill="url(#flameGrad)"
            opacity="0.95"
          />
          {/* Inner Core Bright Flame */}
          <path
            d="M32 12C31 17 27 22 27 28C27 31.5 29.2 34 32 34C34.8 34 37 31.5 37 28C37 22 33 17 32 12Z"
            fill="#FEF9C3"
          />
          {/* White Heat Pip */}
          <ellipse cx="32" cy="28" rx="2.5" ry="4" fill="#FFFFFF" opacity="0.9" />
        </g>

        {/* Diya Base (Traditional Clay Lamp) */}
        <path
          d="M8 36C10 49 22 56 32 56C42 56 54 49 56 36C56 35 55 34 53 34C44 37 20 37 11 34C9 34 8 35 8 36Z"
          fill="url(#clayGrad)"
        />

        {/* Diya Upper Rim Border */}
        <path
          d="M8.5 35.5C18 38 46 38 55.5 35.5C53 37.5 43.5 40 32 40C20.5 40 11 37.5 8.5 35.5Z"
          fill="url(#goldRim)"
        />

        {/* Diya Foot Stand */}
        <path
          d="M26 55C26 57.5 28 59 32 59C36 59 38 57.5 38 55H26Z"
          fill="#78350F"
        />

        {/* Decorative Gold Beads on Base */}
        <circle cx="20" cy="46" r="1.5" fill="#FDE68A" opacity="0.9" />
        <circle cx="26" cy="49" r="1.5" fill="#FDE68A" opacity="0.9" />
        <circle cx="32" cy="50" r="1.8" fill="#FEF08A" />
        <circle cx="38" cy="49" r="1.5" fill="#FDE68A" opacity="0.9" />
        <circle cx="44" cy="46" r="1.5" fill="#FDE68A" opacity="0.9" />
      </svg>
    </div>
  );
}
