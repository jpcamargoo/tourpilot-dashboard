'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string | null;
  resourceId: string | null;
  details: any;
  ipAddress: string | null;
  timestamp: string;
  usuario: {
    nome: string;
    email: string;
  };
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    resource: '',
    startDate: '',
    endDate: '',
    limit: 50,
    offset: 0,
  });

  const [stats, setStats] = useState<{ action: string; count: number }[]>([]);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`/api/audit-logs?${params}`);
      const data = await response.json();

      if (response.ok) {
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/audit-logs/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    setFilters(prev => ({
      ...prev,
      offset: direction === 'next' 
        ? prev.offset + prev.limit 
        : Math.max(0, prev.offset - prev.limit)
    }));
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Logs de Auditoria</h1>
        <p className="text-gray-600 mt-2">
          Rastreamento completo de todas as ações no sistema
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>

        {stats.slice(0, 3).map((stat) => (
          <Card key={stat.action}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.action.replace(/_/g, ' ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Ação</label>
              <Select
                value={filters.action}
                onValueChange={(value) => setFilters({ ...filters, action: value, offset: 0 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="CREATE_TOUR">Criar Tour</SelectItem>
                  <SelectItem value="DELETE_TOUR">Excluir Tour</SelectItem>
                  <SelectItem value="CREATE_GUIA">Criar Guia</SelectItem>
                  <SelectItem value="EXPORT_DATA">Exportar Dados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Recurso</label>
              <Input
                placeholder="tour, guia, etc."
                value={filters.resource}
                onChange={(e) => setFilters({ ...filters, resource: e.target.value, offset: 0 })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Data Inicial</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value, offset: 0 })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Data Final</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value, offset: 0 })}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={fetchLogs} variant="default">
              Aplicar Filtros
            </Button>
            <Button
              onClick={() => {
                setFilters({
                  userId: '',
                  action: '',
                  resource: '',
                  startDate: '',
                  endDate: '',
                  limit: 50,
                  offset: 0,
                });
              }}
              variant="outline"
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Auditoria</CardTitle>
          <CardDescription>
            Mostrando {filters.offset + 1} - {Math.min(filters.offset + filters.limit, total)} de {total} registros
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum log encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.usuario.nome}</p>
                          <p className="text-xs text-gray-500">{log.usuario.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.action)}>
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.resource && (
                          <div>
                            <p className="font-medium">{log.resource}</p>
                            {log.resourceId && (
                              <p className="text-xs text-gray-500 font-mono">
                                {log.resourceId.substring(0, 8)}...
                              </p>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.ipAddress || '-'}
                      </TableCell>
                      <TableCell>
                        {log.details && (
                          <details className="cursor-pointer">
                            <summary className="text-blue-600 text-sm">Ver detalhes</summary>
                            <pre className="text-xs mt-2 bg-gray-50 p-2 rounded">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Paginação */}
          <div className="flex items-center justify-between mt-4">
            <Button
              onClick={() => handlePageChange('prev')}
              disabled={filters.offset === 0}
              variant="outline"
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Página {Math.floor(filters.offset / filters.limit) + 1} de{' '}
              {Math.ceil(total / filters.limit)}
            </span>
            <Button
              onClick={() => handlePageChange('next')}
              disabled={filters.offset + filters.limit >= total}
              variant="outline"
            >
              Próxima
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
