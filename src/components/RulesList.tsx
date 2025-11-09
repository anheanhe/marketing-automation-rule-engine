import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MarketingRule } from '../types';
import { Activity, Clock, Calendar, Zap, PlayCircle, PauseCircle, Edit2, Trash2 } from 'lucide-react';

interface RulesListProps {
  onEdit?: (ruleId: string) => void;
}

export function RulesList({ onEdit }: RulesListProps) {
  const [rules, setRules] = useState<MarketingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      const { data, error } = await supabase
        .from('marketing_rules')
        .select('*')
        .order('prioridad', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error loading rules:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleRule(ruleId: string, currentState: boolean) {
    try {
      const { error } = await supabase
        .from('marketing_rules')
        .update({ activa: !currentState })
        .eq('id', ruleId);

      if (error) throw error;
      loadRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  }

  async function executeRule(ruleId: string) {
    setExecuting(ruleId);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate-rules`;

      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers
      });

      if (!response.ok) throw new Error('Error ejecutando regla');

      const result = await response.json();
      console.log('Ejecución completada:', result);
      alert('Regla ejecutada correctamente');
    } catch (error) {
      console.error('Error executing rule:', error);
      alert('Error al ejecutar la regla');
    } finally {
      setExecuting(null);
    }
  }

  async function deleteRule(ruleId: string) {
    if (!confirm('¿Estás seguro de eliminar esta regla?')) return;

    try {
      const { error } = await supabase
        .from('marketing_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      loadRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('Error al eliminar la regla');
    }
  }

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case 'tiempo':
        return Clock;
      case 'evento':
        return Zap;
      case 'actualizacion':
        return Calendar;
      default:
        return Activity;
    }
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Reglas de automatización</h3>
        <button
          onClick={() => executeRule('all')}
          disabled={executing !== null}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          Ejecutar todas las reglas
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay reglas configuradas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => {
            const Icon = getIconForType(rule.tipo_disparador);
            return (
              <div
                key={rule.id}
                className={`border rounded-lg p-5 transition-all ${
                  rule.activa
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${rule.activa ? 'bg-green-100' : 'bg-gray-200'}`}>
                        <Icon className={`w-5 h-5 ${rule.activa ? 'text-green-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{rule.nombre}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            rule.activa ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {rule.activa ? 'Activa' : 'Inactiva'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Disparador: {rule.tipo_disparador}
                          </span>
                          <span className="text-xs text-gray-500">
                            Frecuencia máx: {rule.frecuencia_maxima_dias} días
                          </span>
                        </div>
                      </div>
                    </div>

                    {rule.descripcion && (
                      <p className="text-sm text-gray-600 mt-3 ml-14">{rule.descripcion}</p>
                    )}

                    <div className="mt-4 ml-14 bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Condiciones:</p>
                      <div className="space-y-1">
                        {rule.condiciones.conditions.map((cond, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs text-gray-600">
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">
                              {cond.field}
                            </span>
                            <span className="text-gray-500">{cond.operator}</span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">
                              {JSON.stringify(cond.value)}
                            </span>
                            {idx < rule.condiciones.conditions.length - 1 && (
                              <span className="text-gray-400 font-semibold">{rule.condiciones.logic}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(rule.id)}
                        className="inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Editar
                      </button>
                    )}

                    <button
                      onClick={() => toggleRule(rule.id, rule.activa)}
                      className={`inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        rule.activa
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {rule.activa ? (
                        <>
                          <PauseCircle className="w-4 h-4 mr-1" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Activar
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => executeRule(rule.id)}
                      disabled={!rule.activa || executing === rule.id}
                      className="inline-flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {executing === rule.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-1"></div>
                          Ejecutando...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Ejecutar
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="inline-flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
