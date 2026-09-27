import React, { Suspense, useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../common/Sidebar.jsx';
import { Navbar } from '../common/Navbar.jsx';
import { KeyboardShortcutsModal } from '../common/KeyboardShortcutsModal.jsx';
import { CommandPaletteModal } from '../common/CommandPaletteModal.jsx';

export function DashboardLayout() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInputFocused =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeTag === 'select' ||
        document.activeElement?.isContentEditable;

      // Ctrl+K or Cmd+K -> Command Palette
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      // '?' (Shift + /) to open Shortcuts Cheatsheet (only when not typing in an input)
      if (e.key === '?' && !isInputFocused) {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      // Alt shortcuts (work even in inputs if needed, or non-inputs)
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case '1':
            e.preventDefault();
            navigate('/dashboard');
            break;
          case '2':
            e.preventDefault();
            navigate('/clients');
            break;
          case '3':
            e.preventDefault();
            navigate('/quotations');
            break;
          case '4':
            e.preventDefault();
            navigate('/invoices');
            break;
          case '5':
            e.preventDefault();
            navigate('/payments');
            break;
          case '6':
            e.preventDefault();
            navigate('/expenses');
            break;
          case '7':
            e.preventDefault();
            navigate('/vendors');
            break;
          case '8':
            e.preventDefault();
            navigate('/reports');
            break;
          case '9':
            e.preventDefault();
            navigate('/settings');
            break;
          case 'n':
            e.preventDefault();
            navigate('/quotations/new');
            break;
          case 'i':
            e.preventDefault();
            navigate('/invoices/new');
            break;
          case 'c':
            e.preventDefault();
            navigate('/clients');
            break;
          case 'k':
            e.preventDefault();
            setCommandPaletteOpen(true);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [navigate]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar
          onOpenShortcuts={() => setShortcutsOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          <Suspense
            fallback={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 300,
                  color: 'var(--text-muted)',
                  fontSize: 14,
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    border: '3px solid var(--border-subtle)',
                    borderTopColor: 'var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <span>Loading module...</span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Modals for Shortcuts and Command Palette */}
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenShortcuts={() => {
          setCommandPaletteOpen(false);
          setShortcutsOpen(true);
        }}
      />
    </div>
  );
}
