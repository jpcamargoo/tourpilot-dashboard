'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NovoTourPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Tour criado com sucesso!');
        router.push('/dashboard/tours');
        router.refresh();
      } else {
        toast.error('Erro ao criar tour');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar tour');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tours">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Novo Tour</h2>
          <p className="text-gray-600 mt-1">Cadastre um novo tour no sistema</p>
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
              />
              <Label htmlFor="ativo" className="cursor-pointer">
                Tour ativo (disponível para agendamento)
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading || formData.idiomas.length === 0}>
                {loading ? 'Criando...' : 'Criar Tour'}
              </Button>
              <Link href="/dashboard/tours">
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
