'use client'

import { useState, useCallback, createContext, useContext } from 'react'
import en from '../../messages/en.json'
import es from '../../messages/es.json'
import ro from '../../messages/ro.json'
import ca from '../../messages/ca.json'
import it from '../../messages/it.json'
import fr from '../../messages/fr.json'

export type Locale = 'en' | 'es' | 'ro' | 'ca' | 'it' | 'fr'

const messages: Record<Locale, any> = { en, es, ro, ca, it, fr }

export const LANGUAGES: { code: Locale; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'ca', name: 'Català', flag: '🏴' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
]

// Get nested value from object by dot-notation path
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) || path
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string>) => string
  tc: (categoryKey: string) => string
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
  tc: (key) => key,
})

export function useI18n() {
  return useContext(I18nContext)
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en'
    const saved = localStorage.getItem('quizblitz-locale') as Locale
    if (saved && messages[saved]) return saved
    const browserLang = navigator.language.split('-')[0] as Locale
    if (messages[browserLang]) return browserLang
    return 'en'
  })

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('quizblitz-locale', newLocale)
  }, [])

  const t = useCallback((key: string, params?: Record<string, string>): string => {
    let value = getNestedValue(messages[locale], key)
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, v)
      })
    }
    return value
  }, [locale])

  // Translate category name by its id
  const tc = useCallback((categoryId: string): string => {
    return getNestedValue(messages[locale], `categories.${categoryId}`) || categoryId
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, tc }}>
      {children}
    </I18nContext.Provider>
  )
}
