'use client';

import { Button } from '@/components/ui/button';
import { ServerCrash, Home, Mail } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
          <div className="max-w-md w-full text-center space-y-8">
            {/* Ícone de erro crítico */}
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-gray-800 rounded-full shadow-2xl flex items-center justify-center border-4 border-red-500">
                <ServerCrash className="w-16 h-16 text-red-500" />
              </div>
            </div>

            {/* Mensagem */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-white">
                Erro Crítico do Sistema
              </h2>
              <p className="text-gray-300 text-lg">
                Ocorreu um erro grave na aplicação. Por favor, tente recarregar a página.
              </p>
              
              {/* ID do erro */}
              {error.digest && (
                <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded-lg">
                  <p className="text-xs text-gray-400">
                    Código de erro: <span className="font-mono text-red-400">{error.digest}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg" 
                onClick={reset}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              >
                Recarregar Página
              </Button>
              <Link href="/">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto text-white border-gray-600 hover:bg-gray-800"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Página Inicial
                </Button>
              </Link>
            </div>

            {/* Suporte */}
            <div className="pt-8 border-t border-gray-700">
              <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                Precisa de ajuda? Contate o suporte técnico
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
