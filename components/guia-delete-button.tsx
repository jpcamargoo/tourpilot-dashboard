'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { ConfirmDialog } from './confirm-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface GuiaDeleteButtonProps {
  guiaId: string;
  guiaName: string;
}

export function GuiaDeleteButton({ guiaId, guiaName }: GuiaDeleteButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/guias?id=${guiaId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao deletar guia');
      }

      toast.success('Guia deletado com sucesso!');
      router.refresh();
      setShowConfirm(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar guia');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleDelete}
        title="Deletar guia?"
        description={`Tem certeza que deseja deletar "${guiaName}"? Esta ação não pode ser desfeita.`}
        variant="destructive"
        isLoading={isDeleting}
      />
    </>
  );
}

