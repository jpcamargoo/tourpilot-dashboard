'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function ScrapingButton() {
  const router = useRouter();
  const [executando, setExecutando] = useState(false);

  const handleScraping = async () => {
    setExecutando(true);

    try {
      const response = await fetch('/api/reviews/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        toast.error('Sessão expirada', {
          description: 'Por favor, faça login novamente',
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Scraping executado com sucesso!', {
          description: data.message || `${data.data?.novos || 0} novos reviews`,
        });
        router.refresh();
      } else {
        toast.error(data.error || 'Erro ao executar scraping', {
          description: data.details || 'Verifique os logs para mais detalhes',
        });
      }
    } catch (error) {
      console.error('Erro ao executar scraping:', error);
      toast.error('Erro ao executar scraping', {
        description: 'Verifique sua conexão e tente novamente',
      });
    } finally {
      setExecutando(false);
    }
  };

  return (
    <Button 
      onClick={handleScraping} 
      disabled={executando}
      className="bg-blue-600 hover:bg-blue-700"
    >
      {executando ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Executando...
        </>
      ) : (
        'Executar Scraping'
      )}
    </Button>
  );
}
