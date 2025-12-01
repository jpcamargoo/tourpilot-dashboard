'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface FiltrosDashboard {
  dataInicio: string;
  dataFim: string;
  idioma: string;
  pais: string;
  status: string;
  guiaId: string;
  tourId: string;
}

interface FiltrosAvancadosProps {
  onAplicarFiltros: (filtros: FiltrosDashboard) => void;
  guias?: Array<{ id: string; nome: string }>;
  tours?: Array<{ id: string; nome: string }>;
}

export function FiltrosAvancados({
  onAplicarFiltros,
  guias = [],
  tours = [],
}: FiltrosAvancadosProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosDashboard>({
    dataInicio: '',
    dataFim: '',
    idioma: '',
    pais: '',
    status: '',
    guiaId: '',
    tourId: '',
  });

  const handleAplicar = () => {
    onAplicarFiltros(filtros);
  };

  const handleLimpar = () => {
    const filtrosVazios: FiltrosDashboard = {
      dataInicio: '',
      dataFim: '',
      idioma: '',
      pais: '',
      status: '',
      guiaId: '',
      tourId: '',
    };
    setFiltros(filtrosVazios);
    onAplicarFiltros(filtrosVazios);
  };

  const temFiltrosAtivos = Object.values(filtros).some((v) => v !== '');

  return (
    <div className="space-y-4">
      {/* Botão de Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros Avançados
          {temFiltrosAtivos && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
              Ativos
            </span>
          )}
        </Button>
        {temFiltrosAtivos && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLimpar}
            className="text-gray-600"
          >
            <X className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Painel de Filtros */}
      {mostrarFiltros && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Data Início */}
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <div className="relative">
                <Input
                  id="dataInicio"
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) =>
                    setFiltros({ ...filtros, dataInicio: e.target.value })
                  }
                />
                <CalendarIcon className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Data Fim */}
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <div className="relative">
                <Input
                  id="dataFim"
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) =>
                    setFiltros({ ...filtros, dataFim: e.target.value })
                  }
                />
                <CalendarIcon className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Guia */}
            <div className="space-y-2">
              <Label htmlFor="guiaId">Guia</Label>
              <select
                id="guiaId"
                value={filtros.guiaId}
                onChange={(e) =>
                  setFiltros({ ...filtros, guiaId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os guias</option>
                {guias.map((guia) => (
                  <option key={guia.id} value={guia.id}>
                    {guia.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Tour */}
            <div className="space-y-2">
              <Label htmlFor="tourId">Tour</Label>
              <select
                id="tourId"
                value={filtros.tourId}
                onChange={(e) =>
                  setFiltros({ ...filtros, tourId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os tours</option>
                {tours.map((tour) => (
                  <option key={tour.id} value={tour.id}>
                    {tour.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Idioma */}
            <div className="space-y-2">
              <Label htmlFor="idioma">Idioma</Label>
              <select
                id="idioma"
                value={filtros.idioma}
                onChange={(e) =>
                  setFiltros({ ...filtros, idioma: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os idiomas</option>
                <option value="PT">Português</option>
                <option value="EN">Inglês</option>
                <option value="ES">Espanhol</option>
                <option value="FR">Francês</option>
                <option value="DE">Alemão</option>
                <option value="IT">Italiano</option>
              </select>
            </div>

            {/* País */}
            <div className="space-y-2">
              <Label htmlFor="pais">País de Origem</Label>
              <Input
                id="pais"
                type="text"
                placeholder="Ex: Brasil, Portugal"
                value={filtros.pais}
                onChange={(e) =>
                  setFiltros({ ...filtros, pais: e.target.value })
                }
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={filtros.status}
                onChange={(e) =>
                  setFiltros({ ...filtros, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os status</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="PENDENTE">Pendente</option>
                <option value="CANCELADA">Cancelada</option>
                <option value="COMPLETADA">Completada</option>
              </select>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleLimpar}>
              Limpar
            </Button>
            <Button onClick={handleAplicar}>Aplicar Filtros</Button>
          </div>
        </div>
      )}
    </div>
  );
}
