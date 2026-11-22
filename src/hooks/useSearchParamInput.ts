import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * State for a text input that mirrors a URL search param. The URL is only updated once
 * the user pauses typing, and with router.replace, so typing doesn't create a history
 * entry (and a feed request) per keystroke.
 */
export function useSearchParamInput(paramKey: string, delayMs = 400) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get(paramKey) ?? '';

  const [value, setValue] = useState(urlValue);
  const [seenUrlValue, setSeenUrlValue] = useState(urlValue);
  const [lastWritten, setLastWritten] = useState(urlValue);

  // The URL changed. If it wasn't our own write (e.g. "Clear filters", back/forward),
  // show the new value. Our own writes are skipped so characters typed while the
  // navigation was in flight aren't lost.
  if (urlValue !== seenUrlValue) {
    setSeenUrlValue(urlValue);
    if (urlValue !== lastWritten) {
      setValue(urlValue);
    }
  }

  useEffect(() => {
    const next = value.trim();
    if (next === urlValue) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) {
        params.set(paramKey, next);
      } else {
        params.delete(paramKey);
      }
      setLastWritten(next);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, urlValue, searchParams, pathname, router, paramKey, delayMs]);

  return [value, setValue] as const;
}
