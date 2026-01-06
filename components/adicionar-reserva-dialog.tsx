'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AdicionarReservaDialogProps {
  sessaoId: string;
  capacidadeMax: number;
  ocupacaoAtual: number;
}

export function AdicionarReservaDialog({
  sessaoId,
  capacidadeMax,
  ocupacaoAtual,
}: AdicionarReservaDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    visitante: {
      nome: '',
      email: '',
      telefone: '',
      pais: '',
      idioma: 'pt',
      cidade: '',
    },
    numPessoas: 1,
    valorTotal: 0,
    status: 'CONFIRMADA',
    observacoes: '',
  });

  const paisesComuns = [
    { value: 'BR', label: 'Brasil' },
    { value: 'PT', label: 'Portugal' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'ES', label: 'Espanha' },
    { value: 'FR', label: 'França' },
    { value: 'UK', label: 'Reino Unido' },
    { value: 'DE', label: 'Alemanha' },
    { value: 'IT', label: 'Itália' },
    { value: 'AR', label: 'Argentina' },
    { value: 'MX', label: 'México' },
  ];

  const idiomasComuns = [
    { value: 'pt', label: 'Português' },
    { value: 'en', label: 'Inglês' },
    { value: 'es', label: 'Espanhol' },
    { value: 'fr', label: 'Francês' },
    { value: 'de', label: 'Alemão' },
    { value: 'it', label: 'Italiano' },
  ];

  const statusOptions = [
    { value: 'CONFIRMADA', label: 'Confirmada' },
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'COMPLETADA', label: 'Completada' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (!formData.visitante.nome) {
        toast.error('Nome do visitante é obrigatório');
        setLoading(false);
        return;
      }

      if (formData.numPessoas < 1) {
        toast.error('Número de pessoas deve ser maior que zero');
        setLoading(false);
        return;
      }

      const vagasDisponiveis = capacidadeMax - ocupacaoAtual;
      if (formData.numPessoas > vagasDisponiveis) {
        toast.error(`Apenas ${vagasDisponiveis} vaga(s) disponível(is)`);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessaoTourId: sessaoId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar reserva');
      }

      toast.success('Reserva criada com sucesso!');
      setOpen(false);
      
      // Resetar formulário
      setFormData({
        visitante: {
          nome: '',
          email: '',
          telefone: '',
          pais: '',
          idioma: 'pt',
          cidade: '',
        },
        numPessoas: 1,
        valorTotal: 0,
        status: 'CONFIRMADA',
        observacoes: '',
      });

      // Recarregar a página para mostrar a nova reserva
      router.refresh();

    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Reserva
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Reserva</DialogTitle>
          <DialogDescription>
            Preencha os dados do visitante e da reserva. Vagas disponíveis: {capacidadeMax - ocupacaoAtual}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Visitante */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Dados do Visitante</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.visitante.nome}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      visitante: { ...formData.visitante, nome: e.target.value },
                    })
                  }
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.visitante.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      visitante: { ...formData.visitante, email: e.target.value },
                    })
                  }
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.visitante.telefone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      visitante: { ...formData.visitante, telefone: e.target.value },
                    })
                  }
                  placeholder="+351 123 456 789"
                />
              </div>

              <div>
                <Label htmlFor="pais">País</Label>
                <Select
                  value={formData.visitante.pais}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      visitante: { ...formData.visitante, pais: value },
                    })
                  }
                >
                  <SelectTrigger id="pais">
                    <SelectValue placeholder="Selecione o país" />
                  </SelectTrigger>
                  <SelectContent>
                    {paisesComuns.map((pais) => (
                      <SelectItem key={pais.value} value={pais.value}>
                        {pais.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="idioma">Idioma</Label>
                <Select
                  value={formData.visitante.idioma}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      visitante: { ...formData.visitante, idioma: value },
                    })
                  }
                >
                  <SelectTrigger id="idioma">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {idiomasComuns.map((idioma) => (
                      <SelectItem key={idioma.value} value={idioma.value}>
                        {idioma.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.visitante.cidade}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      visitante: { ...formData.visitante, cidade: e.target.value },
                    })
                  }
                  placeholder="Cidade de origem"
                />
              </div>
            </div>
          </div>

          {/* Dados da Reserva */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Dados da Reserva</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="numPessoas">Número de Pessoas *</Label>
                <Input
                  id="numPessoas"
                  type="number"
                  min="1"
                  max={capacidadeMax - ocupacaoAtual}
                  value={formData.numPessoas}
                  onChange={(e) =>
                    setFormData({ ...formData, numPessoas: parseInt(e.target.value) || 1 })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="valorTotal">Valor Total (€) *</Label>
                <Input
                  id="valorTotal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valorTotal}
                  onChange={(e) =>
                    setFormData({ ...formData, valorTotal: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Informações adicionais sobre a reserva..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Reserva'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
