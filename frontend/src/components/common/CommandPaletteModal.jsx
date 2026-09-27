import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FilePlus,
  Users,
  FileSpreadsheet,
  FileCheck2,
  Receipt,
  Settings,
  BarChart3,
  Palette,
  Keyboard,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export function CommandPaletteModal({ isOpen, onClose, onOpenShortcuts }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const commands = [
    { id: 'new-quote', title: 'Create New Quotation', subtitle: 'Draft scope, line items & AMC terms', icon: <FilePlus size={16} />, action: () => navigate('/quotations/new'), shortcut: 'Alt+N' },
    { id: 'new-inv', title: 'Create New Invoice / Bill', subtitle: 'Issue invoice with tax and payment terms', icon: <FileCheck2 size={16} />, action: () => navigate('/invoices/new'), shortcut: 'Alt+I' },
    { id: 'nav-quotes', title: 'Go to Quotations List', subtitle: 'Browse revisions, sent & approved quotes', icon: <FileSpreadsheet size={16} />, action: () => navigate('/quotations'), shortcut: 'Alt+3' },
    { id: 'nav-invs', title: 'Go to Invoices & Bills', subtitle: 'Monitor payments, overdue & balances', icon: <Receipt size={16} />, action: () => navigate('/invoices'), shortcut: 'Alt+4' },
    { id: 'nav-clients', title: 'Go to Clients Directory', subtitle: 'View customer accounts and contacts', icon: <Users size={16} />, action: () => navigate('/clients'), shortcut: 'Alt+2' },
    { id: 'nav-payments', title: 'View Payments Received', subtitle: 'Payment transactions and receipts', icon: <TrendingUp size={16} />, action: () => navigate('/payments'), shortcut: 'Alt+5' },
    { id: 'nav-reports', title: 'Financial Reports & Analytics', subtitle: 'Sales, revenue and aging analysis', icon: <BarChart3 size={16} />, action: () => navigate('/reports'), shortcut: 'Alt+8' },
    { id: 'nav-appearance', title: 'Theme, Colors & Fonts Settings', subtitle: 'Customize branding, font family and colors', icon: <Palette size={16} />, action: () => navigate('/settings?tab=appearance') },
    { id: 'nav-settings', title: 'Company Profile & Governance', subtitle: 'Logos, seals, numbering and bank details', icon: <Settings size={16} />, action: () => navigate('/settings'), shortcut: 'Alt+9' },
    { id: 'show-shortcuts', title: 'Show All Keyboard Shortcuts', subtitle: 'Open keyboard navigation cheatsheet', icon: <Keyboard size={16} />, action: () => onOpenShortcuts?.(), shortcut: '?' },
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 580,
          backgroundColor: '#ffffff',
          borderRadius: 14,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
          animation: 'fadeIn 0.15s ease',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Search size={20} color="var(--primary)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or jump to page... (e.g. quote, invoice, theme)"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 16,
              fontWeight: 500,
              color: '#0f172a',
            }}
          />
          <kbd
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 11,
              fontWeight: 700,
              color: '#64748b',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
              No matching commands or actions found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                    border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: isSelected ? '#dbeafe' : '#f8fafc',
                        color: isSelected ? 'var(--primary)' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? 'var(--primary)' : '#1e293b' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{item.subtitle}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {item.shortcut && (
                      <kbd
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: 4,
                          padding: '2px 6px',
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#475569',
                        }}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                    <ArrowRight size={14} color={isSelected ? 'var(--primary)' : '#94a3b8'} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            fontSize: 12,
            color: '#64748b',
          }}
        >
          <span>Use <b>↑</b> <b>↓</b> to navigate, <b>Enter</b> to select</span>
          <span>Press <b>?</b> anytime for shortcuts</span>
        </div>
      </div>
    </div>
  );
}
