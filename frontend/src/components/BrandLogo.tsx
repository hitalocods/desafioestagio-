'use client';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
}

export function BrandLogo({ variant = 'dark' }: BrandLogoProps) {
  const isLightText = variant === 'light';

  return (
    <div className="flex items-center gap-2 sm:gap-3 select-none group">
      {/* Emblema SVG Customizado */}
      <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-950 flex items-center justify-center shadow-md shadow-indigo-600/20 border border-slate-800 group-hover:scale-105 transition-transform duration-300 overflow-hidden shrink-0">
        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-indigo-500/30 blur-md" />
        <div className="absolute -bottom-3 -left-3 w-8 h-8 rounded-full bg-emerald-500/30 blur-md" />
        <svg
          viewBox="0 0 64 64"
          fill="none"
          className="w-6 h-6 sm:w-8 sm:h-8 relative z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="brandGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="50%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>
          <path
            d="M23 23V19C23 14.0294 27.0294 10 32 10C36.9706 10 41 14.0294 41 19V23"
            stroke="url(#brandGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M15 23H49L46.2 50C45.9 52.3 44 54 41.7 54H22.3C20 54 18.1 52.3 17.8 50L15 23Z"
            fill="url(#brandGrad)"
            fillOpacity="0.16"
            stroke="url(#brandGrad)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M25 45V32L39 45V32"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Wordmark Tipográfica */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span
            className={`text-base sm:text-2xl font-black tracking-tight leading-none ${
              isLightText ? 'text-white' : 'text-slate-950'
            }`}
          >
            NOVA
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500">
              STORE
            </span>
          </span>
          <span
            className={`hidden xl:inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
              isLightText
                ? 'bg-white/10 text-indigo-300 border border-white/15'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
            }`}
          >
            PRO
          </span>
        </div>
        <span
          className={`text-[10px] sm:text-[11px] font-semibold tracking-wide mt-0.5 hidden sm:block ${
            isLightText ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Tech Flagship & Booking
        </span>
      </div>
    </div>
  );
}
