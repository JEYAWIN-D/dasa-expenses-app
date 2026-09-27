import React from 'react';
import { Modal } from './Modal.jsx';
import { Keyboard, Command, Navigation, FilePlus, Sparkles, X } from 'lucide-react';

export function KeyboardShortcutsModal({ isOpen, onClose }) {
  const shortcutGroups = [
    {
      category: 'General & Global',
      icon: <Command size={16} color="var(--primary)" />,
      shortcuts: [
        { keys: ['?'], description: 'Open this Keyboard Shortcuts cheat sheet' },
        { keys: ['Ctrl', 'K'], description: 'Open Global Command Palette & Quick Search' },
        { keys: ['Esc'], description: 'Close any active modal, popup, or preview' },
        { keys: ['Ctrl', 'S'], description: 'Submit / Save form (in creation and edit pages)' },
      ],
    },
    {
      category: 'Quick Module Navigation',
      icon: <Navigation size={16} color="#059669" />,
      shortcuts: [
        { keys: ['Alt', '1'], description: 'Go to Dashboard' },
        { keys: ['Alt', '2'], description: 'Go to Clients' },
        { keys: ['Alt', '3'], description: 'Go to Quotations' },
        { keys: ['Alt', '4'], description: 'Go to Invoices & Bills' },
        { keys: ['Alt', '5'], description: 'Go to Payments' },
        { keys: ['Alt', '6'], description: 'Go to Expenses' },
        { keys: ['Alt', '7'], description: 'Go to Vendors' },
        { keys: ['Alt', '8'], description: 'Go to Financial Reports' },
        { keys: ['Alt', '9'], description: 'Go to System Settings' },
      ],
    },
    {
      category: 'Fast Creation Actions',
      icon: <FilePlus size={16} color="#7c3aed" />,
      shortcuts: [
        { keys: ['Alt', 'N'], description: 'Create New Quotation' },
        { keys: ['Alt', 'I'], description: 'Create New Invoice' },
        { keys: ['Alt', 'C'], description: 'Open Add New Client' },
        { keys: ['Ctrl', 'P'], description: 'Print or Preview Document' },
      ],
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts & Productivity Hub" maxWidth={680}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          Navigate and operate the entire system at lightning speed without touching your mouse.
        </p>

        {shortcutGroups.map((group, gIdx) => (
          <div key={gIdx} style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 700, fontSize: 13, color: 'var(--text-main)' }}>
              {group.icon}
              <span>{group.category}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
              {group.shortcuts.map((sc, scIdx) => (
                <div
                  key={scIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: scIdx < group.shortcuts.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}
                >
                  <span style={{ fontSize: 13, color: '#334155' }}>{sc.description}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {sc.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        style={{
                          background: '#ffffff',
                          border: '1.5px solid #cbd5e1',
                          borderBottom: '2.5px solid #94a3b8',
                          borderRadius: 6,
                          padding: '3px 8px',
                          fontSize: 11,
                          fontWeight: 800,
                          color: '#0f172a',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
