import { useEffect, useState } from 'react';

type MediaQuery = string | { minWidth?: number; maxWidth?: number };

function getMediaQuery(query: MediaQuery): string {
  if (typeof query === 'string') {
    return query;
  }

  const queries: string[] = [];
  if (query.minWidth) queries.push(`(min-width: ${query.minWidth}px)`);
  if (query.maxWidth) queries.push(`(max-width: ${query.maxWidth}px)`);

  return queries.join(' and ');
}

export function useMediaQuery(query: MediaQuery): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(getMediaQuery(query));
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

// Convenience hooks for common breakpoints
export function useIsMobile() {
  return useMediaQuery({ maxWidth: 768 });
}

export function useIsTablet() {
  return useMediaQuery({ minWidth: 769, maxWidth: 1024 });
}

export function useIsDesktop() {
  return useMediaQuery({ minWidth: 1025 });
}
