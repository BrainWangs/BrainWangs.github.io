/**
 * Locale utilities for manual [locale] dynamic routing.
 *
 * Since Astro v7's built-in i18n does not generate non-default-locale pages
 * in SSG mode, all pages live under `src/pages/[locale]/` and use these
 * helpers instead of `Astro.currentLocale` / `getRelativeLocaleUrl`.
 */

export const LOCALES = ["zh", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh";

/** Shared getStaticPaths for pages at src/pages/[locale]/. */
export function localePaths() {
  return LOCALES.map(locale => ({ params: { locale } }));
}

/** Get the current locale from Astro.params. */
export function getLocale(params: { locale?: string }): Locale {
  if (params.locale && LOCALES.includes(params.locale as Locale)) {
    return params.locale as Locale;
  }
  return DEFAULT_LOCALE;
}

/** Build a locale-aware URL: "/zh/posts" from locale "zh" and path "posts". */
export function localeUrl(locale: Locale, path?: string): string {
  const base = `/${locale}`;
  if (!path) return base;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** Get the other locale for language switching. */
export function otherLocale(locale: Locale): Locale {
  return locale === "zh" ? "en" : "zh";
}
