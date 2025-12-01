'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditarTourPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracaoMin: 120,
    precoBase: 0,
    capacidadeMax: 20,
    idiomas: [] as string[],
    ativo: true,
  });

  const idiomasDisponiveis = [
    { value: 'pt', label: 'Português' },
    { value: 'en', label: 'Inglês' },
    { value: 'es', label: 'Espanhol' },
    { value: 'fr', label: 'Francês' },
    { value: 'de', label: 'Alemão' },
    { value: 'it', label: 'Italiano' },
  ];

  useEffect(() => {
    const carregarTour = async () => {
      try {
        const response = await fetch(`/api/tours?id=${resolvedParams.id}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const tour = data.data;
          setFormData({
            nome: tour.nome,
            descricao: tour.descricao || '',
            duracaoMin: tour.duracaoMin,
            precoBase: tour.precoBase,
            capacidadeMax: tour.capacidadeMax,
            idiomas: tour.idiomas.split(',').map((i: string) => i.trim()),
            ativo: tour.ativo,
          });
        }
      } catch (error) {
        console.error('Erro ao carregar tour:', error);
        toast.error('Erro ao carregar dados do tour');
      } finally {
        setCarregando(false);
      }
    };

    carregarTour();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/tours?id=${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Tour atualizado com sucesso!');
        router.push(`/dashboard/tours/${resolvedParams.id}`);
        router.refresh();
      } else {
        toast.error(data.error || 'Erro ao atualizar tour');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar tour');
    } finally {
      setLoading(false);
    }
  };

  const toggleIdioma = (idioma: string) => {
    setFormData((prev) => ({
      ...prev,
      idiomas: prev.idiomas.includes(idioma)
        ? prev.idiomas.filter((i) => i !== idioma)
        : [...prev.idiomas, idioma],
    }));
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/tours/${resolvedParams.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Editar Tour</h2>
          <p className="text-gray-600 mt-1">Atualize as informações do tour</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações do Tour</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Tour *</Label>
              <Input
                id="nome"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Free Walking Tour Lisboa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição detalhada do tour..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (minutos) *</Label>
                <Input
                  id="duracao"
                  type="number"
                  required
                  min="30"
                  value={formData.duracaoMin}
                  onChange={(e) =>
                    setFormData({ ...formData, duracaoMin: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco">Preço Base (€) *</Label>
                <Input
                  id="preco"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.precoBase}
                  onChange={(e) =>
                    setFormData({ ...formData, precoBase: parseFloat(e.target.value) })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, capacidadeMax: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Idiomas Disponíveis *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {idiomasDisponiveis.map((idioma) => (
                  <button
                    key={idioma.value}
                    type="button"
                    onClick={() => toggleIdioma(idioma.value)}
                    className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                      formData.idiomas.includes(idioma.value)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {idioma.label}
                  </button>
                ))}
              </div>
              {formData.idiomas.length === 0 && (
                <p className="text-sm text-red-600">Selecione pelo menos um idioma</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                aria-label="Tour ativo"
              />
              <Label htmlFor="ativo" className="cursor-pointer">
                Tour ativo (disponível para agendamento)
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading || formData.idiomas.length === 0}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Link href={`/dashboard/tours/${resolvedParams.id}`}>
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
