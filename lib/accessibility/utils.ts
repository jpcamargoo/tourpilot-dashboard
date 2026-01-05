// Accessibility utilities and hooks

import { useEffect } from 'react';

/**
 * Announce content to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Hook para anúnciosde navegação
 */
export function useRouteAnnouncement(pathname: string) {
  useEffect(() => {
    const pageTitles: Record<string, string> = {
      '/dashboard': 'Dashboard - Página Principal',
      '/dashboard/guias': 'Gestão de Guias',
      '/dashboard/tours': 'Gestão de Tours',
      '/dashboard/agenda': 'Agenda de Tours',
      '/dashboard/reviews': 'Reviews e Avaliações',
      '/dashboard/financial': 'Controle Financeiro',
      '/dashboard/comparativos': 'Análises Comparativas',
      '/login': 'Página de Login',
    };

    const title = pageTitles[pathname] || 'Página';
    announceToScreenReader(`Navegado para ${title}`);
  }, [pathname]);
}

/**
 * Skip to main content
 */
// Componente JSX movido para components/skip-to-main.tsx
// Use: import { SkipToMainContent } from '@/components/skip-to-main';

/**
 * Focus trap for modals/dialogs
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    }

    firstElement?.focus();
    document.addEventListener('keydown', handleTab);

    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [isActive, ref]);
}

/**
 * Escape key handler
 */
export function useEscapeKey(callback: () => void, isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        callback();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback, isActive]);
}

/**
 * Keyboard navigation for custom components
 */
export const KeyboardNavigation = {
  handleArrowKeys: (
    e: React.KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onSelect: (index: number) => void
  ) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex]?.focus();
        onSelect(nextIndex);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prevIndex]?.focus();
        onSelect(prevIndex);
        break;
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        onSelect(0);
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        onSelect(items.length - 1);
        break;
    }
  },
};

/**
 * Accessible loading state
 */
export function LoadingAnnouncement({ isLoading, message = 'Carregando...' }: { isLoading: boolean; message?: string }) {
  useEffect(() => {
    if (isLoading) {
      announceToScreenReader(message, 'polite');
    }
  }, [isLoading, message]);

  return null;
}

/**
 * Contrast checker utility
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Simple contrast ratio calculator
  // For production, use a library like 'color-contrast-checker'
  
  const getLuminance = (color: string): number => {
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const [r, g, b] = rgb.map(val => {
      const channel = val / 255;
      return channel <= 0.03928
        ? channel / 12.92
        : Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA standards
 */
export function meetsContrastStandards(
  color1: string,
  color2: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(color1, color2);
  
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}
