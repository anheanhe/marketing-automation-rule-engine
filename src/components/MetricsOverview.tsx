import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, TrendingUp, MousePointerClick, ShoppingCart } from 'lucide-react';

interface RulePerformance {
  rule_id: string;
  rule_name: string;
  total_sent: number;
  total_opened: number;
  total_clicks: number;
  total_converted: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
}

export function MetricsOverview() {
  const [performance, setPerformance] = useState<RulePerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformance();
  }, []);

  async function loadPerformance() {
    try {
      const { data: logs, error: logsError } = await supabase
        .from('campaign_logs')
        .select(`
          id,
          rule_id,
          estado,
          marketing_rules (
            nombre
          )
        `);

      if (logsError) throw logsError;

      const { data: metrics, error: metricsError } = await supabase
        .from('campaign_metrics')
        .select('log_id, abierto, clicks, convertido');

      if (metricsError) throw metricsError;

      const metricsMap = new Map(metrics?.map(m => [m.log_id, m]) || []);

      const performanceByRule = new Map<string, RulePerformance>();

      logs?.forEach(log => {
        const ruleId = log.rule_id;
        const ruleName = (log.marketing_rules as any)?.nombre || 'Sin nombre';
        const metric = metricsMap.get(log.id);

        if (!performanceByRule.has(ruleId)) {
          performanceByRule.set(ruleId, {
            rule_id: ruleId,
            rule_name: ruleName,
            total_sent: 0,
            total_opened: 0,
            total_clicks: 0,
            total_converted: 0,
            open_rate: 0,
            click_rate: 0,
            conversion_rate: 0,
          });
        }

        const perf = performanceByRule.get(ruleId)!;
        perf.total_sent++;

        if (metric) {
          if (metric.abierto) perf.total_opened++;
          if (metric.clicks > 0) perf.total_clicks++;
          if (metric.convertido) perf.total_converted++;
        }
      });

      const performanceArray = Array.from(performanceByRule.values()).map(perf => ({
        ...perf,
        open_rate: perf.total_sent > 0 ? (perf.total_opened / perf.total_sent) * 100 : 0,
        click_rate: perf.total_sent > 0 ? (perf.total_clicks / perf.total_sent) * 100 : 0,
        conversion_rate: perf.total_sent > 0 ? (perf.total_converted / perf.total_sent) * 100 : 0,
      }));

      setPerformance(performanceArray);
    } catch (error) {
      console.error('Error loading performance:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento por regla</h3>
        <div className="space-y-4">
          {performance.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay datos de rendimiento disponibles</p>
              <p className="text-sm text-gray-400 mt-2">Ejecuta las reglas para ver métricas</p>
            </div>
          ) : (
            performance.map((perf) => (
              <div key={perf.rule_id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">{perf.rule_name}</h4>
                  <span className="text-sm text-gray-500">{perf.total_sent} enviados</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Tasa de apertura</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{perf.open_rate.toFixed(1)}%</p>
                    <p className="text-xs text-blue-700 mt-1">{perf.total_opened} abiertos</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MousePointerClick className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Tasa de clics</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{perf.click_rate.toFixed(1)}%</p>
                    <p className="text-xs text-green-700 mt-1">{perf.total_clicks} clics</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <ShoppingCart className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Conversión</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{perf.conversion_rate.toFixed(1)}%</p>
                    <p className="text-xs text-purple-700 mt-1">{perf.total_converted} convertidos</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
