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
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Scraping executado com sucesso!', {
          description: data.message || `${data.total || 0} reviews processadas`,
        });
        router.refresh();
      } else {
        toast.error(data.error || 'Erro ao executar scraping');
      }
    } catch (error) {
      console.error('Erro ao executar scraping:', error);
      toast.error('Erro ao executar scraping. Tente novamente.');
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
