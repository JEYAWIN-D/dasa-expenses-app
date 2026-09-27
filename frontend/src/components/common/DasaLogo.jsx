import React from 'react';

/**
 * Original DASA EXPENCES wordmark and recognizable D/E-inspired product icon.
 * Designed with electric blue, royal blue, teal accents, and sleek typography.
 */
export function DasaLogo({ size = 'md', variant = 'full', lightMode = false, showTagline = true }) {
  // Dimension presets
  const dims = {
    sm: { icon: 28, text: 16, sub: 9 },
    md: { icon: 38, text: 19, sub: 10 },
    lg: { icon: 48, text: 24, sub: 11 },
    xl: { icon: 60, text: 30, sub: 13 },
  }[size] || { icon: 38, text: 19, sub: 10 };

  const iconSvg = (
    <svg
      width={dims.icon}
      height={dims.icon}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 4px 12px rgba(37, 99, 235, 0.35))', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="dasaPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id="dasaAccentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <linearGradient id="dasaBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* Rounded squircle container */}
      <rect width="48" height="48" rx="12" fill="url(#dasaBgGrad)" />
      
      {/* Outer subtle glow ring */}
      <rect x="1" y="1" width="46" height="46" rx="11" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

      {/* Interlinked Geometric 'D' & 'E' / Rupee Flow glyph */}
      {/* Back 'D' Spine & Curve */}
      <path
        d="M14 11H25C31.075 11 36 15.925 36 22C36 28.075 31.075 33 25 33H14V11Z"
        fill="none"
        stroke="url(#dasaPrimaryGrad)"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Front 'E' Layer with Rupee Balance Accents */}
      <path
        d="M18 17H31"
        stroke="url(#dasaAccentGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M18 24H28"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M18 31H32"
        stroke="url(#dasaAccentGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Financial Spark Dot */}
      <circle cx="34" cy="14" r="3" fill="#06b6d4" />
    </svg>
  );

  if (variant === 'icon') {
    return iconSvg;
  }

  const textColor = lightMode ? '#ffffff' : '#0f172a';
  const subtitleColor = lightMode ? '#94a3b8' : '#64748b';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: dims.icon > 32 ? 12 : 8, userSelect: 'none' }}>
      {iconSvg}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: dims.text,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: textColor,
              display: 'flex',
              alignItems: 'baseline',
              gap: 4,
            }}
          >
            <span>DASA</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
              }}
            >
              EXPENCES
            </span>
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              padding: '2px 5px',
              borderRadius: 4,
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              color: '#2563eb',
              letterSpacing: '0.04em',
              border: '1px solid rgba(37, 99, 235, 0.2)',
            }}
          >
            SAAS
          </span>
        </div>
        {showTagline && (
          <span
            style={{
              fontSize: dims.sub,
              color: subtitleColor,
              fontWeight: 600,
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 2,
            }}
          >
            <span>by</span>
            <span style={{ color: '#2563eb', fontWeight: 700 }}>DASA TECH</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span style={{ opacity: 0.85 }}>Project Finance</span>
          </span>
        )}
      </div>
    </div>
  );
}
