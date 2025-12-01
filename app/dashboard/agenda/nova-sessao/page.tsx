'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NovaSessaoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tours, setTours] = useState<any[]>([]);
  const [guias, setGuias] = useState<any[]>([]);
  const [pontos, setPontos] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    tourId: '',
    guiaId: '',
    pontoEncontroId: '',
    dataHora: '',
    duracaoMin: 120,
    capacidadeMax: 20,
    observacoes: '',
  });

  useEffect(() => {
    // Carregar tours, guias e pontos de encontro
    Promise.all([
      fetch('/api/tours').then((r) => r.json()),
      fetch('/api/guias').then((r) => r.json()),
      fetch('/api/pontos').then((r) => r.json()),
    ]).then(([toursData, guiasData, pontosData]) => {
      setTours(toursData);
      setGuias(guiasData.filter((g: any) => g.status === 'ATIVO'));
      setPontos(pontosData.filter((p: any) => p.ativo));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/sessoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dataHora: new Date(formData.dataHora).toISOString(),
          guiaId: formData.guiaId || null,
          pontoEncontroId: formData.pontoEncontroId || null,
        }),
      });

      if (response.ok) {
        toast.success('Sessão criada com sucesso!');
        router.push('/dashboard/agenda');
        router.refresh();
      } else {
        toast.error('Erro ao criar sessão');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar sessão');
    } finally {
      setLoading(false);
    }
  };

  const tourSelecionado = tours.find((t) => t.id === formData.tourId);

  useEffect(() => {
    if (tourSelecionado) {
      setFormData((prev) => ({
        ...prev,
        duracaoMin: tourSelecionado.duracaoMin,
        capacidadeMax: tourSelecionado.capacidadeMax,
      }));
    }
  }, [tourSelecionado]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/agenda">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Nova Sessão</h2>
          <p className="text-gray-600 mt-1">Agende uma nova sessão de tour</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Detalhes da Sessão</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tour">Tour *</Label>
              <Select value={formData.tourId} onValueChange={(value) => setFormData({ ...formData, tourId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tour" />
                </SelectTrigger>
                <SelectContent>
                  {tours.map((tour) => (
                    <SelectItem key={tour.id} value={tour.id}>
                      {tour.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataHora">Data e Hora *</Label>
              <Input
                id="dataHora"
                type="datetime-local"
                required
                value={formData.dataHora}
                onChange={(e) => setFormData({ ...formData, dataHora: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (minutos) *</Label>
                <Input
                  id="duracao"
                  type="number"
                  required
                  min="30"
                  value={formData.duracaoMin}
                  onChange={(e) => setFormData({ ...formData, duracaoMin: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacidade">Capacidade Máxima *</Label>
                <Input
                  id="capacidade"
                  type="number"
                  required
                  min="1"
                  value={formData.capacidadeMax}
                  onChange={(e) => setFormData({ ...formData, capacidadeMax: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guia">Guia</Label>
              <Select value={formData.guiaId} onValueChange={(value) => setFormData({ ...formData, guiaId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um guia (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {guias.map((guia) => (
                    <SelectItem key={guia.id} value={guia.id}>
                      {guia.nome} ({guia.idiomas})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ponto">Ponto de Encontro</Label>
              <Select value={formData.pontoEncontroId} onValueChange={(value) => setFormData({ ...formData, pontoEncontroId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um ponto (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {pontos.map((ponto) => (
                    <SelectItem key={ponto.id} value={ponto.id}>
                      {ponto.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Informações adicionais sobre a sessão..."
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading || !formData.tourId}>
                {loading ? 'Criando...' : 'Criar Sessão'}
              </Button>
              <Link href="/dashboard/agenda">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
