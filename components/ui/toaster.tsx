/**
 * Componente Toaster - Provider de notificações toast
 * Usar no layout principal para disponibilizar em toda aplicação
 */

'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
        className: 'group',
        descriptionClassName: 'group-[.toast]:text-muted-foreground',
      }}
    />
  );
}
