// Configuração de i18n para Next.js 15
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Idiomas suportados
export const locales = ['pt', 'en', 'es', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'pt';

export const localeNames: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

export default getRequestConfig(async ({ locale }) => {
  // Validar locale
  const validLocale = locale || defaultLocale;
  
  if (!locales.includes(validLocale as Locale)) {
    notFound();
  }

  return {
    locale: validLocale,
    messages: (await import(`../../messages/${validLocale}.json`)).default,
  };
});
