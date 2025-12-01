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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditarGuiaPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    idiomas: [] as string[],
    status: 'ATIVO',
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
    const carregarGuia = async () => {
      try {
        const response = await fetch(`/api/guias?id=${resolvedParams.id}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const guia = data.data;
          setFormData({
            nome: guia.nome,
            telefone: guia.telefone || '',
            idiomas: guia.idiomas.split(',').map((i: string) => i.trim()),
            status: guia.status,
          });
        }
      } catch (error) {
        console.error('Erro ao carregar guia:', error);
        toast.error('Erro ao carregar dados do guia');
      } finally {
        setCarregando(false);
      }
    };

    carregarGuia();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/guias?id=${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Guia atualizado com sucesso!');
        router.push(`/dashboard/guias/${resolvedParams.id}`);
        router.refresh();
      } else {
        toast.error(data.error || 'Erro ao atualizar guia');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar guia');
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
        <Link href={`/dashboard/guias/${resolvedParams.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Editar Guia</h2>
          <p className="text-gray-600 mt-1">Atualize as informações do guia</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações do Guia</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="João Silva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="+351 912 345 678"
              />
            </div>

            <div className="space-y-2">
              <Label>Idiomas *</Label>
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

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ATIVO">Ativo</SelectItem>
                  <SelectItem value="INATIVO">Inativo</SelectItem>
                  <SelectItem value="FERIAS">Férias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading || formData.idiomas.length === 0}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Link href={`/dashboard/guias/${resolvedParams.id}`}>
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
