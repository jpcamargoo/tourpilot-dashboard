'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Guia {
  id: string;
  nome: string;
}

interface Sessao {
  id: string;
  dataHora: string;
  tour: {
    nome: string;
  };
}

export function AdicionarTransacaoButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guias, setGuias] = useState<Guia[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [formData, setFormData] = useState({
    tipo: 'GORJETA',
    guiaId: '',
    sessaoTourId: '',
    valor: '',
    moeda: 'EUR',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (open) {
      carregarDados();
    }
  }, [open]);

  const carregarDados = async () => {
    try {
      // Carregar guias
      const resGuias = await fetch('/api/guias');
      const dataGuias = await resGuias.json();
      setGuias(dataGuias);

      // Carregar sessões recentes
      const resSessoes = await fetch('/api/sessoes');
      const dataSessoes = await resSessoes.json();
      setSessoes(dataSessoes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          guiaId: formData.guiaId || null,
          sessaoTourId: formData.sessaoTourId || null,
          valor: parseFloat(formData.valor),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Transação adicionada com sucesso!');
        setOpen(false);
        setFormData({
          tipo: 'GORJETA',
          guiaId: '',
          sessaoTourId: '',
          valor: '',
          moeda: 'EUR',
          descricao: '',
          data: new Date().toISOString().split('T')[0],
        });
        router.refresh();
      } else {
        toast.error(data.error || 'Erro ao adicionar transação');
      }
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      toast.error('Erro ao adicionar transação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>
            Adicione gorjetas, balanços ou ajustes financeiros
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GORJETA">Gorjeta</SelectItem>
                <SelectItem value="BALANCO">Balanço</SelectItem>
                <SelectItem value="AJUSTE">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.tipo === 'GORJETA' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="guia">Guia *</Label>
                <Select
                  value={formData.guiaId}
                  onValueChange={(value) => setFormData({ ...formData, guiaId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o guia" />
                  </SelectTrigger>
                  <SelectContent>
                    {guias.map((guia) => (
                      <SelectItem key={guia.id} value={guia.id}>
                        {guia.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessao">Sessão (opcional)</Label>
                <Select
                  value={formData.sessaoTourId}
                  onValueChange={(value) => setFormData({ ...formData, sessaoTourId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a sessão" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessoes.slice(0, 10).map((sessao) => (
                      <SelectItem key={sessao.id} value={sessao.id}>
                        {sessao.tour.nome} -{' '}
                        {new Date(sessao.dataHora).toLocaleDateString('pt-BR')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                required
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moeda">Moeda</Label>
              <Select
                value={formData.moeda}
                onValueChange={(value) => setFormData({ ...formData, moeda: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data *</Label>
            <Input
              id="data"
              type="date"
              required
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Detalhes sobre a transação..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Adicionar'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
