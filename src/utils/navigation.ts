import { useState, useEffect } from 'react';

export function getCurrentPath(): string {
  return window.location.pathname || '/';
}

export function navigateTo(path: string) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export function useCurrentPath() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return currentPath;
}
