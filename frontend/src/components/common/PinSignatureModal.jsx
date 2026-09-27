import React, { useState } from 'react';
import { Modal } from './Modal.jsx';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';

export function PinSignatureModal({ isOpen, onClose, onConfirm, title = 'Apply Digital Signature', documentName = '' }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('Please enter a 4-digit authorization PIN');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onConfirm(pin);
      setPin('');
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid PIN. Authorization failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 4);
    setPin(clean);
    if (error) setError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setPin('');
        setError('');
        onClose();
      }}
      title={title}
      maxWidth={420}
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || pin.length !== 4}
          >
            {loading ? 'Verifying...' : 'Authorize & Sign'}
          </button>
        </>
      }
    >
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            backgroundColor: '#eff6ff',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '2px solid #bfdbfe',
          }}
        >
          <ShieldCheck size={28} />
        </div>

        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Digital Signature Authorization</h4>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          {documentName ? `Applying official cryptographic signature to ${documentName}.` : 'Please enter your authorized 4-digit PIN to sign this document.'}
        </p>

        {/* PIN Input with visual indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
          {[0, 1, 2, 3].map((index) => {
            const hasDigit = pin.length > index;
            return (
              <div
                key={index}
                style={{
                  width: 44,
                  height: 50,
                  borderRadius: 8,
                  border: `2px solid ${hasDigit ? 'var(--primary)' : 'var(--border-strong)'}`,
                  backgroundColor: hasDigit ? '#eff6ff' : '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'var(--primary)',
                  boxShadow: hasDigit ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
                }}
              >
                {hasDigit ? '●' : ''}
              </div>
            );
          })}
        </div>

        {/* Hidden/accessible real input */}
        <div style={{ position: 'relative', width: 220, margin: '0 auto 16px' }}>
          <div
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          >
            <Lock size={15} />
          </div>
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => handleDigitChange(e.target.value)}
            placeholder="Enter 4-digit PIN"
            autoFocus
            className="form-input"
            style={{
              textAlign: 'center',
              paddingLeft: 34,
              letterSpacing: '4px',
              fontWeight: 700,
              fontSize: 16,
            }}
          />
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              color: 'var(--danger)',
              fontSize: 13,
              fontWeight: 500,
              backgroundColor: 'var(--danger-light)',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid var(--danger-border)',
            }}
          >
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-subtle)' }}>
          Default demo PIN is <strong>1234</strong> (can be changed in Settings)
        </div>
      </div>
    </Modal>
  );
}
