import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DasaLogo } from '../common/DasaLogo.jsx';
import { DemoRequestModal } from './DemoRequestModal.jsx';
import {
  Phone,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Globe,
  Lock,
} from 'lucide-react';

export function MarketingLayout({ children }) {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Features', to: '/features' },
    { label: 'Solutions', to: '/solutions' },
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'Product Tour', to: '/product-tour', isNew: true },
    { label: 'Pricing', to: '/pricing' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa', color: '#09090b', position: 'relative' }}>
      
      {/* Sleek Minimalist Announcement Banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, #1e3a8a 0%, #1d4ed8 50%, #0891b2 100%)',
          color: '#ffffff',
          padding: '6px 20px',
          fontSize: 12,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          position: 'relative',
          zIndex: 60,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '2px 8px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34d399', animation: 'pulse 1.8s infinite' }} />
            DASA TECH Product
          </span>
          <span>
            From Quotation to Project Handover • Hotline:{' '}
            <a href="tel:+917639930148" style={{ color: '#ffffff', fontWeight: 800, textDecoration: 'underline' }}>
              +91 76399 30148
            </a>
          </span>
          <span style={{ opacity: 0.5 }}>|</span>
          <a
            href="https://wa.me/917639930148?text=Hello%20DASA%20TECH%2C%20I%20am%20interested%20in%20DASA%20EXPENCES."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#a7f3d0',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              textDecoration: 'none',
            }}
          >
            <MessageSquare size={11} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Trendy Floating Glass Header */}
      <header
        style={{
          position: 'sticky',
          top: 12,
          zIndex: 50,
          padding: '0 20px',
          width: '100%',
          maxWidth: 1240,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 999,
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
            padding: '8px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            transition: 'all 0.25s ease',
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <DasaLogo size="sm" showTagline={false} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
            className="marketing-desktop-nav"
          >
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: active ? 800 : 600,
                    color: active ? '#2563eb' : '#475569',
                    backgroundColor: active ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{link.label}</span>
                  {link.isNew && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: 999,
                        background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                        color: '#ffffff',
                        letterSpacing: '0.04em',
                      }}
                    >
                      TOUR
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              to="/login"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#334155',
                padding: '7px 16px',
                borderRadius: 999,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                backgroundColor: 'transparent',
              }}
            >
              Sign In
            </Link>

            <button
              onClick={() => setDemoModalOpen(true)}
              className="btn-trendy-primary"
              style={{
                padding: '8px 18px',
                fontSize: 13,
              }}
            >
              <span>Request a Demo</span>
              <ArrowRight size={14} />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="marketing-mobile-btn"
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#334155',
                padding: 6,
              }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div
            style={{
              marginTop: 8,
              padding: '16px 20px',
              backgroundColor: '#ffffff',
              borderRadius: 20,
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '9px 14px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: isActive(link.to) ? 800 : 600,
                  color: isActive(link.to) ? '#2563eb' : '#334155',
                  backgroundColor: isActive(link.to) ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 4, display: 'flex', gap: 10 }}>
              <Link
                to="/login"
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '10px',
                  borderRadius: 999,
                  border: '1px solid #cbd5e1',
                  fontWeight: 700,
                  textDecoration: 'none',
                  color: '#334155',
                  fontSize: 13,
                }}
              >
                Sign In
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setDemoModalOpen(true);
                }}
                className="btn-trendy-primary"
                style={{ flex: 1, padding: '10px', fontSize: 13 }}
              >
                Request Demo
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Trendy Floating WhatsApp Button */}
      <a
        href="https://wa.me/917639930148?text=Hello%20DASA%20TECH%2C%20I%20am%20interested%20in%20DASA%20EXPENCES%20and%20would%20like%20to%20request%20a%20demo."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-floating"
        title="Chat on WhatsApp (+91 76399 30148)"
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 8px #ffffff',
            animation: 'pulse 1.5s infinite',
          }}
        />
        <MessageSquare size={16} />
        <span>Chat on WhatsApp</span>
      </a>

      {/* Trendy Dark Titanium SaaS Footer */}
      <footer
        style={{
          backgroundColor: '#0a0d14',
          color: '#94a3b8',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '80px 24px 36px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative radial light */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 900,
            height: 300,
            background: 'radial-gradient(ellipse at bottom, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 48,
              marginBottom: 56,
            }}
          >
            {/* Column 1: Brand & Ownership */}
            <div style={{ gridColumn: 'span 1.5' }}>
              <DasaLogo size="lg" lightMode={true} />
              <p style={{ marginTop: 16, fontSize: 13, lineHeight: 1.7, color: '#94a3b8', maxWidth: 340 }}>
                From Quotation to Project Handover. Every Rupee Accounted For.
                The premier fintech SaaS for software companies, agencies, contractors, and consultancies.
              </p>

              {/* DASA TECH Ownership Badge */}
              <div
                style={{
                  marginTop: 24,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 14,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  DEVELOPED & OWNED BY
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  DASA TECH
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  Enterprise Cloud & Software Engineering
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
                  <a
                    href="https://dasatech.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#38bdf8',
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      textDecoration: 'none',
                    }}
                  >
                    <span>dasatech.in</span>
                    <ExternalLink size={12} />
                  </a>
                  <a
                    href="tel:+917639930148"
                    style={{ color: '#cbd5e1', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <Phone size={12} />
                    <span>+91 76399 30148</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Product Modules */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#ffffff', letterSpacing: '0.08em', marginBottom: 18, textTransform: 'uppercase' }}>
                PRODUCT
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11, fontSize: 13 }}>
                <li><Link to="/features#quotations" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>Quotation Management</Link></li>
                <li><Link to="/features#projects" style={{ color: '#94a3b8', textDecoration: 'none' }}>Project Governance</Link></li>
                <li><Link to="/features#split-payments" style={{ color: '#94a3b8', textDecoration: 'none' }}>Advance Split Receipts</Link></li>
                <li><Link to="/features#milestones" style={{ color: '#94a3b8', textDecoration: 'none' }}>Custom Milestones</Link></li>
                <li><Link to="/features#expenses" style={{ color: '#94a3b8', textDecoration: 'none' }}>Project Expense Ledger</Link></li>
                <li><Link to="/features#cash-bank" style={{ color: '#94a3b8', textDecoration: 'none' }}>Cash & Bank Accounts</Link></li>
                <li><Link to="/features#handover" style={{ color: '#94a3b8', textDecoration: 'none' }}>Handover Verification Gate</Link></li>
                <li><Link to="/product-tour" style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none' }}>Interactive Tour (10 Screens) →</Link></li>
              </ul>
            </div>

            {/* Column 3: Solutions */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#ffffff', letterSpacing: '0.08em', marginBottom: 18, textTransform: 'uppercase' }}>
                SOLUTIONS
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11, fontSize: 13 }}>
                <li><Link to="/solutions#software" style={{ color: '#94a3b8', textDecoration: 'none' }}>Software Companies & IT</Link></li>
                <li><Link to="/solutions#agencies" style={{ color: '#94a3b8', textDecoration: 'none' }}>Digital & Creative Agencies</Link></li>
                <li><Link to="/solutions#contractors" style={{ color: '#94a3b8', textDecoration: 'none' }}>Civil & EPC Contractors</Link></li>
                <li><Link to="/solutions#consultancies" style={{ color: '#94a3b8', textDecoration: 'none' }}>Consultancies & Advisory</Link></li>
                <li><Link to="/solutions#startups" style={{ color: '#94a3b8', textDecoration: 'none' }}>Startups & Service Ventures</Link></li>
                <li><Link to="/pricing" style={{ color: '#94a3b8', textDecoration: 'none' }}>Plans & Enterprise Hosting</Link></li>
              </ul>
            </div>

            {/* Column 4: Trust & Company */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#ffffff', letterSpacing: '0.08em', marginBottom: 18, textTransform: 'uppercase' }}>
                TRUST & LEGAL
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11, fontSize: 13 }}>
                <li><Link to="/security" style={{ color: '#94a3b8', textDecoration: 'none' }}>Security & Tenant Isolation</Link></li>
                <li><Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</Link></li>
                <li><Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms of Service</Link></li>
                <li><Link to="/faq" style={{ color: '#94a3b8', textDecoration: 'none' }}>Frequently Asked Questions</Link></li>
                <li><Link to="/about" style={{ color: '#94a3b8', textDecoration: 'none' }}>About DASA EXPENCES</Link></li>
                <li><Link to="/contact" style={{ color: '#94a3b8', textDecoration: 'none' }}>Contact Sales & Support</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Row */}
          <div
            style={{
              paddingTop: 28,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              fontSize: 12,
              color: '#64748b',
            }}
          >
            <div>
              © {new Date().getFullYear()} <strong>DASA EXPENCES</strong>. Developed and Owned by{' '}
              <a href="https://dasatech.in" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontWeight: 700 }}>
                DASA TECH
              </a>
              . All rights reserved.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <span>Erode, Tamil Nadu, India</span>
              <a href="tel:+917639930148" style={{ color: '#94a3b8', textDecoration: 'none' }}>+91 76399 30148</a>
              <Link to="/login" style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none' }}>
                Launch Web App →
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Demo Request Modal */}
      <DemoRequestModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </div>
  );
}
