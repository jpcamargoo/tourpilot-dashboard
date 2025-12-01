'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { ConfirmDialog } from './confirm-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface SessaoDeleteButtonProps {
  sessaoId: string;
  tourName: string;
}

export function SessaoDeleteButton({ sessaoId, tourName }: SessaoDeleteButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/sessoes?id=${sessaoId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao deletar sessão');
      }

      toast.success('Sessão deletada com sucesso!');
      router.refresh();
      setShowConfirm(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar sessão');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShowConfirm(true)}
        className="w-full"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Deletar Sessão
      </Button>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleDelete}
        title="Deletar sessão?"
        description={`Tem certeza que deseja deletar a sessão de "${tourName}"? Esta ação não pode ser desfeita.`}
        variant="destructive"
        isLoading={isDeleting}
      />
    </>
  );
}
