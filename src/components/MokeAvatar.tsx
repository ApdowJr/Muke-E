import React from 'react';

interface MokeAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isSpeaking?: boolean;
  className?: string;
}

export const MokeAvatar: React.FC<MokeAvatarProps> = ({
  size = 'md',
  isSpeaking = false,
  className = '',
}) => {
  const dimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  return (
    <div
      className={`relative rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${dimensions} ${
        isSpeaking ? 'scale-105' : ''
      } ${className}`}
    >
      {/* Background glow when speaking */}
      {isSpeaking && (
        <span className="absolute inset-0 rounded-xl bg-cyan-400/30 blur-md animate-pulse" />
      )}

      {/* Modern Friendly AI Language Tutor Mascot (Headphones + Intelligent Eyes + Glowing Antenna) */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="mokeBgGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" />
            <stop offset="0.5" stopColor="#0284C7" />
            <stop offset="1" stopColor="#0D9488" />
          </linearGradient>
          <linearGradient id="mokeFaceGrad" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F172A" />
            <stop offset="1" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="mokeEyesGrad" x1="14" y1="20" x2="34" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#34D399" />
          </linearGradient>
          <linearGradient id="headphoneGrad" x1="6" y1="18" x2="42" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
        </defs>

        {/* Outer Squircle Container */}
        <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#mokeBgGrad)" />

        {/* Inner Screen / Visor */}
        <rect x="8" y="10" width="32" height="26" rx="8" fill="url(#mokeFaceGrad)" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.4" />

        {/* Headphone Arch */}
        <path
          d="M7 23C7 13.6 14.6 6 24 6C33.4 6 41 13.6 41 23"
          stroke="url(#headphoneGrad)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Left Headphone Ear-cup */}
        <rect x="3.5" y="18" width="5" height="12" rx="2.5" fill="#38BDF8" />
        {/* Right Headphone Ear-cup */}
        <rect x="39.5" y="18" width="5" height="12" rx="2.5" fill="#6366F1" />

        {/* Glowing AI Eyes */}
        <ellipse cx="17.5" cy="21" rx="3.5" ry="4" fill="url(#mokeEyesGrad)" />
        <circle cx="16.5" cy="19.5" r="1.2" fill="#FFFFFF" />

        <ellipse cx="30.5" cy="21" rx="3.5" ry="4" fill="url(#mokeEyesGrad)" />
        <circle cx="29.5" cy="19.5" r="1.2" fill="#FFFFFF" />

        {/* Cute Smiling Mouth / Speech Waves */}
        {isSpeaking ? (
          // Animated / Dynamic Speaking Wave Mouth
          <g>
            <rect x="18" y="28" width="2" height="4" rx="1" fill="#38BDF8" className="animate-pulse" />
            <rect x="23" y="26.5" width="2" height="7" rx="1" fill="#34D399" />
            <rect x="28" y="28" width="2" height="4" rx="1" fill="#38BDF8" className="animate-pulse" />
          </g>
        ) : (
          // Friendly Smile
          <path
            d="M19 28C20.5 30.5 27.5 30.5 29 28"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}

        {/* Headphone Boom Mic */}
        <path
          d="M6 25C6 31 10 33 16 33"
          stroke="#38BDF8"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="16.5" cy="33" r="2.2" fill="#34D399" />

        {/* Top Signal Spark / Antenna Light */}
        <circle cx="24" cy="4" r="2" fill="#34D399" />
        <circle cx="24" cy="4" r="3.5" stroke="#34D399" strokeWidth="0.8" strokeOpacity="0.5" />
      </svg>

      {/* Online indicator dot */}
      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
    </div>
  );
};
