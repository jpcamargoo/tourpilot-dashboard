'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error('Error boundary caught:', error);

    // Reportar ao Sentry em produção
    if (typeof window !== 'undefined') {
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error);
      }).catch(() => { /* Sentry não disponível */ });
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Ícone de erro */}
        <div className="flex justify-center">
          <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
        </div>

        {/* Mensagem */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-gray-900">
            Algo deu errado
          </h2>
          <p className="text-gray-600 text-lg">
            Desculpe, ocorreu um erro inesperado. Nossa equipe foi notificada e estamos trabalhando para resolver.
          </p>
          
          {/* Detalhes do erro em desenvolvimento */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm font-mono text-red-800 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            size="lg" 
            onClick={reset}
            className="w-full sm:w-auto"
          >
            <RefreshCcw className="w-5 h-5 mr-2" />
            Tentar Novamente
          </Button>
          <Link href="/dashboard">
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto"
            >
              <Home className="w-5 h-5 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>

        {/* Informações de suporte */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Se o problema persistir, entre em contato com o suporte técnico.
          </p>
        </div>
      </div>
    </div>
  );
}
