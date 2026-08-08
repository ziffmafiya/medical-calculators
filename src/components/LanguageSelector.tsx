'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸', id: 'en' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺', id: 'ru' },
    { code: 'uk', label: 'Українська', flag: '🇺🇦', id: 'uk' }
  ];

  const currentLang = languages.find(l => l.id === language) || languages[1];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--gray-300)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:bg-[var(--accent)] transition-colors duration-150 h-10 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[rgba(54,191,250,0.24)] focus-visible:border-[var(--primary)]"
      >
        <span className="text-base">{currentLang.flag}</span>
        <span className="hidden sm:inline uppercase">{currentLang.code}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 bg-[var(--gray-900)] border border-[var(--border)] rounded-lg shadow-[var(--shadow-lg)] z-50 py-1 animate-slide-up">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setLanguage(lang.id as any);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-[var(--accent)] transition-colors duration-150 text-[var(--foreground)] focus-visible:outline-hidden focus-visible:bg-[var(--accent)]"
            >
              <span className="text-base">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.label}</span>
              {language === lang.id && (
                <svg className="w-4 h-4 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}