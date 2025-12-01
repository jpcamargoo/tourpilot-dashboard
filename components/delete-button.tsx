/**
 * Botão de deletar com confirmação
 * Exemplo de uso de ConfirmDialog antes de ação destrutiva
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteButtonProps {
  itemId: string;
  itemType: 'tour' | 'guia' | 'sessao' | 'transacao';
  itemName: string;
  onSuccess?: () => void;
}

export function DeleteButton({ itemId, itemType, itemName, onSuccess }: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const endpoints = {
        tour: '/api/tours',
        guia: '/api/guias',
        sessao: '/api/sessoes',
        transacao: '/api/transacoes',
      };

      const response = await fetch(`${endpoints[itemType]}?id=${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`${itemType} deletado com sucesso!`);
        setShowConfirm(false);
        onSuccess?.();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao deletar');
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        variant="destructive"
        size="sm"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Deletar
      </Button>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleDelete}
        title={`Deletar ${itemType}?`}
        description={`Tem certeza que deseja deletar "${itemName}"? Esta ação não pode ser desfeita.`}
        confirmText="Sim, deletar"
        cancelText="Cancelar"
        variant="destructive"
        isLoading={isDeleting}
      />
    </>
  );
}
