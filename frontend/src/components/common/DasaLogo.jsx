import React from 'react';

/**
 * Official DASA TECH & DASA EXPENCES brand mark and typography.
 * Featuring the official geometric gold/amber/ruby emblem and modern metallic tones.
 */
export function DasaLogo({ size = 'md', variant = 'full', lightMode = false, showTagline = true, className = '' }) {
  // Dimension presets
  const dims = {
    sm: { icon: 30, text: 16, sub: 9.5, officialH: 34 },
    md: { icon: 40, text: 19, sub: 10.5, officialH: 44 },
    lg: { icon: 52, text: 24, sub: 12, officialH: 56 },
    xl: { icon: 66, text: 30, sub: 14, officialH: 72 },
  }[size] || { icon: 40, text: 19, sub: 10.5, officialH: 44 };

  // Official stacked logo image
  if (variant === 'official') {
    return (
      <img
        src="/dasa-tech-logo.png"
        alt="DASA TECH Software Solutions"
        style={{
          height: dims.officialH,
          width: 'auto',
          objectFit: 'contain',
          display: 'inline-block',
          verticalAlign: 'middle',
        }}
        className={className}
      />
    );
  }

  // Official horizontal logo image
  if (variant === 'horizontal') {
    return (
      <img
        src="/dasa-tech-logo-horizontal.png"
        alt="DASA TECH Software Solutions"
        style={{
          height: dims.officialH,
          width: 'auto',
          objectFit: 'contain',
          display: 'inline-block',
          verticalAlign: 'middle',
        }}
        className={className}
      />
    );
  }

  const iconElement = (
    <img
      src="/dasa-mark.png"
      alt="DASA Brand Mark"
      width={dims.icon}
      height={dims.icon}
      style={{
        width: dims.icon,
        height: dims.icon,
        objectFit: 'contain',
        flexShrink: 0,
        filter: 'drop-shadow(0 3px 10px rgba(180, 83, 9, 0.28))',
      }}
    />
  );

  if (variant === 'icon') {
    return iconElement;
  }

  const textColor = lightMode ? '#ffffff' : '#0f172a';
  const subtitleColor = lightMode ? '#94a3b8' : '#64748b';
  const brandAccent = lightMode ? '#fbbf24' : '#b45309';

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dims.icon > 32 ? 12 : 8,
        userSelect: 'none',
      }}
    >
      {iconElement}
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
                background: 'linear-gradient(135deg, #d97706 0%, #dc2626 55%, #991b1b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
                letterSpacing: '-0.02em',
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
              backgroundColor: lightMode ? 'rgba(251, 191, 36, 0.15)' : 'rgba(217, 119, 6, 0.12)',
              color: lightMode ? '#fde68a' : '#b45309',
              letterSpacing: '0.04em',
              border: lightMode ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(217, 119, 6, 0.25)',
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
            <span style={{ color: brandAccent, fontWeight: 700 }}>DASA TECH</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span style={{ opacity: 0.85 }}>Software Solutions</span>
          </span>
        )}
      </div>
    </div>
  );
}
