import React, { useState } from 'react';
import { ExternalLink, Copy, Check, HelpCircle, Shield, X } from 'lucide-react';

export function SignalIcon({ size = 20, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 2.237.737 4.305 1.984 5.976L2.3 21.28a.75.75 0 0 0 .92.92l3.304-1.684A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
    </svg>
  );
}

export function SignalContactCard({ className = '', style = {} }) {
  const [copied, setCopied] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const signalUsername = 'dasatech.99';
  const signalLink = 'https://signal.me/#u/dasatech.99';

  const handleCopy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(`@${signalUsername}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: '#0c1017',
        borderRadius: 22,
        padding: '28px 28px',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 45px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          marginBottom: 22,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Signal Icon Box */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(29, 78, 216, 0.35)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <SignalIcon size={22} color="#ffffff" />
          </div>

          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: '#38bdf8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 2,
              }}
            >
              DIRECT LEADERSHIP CHANNEL
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              Signal Encrypted Messenger
            </div>
          </div>
        </div>

        {/* Status Pill Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 999,
            padding: '5px 12px',
            fontSize: 11,
            fontWeight: 700,
            color: '#34d399',
            letterSpacing: '0.02em',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
          <span>Verified Active</span>
        </div>
      </div>

      {/* Official Signal Username Bento Box */}
      <div
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: '#64748b',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          OFFICIAL SIGNAL USERNAME
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                color: '#38bdf8',
                fontWeight: 900,
                fontSize: 22,
                userSelect: 'none',
              }}
            >
              @
            </span>
            <span
              style={{
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: '0.02em',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }}
            >
              {signalUsername}
            </span>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              backgroundColor: copied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
              border: copied ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 10,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 700,
              color: copied ? '#34d399' : '#e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {copied ? (
              <>
                <Check size={14} color="#34d399" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 18,
        }}
      >
        {/* Primary Open in Signal App Button */}
        <a
          href={signalLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: '#2563eb',
            backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: '#ffffff',
            borderRadius: 12,
            padding: '12px 18px',
            fontSize: 14,
            fontWeight: 800,
            textDecoration: 'none',
            boxShadow: '0 6px 18px -2px rgba(37, 99, 235, 0.45)',
            border: 'none',
            transition: 'all 0.15s ease',
            cursor: 'pointer',
          }}
        >
          <SignalIcon size={16} color="#ffffff" />
          <span>Open in Signal App</span>
          <ExternalLink size={14} />
        </a>

        {/* Secondary How to Connect Button */}
        <button
          type="button"
          onClick={() => setShowHowTo(!showHowTo)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#cbd5e1',
            borderRadius: 12,
            padding: '12px 18px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <HelpCircle size={16} />
          <span>How to Connect</span>
        </button>
      </div>

      {/* Expandable "How to Connect" Helper Drawer */}
      {showHowTo && (
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 14,
            padding: '16px 18px',
            marginBottom: 18,
            fontSize: 13,
            color: '#cbd5e1',
            lineHeight: 1.6,
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={() => setShowHowTo(false)}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={14} />
          </button>

          <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: 8, fontSize: 13 }}>
            Connecting with DASA TECH on Signal:
          </div>
          <ol style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>
              Download or open the <strong>Signal App</strong> on Android, iOS, or Desktop.
            </li>
            <li>
              Tap the <strong>New Chat</strong> pencil icon and search for username:{' '}
              <span style={{ color: '#ffffff', fontWeight: 700, backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: 4 }}>
                @dasatech.99
              </span>
            </li>
            <li>
              Or simply click <strong>"Open in Signal App"</strong> to launch the direct chat link.
            </li>
            <li>
              Message our executive engineering leadership directly with zero intermediaries.
            </li>
          </ol>
        </div>
      )}

      {/* Security Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: '#64748b',
          fontWeight: 500,
        }}
      >
        <Shield size={14} color="#10b981" />
        <span>End-to-End Encrypted via Signal Protocol. Zero ad tracking.</span>
      </div>
    </div>
  );
}
export default SignalContactCard;
