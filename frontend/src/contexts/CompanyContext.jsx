import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const CompanyContext = createContext(null);

const CACHE_KEY = 'bizfinance_company_branding';

function getCachedCompany() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (parsed) {
      if (parsed.city && parsed.city.includes('BanERODEgalore')) {
        parsed.city = 'Erode';
      }
      if (!parsed.logoUrl) {
        parsed.logoUrl = '/dasa-tech-logo.png';
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

export function CompanyProvider({ children }) {
  const [company, setCompany] = useState(() => getCachedCompany());
  const [loading, setLoading] = useState(!getCachedCompany());

  const fetchCompany = useCallback(async () => {
    try {
      const token = localStorage.getItem('bizfinance_token') || localStorage.getItem('token');
      let profileData = null;

      // 1. Try authenticated endpoint if token exists
      if (token) {
        try {
          const res = await api.get('/settings/company');
          if (res && res.data) {
            profileData = res.data;
          }
        } catch {
          // Token might be expired or invalid, fallback to public
        }
      }

      // 2. Fallback to public branding endpoint
      if (!profileData) {
        const res = await api.get('/settings/company/public');
        if (res && res.data) {
          profileData = res.data;
        }
      }

      if (profileData) {
        setCompany(profileData);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(profileData));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn('Could not load company branding profile:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompany();

    // Listen to local storage or custom branding update events
    const handleBrandingChange = () => {
      fetchCompany();
    };

    window.addEventListener('company-branding-updated', handleBrandingChange);
    return () => {
      window.removeEventListener('company-branding-updated', handleBrandingChange);
    };
  }, [fetchCompany]);

  const reloadCompany = useCallback(async () => {
    await fetchCompany();
  }, [fetchCompany]);

  const updateCompany = useCallback((newProfile) => {
    setCompany(newProfile);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(newProfile));
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event('company-branding-updated'));
  }, []);

  useEffect(() => {
    const name = company?.companyName?.trim() || 'DASA TECH';
    document.title = `${name} | Quotation, Billing & Finance Management`;

    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    if (company?.logoUrl) {
      link.href = company.logoUrl;
    } else {
      const initial = name.charAt(0).toUpperCase() || 'D';
      link.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%232563eb'/><text x='50%' y='68%' font-size='60' font-weight='bold' fill='white' text-anchor='middle'>${initial}</text></svg>`;
    }
  }, [company?.companyName, company?.logoUrl]);

  return (
    <CompanyContext.Provider
      value={{
        company,
        loading,
        reloadCompany,
        updateCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
