/**
 * Hook para gerenciar diálogos de confirmação
 * Simplifica o uso de confirmações em componentes
 */

'use client';

import { useState } from 'react';

interface UseConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = (options: UseConfirmOptions): Promise<boolean> => {
    setIsOpen(true);
    
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
      setIsOpen(false);
      setResolvePromise(null);
    }
  };

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false);
      setIsOpen(false);
      setResolvePromise(null);
    }
  };

  return {
    confirm,
    isOpen,
    isLoading,
    setIsLoading,
    handleConfirm,
    handleCancel,
    setIsOpen,
  };
}
