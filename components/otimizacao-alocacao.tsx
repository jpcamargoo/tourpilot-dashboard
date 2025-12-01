'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Zap, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Sugestao {
  sessaoId: string;
  guiaId: string;
  guiaSugerido: string;
  tourNome: string;
  dataHora: string;
  motivo: string;
}

interface OtimizacaoAlocacaoProps {
  sessoesSemGuia: number;
  sugestoes: Sugestao[];
}

export function OtimizacaoAlocacao({ sessoesSemGuia, sugestoes }: OtimizacaoAlocacaoProps) {
  const router = useRouter();
  const [alocando, setAlocando] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<{ sessaoId: string; guiaId: string; guiaNome: string } | null>(null);

  const handleAlocarClick = (sessaoId: string, guiaId: string, guiaNome: string) => {
    setSelectedAllocation({ sessaoId, guiaId, guiaNome });
    setConfirmOpen(true);
  };

  const handleAlocar = async () => {
    if (!selectedAllocation) return;
    
    const { sessaoId, guiaId, guiaNome } = selectedAllocation;
    setAlocando(sessaoId);
    
    try {
      const response = await fetch('/api/scheduling/allocate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessaoId, guiaId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${guiaNome} alocado com sucesso!`);
        router.refresh();
      } else {
        toast.error(data.error || 'Erro ao alocar guia');
      }
    } catch (error) {
      console.error('Erro ao alocar guia:', error);
      toast.error('Erro ao alocar guia. Tente novamente.');
    } finally {
      setAlocando(null);
      setConfirmOpen(false);
      setSelectedAllocation(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Card de Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Otimização Automática de Alocação
          </CardTitle>
          <CardDescription>
            Sistema de sugestão inteligente de guias para sessões sem alocação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-700">Sessões sem guia</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">
                {sessoesSemGuia}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Sugestões disponíveis</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {sugestoes.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Sugestões */}
      {sugestoes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Sugestões de Alocação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sugestoes.map((sugestao) => (
                <div
                  key={sugestao.sessaoId}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {new Date(sugestao.dataHora).toLocaleDateString('pt-BR', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(sugestao.dataHora).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">
                        {sugestao.tourNome}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-medium">
                          {sugestao.guiaSugerido}
                        </span>
                        <span className="text-gray-500">—</span>
                        <span className="text-gray-600">{sugestao.motivo}</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="ml-4"
                      onClick={() => handleAlocarClick(sugestao.sessaoId, sugestao.guiaId, sugestao.guiaSugerido)}
                      disabled={alocando === sugestao.sessaoId}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {alocando === sugestao.sessaoId ? 'Alocando...' : 'Alocar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {sessoesSemGuia === 0
                ? 'Todas as sessões já possuem guias alocados!'
                : 'Nenhuma sugestão disponível no momento'}
            </p>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleAlocar}
        title="Alocar guia?"
        description={
          selectedAllocation
            ? `Tem certeza que deseja alocar ${selectedAllocation.guiaNome} para esta sessão?`
            : ''
        }
        confirmText="Alocar"
        variant="default"
        isLoading={alocando !== null}
      />
    </div>
  );
}
