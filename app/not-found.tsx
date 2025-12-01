import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Ilustração 404 */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-blue-200 select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center">
              <span className="text-6xl">🗺️</span>
            </div>
          </div>
        </div>

        {/* Mensagem */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-gray-900">
            Página não encontrada
          </h2>
          <p className="text-gray-600 text-lg">
            Ops! Parece que você se perdeu no tour. Esta página não existe ou foi movida.
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className="w-5 h-5 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Página Anterior
          </Button>
        </div>

        {/* Links úteis */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Você pode estar procurando por:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/dashboard/tours">
              <Button variant="link" size="sm">Tours</Button>
            </Link>
            <Link href="/dashboard/guias">
              <Button variant="link" size="sm">Guias</Button>
            </Link>
            <Link href="/dashboard/agenda">
              <Button variant="link" size="sm">Agenda</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
