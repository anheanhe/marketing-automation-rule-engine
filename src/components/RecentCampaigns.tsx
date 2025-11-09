import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, CheckCircle, XCircle, Clock, Eye, MousePointerClick, Download } from 'lucide-react';

interface CampaignWithDetails {
  id: string;
  email_destino: string;
  asunto: string;
  estado: string;
  fecha_envio: string;
  customer: {
    nombre: string;
  };
  rule: {
    nombre: string;
  };
  metrics: {
    abierto: boolean;
    clicks: number;
    convertido: boolean;
  } | null;
}

export function RecentCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      const { data, error } = await supabase
        .from('campaign_logs')
        .select(`
          id,
          email_destino,
          asunto,
          estado,
          fecha_envio,
          customers (nombre),
          marketing_rules (nombre)
        `)
        .order('fecha_envio', { ascending: false })
        .limit(20);

      if (error) throw error;

      const campaignIds = data?.map(c => c.id) || [];
      const { data: metrics } = await supabase
        .from('campaign_metrics')
        .select('log_id, abierto, clicks, convertido')
        .in('log_id', campaignIds);

      const metricsMap = new Map(metrics?.map(m => [m.log_id, m]) || []);

      const campaignsWithMetrics = data?.map(campaign => ({
        ...campaign,
        customer: (campaign.customers as any) || { nombre: 'Desconocido' },
        rule: (campaign.marketing_rules as any) || { nombre: 'Desconocida' },
        metrics: metricsMap.get(campaign.id) || null,
      })) || [];

      setCampaigns(campaignsWithMetrics as CampaignWithDetails[]);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  }

  function exportToCSV() {
    const headers = ['Cliente', 'Email', 'Asunto', 'Regla', 'Estado', 'Abierto', 'Clicks', 'Convertido', 'Fecha de envío'];

    const rows = campaigns.map(campaign => [
      campaign.customer.nombre,
      campaign.email_destino,
      campaign.asunto,
      campaign.rule.nombre,
      campaign.estado.charAt(0).toUpperCase() + campaign.estado.slice(1),
      campaign.metrics?.abierto ? 'Sí' : 'No',
      campaign.metrics?.clicks || 0,
      campaign.metrics?.convertido ? 'Sí' : 'No',
      new Date(campaign.fecha_envio).toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `campañas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'enviado':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'fallido':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'programado':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Mail className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (estado: string) => {
    const styles = {
      enviado: 'bg-green-100 text-green-800',
      fallido: 'bg-red-100 text-red-800',
      programado: 'bg-yellow-100 text-yellow-800',
    }[estado] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Últimas campañas enviadas</h3>
        {campaigns.length > 0 && (
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar Reporte
          </button>
        )}
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay campañas enviadas aún</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asunto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Regla
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Métricas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {campaign.customer.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{campaign.customer.nombre}</div>
                        <div className="text-sm text-gray-500">{campaign.email_destino}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{campaign.asunto}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{campaign.rule.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(campaign.estado)}
                      {getStatusBadge(campaign.estado)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {campaign.metrics ? (
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center space-x-1 ${campaign.metrics.abierto ? 'text-green-600' : 'text-gray-400'}`}>
                          <Eye className="w-4 h-4" />
                          <span className="text-xs">{campaign.metrics.abierto ? 'Abierto' : '-'}</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${campaign.metrics.clicks > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                          <MousePointerClick className="w-4 h-4" />
                          <span className="text-xs">{campaign.metrics.clicks || '-'}</span>
                        </div>
                        {campaign.metrics.convertido && (
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(campaign.fecha_envio).toLocaleString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
