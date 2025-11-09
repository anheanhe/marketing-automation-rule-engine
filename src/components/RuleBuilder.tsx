import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { EmailTemplate, Condition, RuleConditions } from '../types';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface RuleBuilderProps {
  onClose: () => void;
  onSave: () => void;
  editingRuleId?: string | null;
}

export function RuleBuilder({ onClose, onSave, editingRuleId }: RuleBuilderProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activa: true,
    tipo_disparador: 'tiempo' as const,
    frecuencia_maxima_dias: 7,
    prioridad: 5,
    template_id: '',
  });
  const [conditions, setConditions] = useState<Condition[]>([
    { field: 'ultima_compra', operator: 'days_ago', value: 30 }
  ]);
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
    if (editingRuleId) {
      loadRule(editingRuleId);
    }
  }, [editingRuleId]);

  async function loadTemplates() {
    const { data } = await supabase.from('email_templates').select('*');
    setTemplates(data || []);
  }

  async function loadRule(ruleId: string) {
    const { data } = await supabase.from('marketing_rules').select('*').eq('id', ruleId).single();
    if (data) {
      setFormData({
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        activa: data.activa,
        tipo_disparador: data.tipo_disparador,
        frecuencia_maxima_dias: data.frecuencia_maxima_dias,
        prioridad: data.prioridad,
        template_id: data.template_id || '',
      });
      setConditions(data.condiciones.conditions);
      setLogic(data.condiciones.logic);
    }
  }

  function addCondition() {
    setConditions([...conditions, { field: 'numero_compras', operator: '>', value: 0 }]);
  }

  function removeCondition(index: number) {
    setConditions(conditions.filter((_, i) => i !== index));
  }

  function updateCondition(index: number, updates: Partial<Condition>) {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    setConditions(newConditions);
  }

  async function handleSave() {
    if (!formData.nombre || !formData.template_id || conditions.length === 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      const ruleData = {
        ...formData,
        condiciones: { logic, conditions } as RuleConditions,
      };

      if (editingRuleId) {
        const { error } = await supabase
          .from('marketing_rules')
          .update(ruleData)
          .eq('id', editingRuleId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('marketing_rules').insert(ruleData);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving rule:', error);
      alert('Error al guardar la regla');
    } finally {
      setSaving(false);
    }
  }

  const fieldOptions = [
    { value: 'ultima_compra', label: 'Última compra' },
    { value: 'numero_compras', label: 'Número de compras' },
    { value: 'monto_total_gastado', label: 'Monto total gastado' },
    { value: 'monto_promedio_compra', label: 'Monto promedio de compra' },
    { value: 'fecha_nacimiento', label: 'Fecha de nacimiento' },
    { value: 'segmento', label: 'Segmento' },
  ];

  const operatorOptions = {
    default: [
      { value: '>', label: 'Mayor que (>)' },
      { value: '<', label: 'Menor que (<)' },
      { value: '>=', label: 'Mayor o igual (>=)' },
      { value: '<=', label: 'Menor o igual (<=)' },
      { value: '=', label: 'Igual (=)' },
      { value: '!=', label: 'Diferente (!=)' },
    ],
    date: [
      { value: 'days_ago', label: 'Días desde' },
      { value: 'days_ahead', label: 'Días hasta' },
      { value: 'is_birthday_month', label: 'Es mes de cumpleaños' },
    ],
    text: [
      { value: '=', label: 'Igual' },
      { value: '!=', label: 'Diferente' },
      { value: 'contains', label: 'Contiene' },
      { value: 'not_contains', label: 'No contiene' },
      { value: 'starts_with', label: 'Comienza con' },
      { value: 'ends_with', label: 'Termina con' },
    ],
  };

  function getOperatorsForField(field: string) {
    if (field === 'ultima_compra' || field === 'fecha_nacimiento') return operatorOptions.date;
    if (field === 'segmento') return operatorOptions.text;
    return operatorOptions.default;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingRuleId ? 'Editar regla' : 'Nueva regla de marketing'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la regla *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Win-back clientes inactivos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plantilla de email *
              </label>
              <select
                value={formData.template_id}
                onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecciona una plantilla</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Describe el propósito de esta regla"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de disparador
              </label>
              <select
                value={formData.tipo_disparador}
                onChange={(e) => setFormData({ ...formData, tipo_disparador: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="tiempo">Tiempo</option>
                <option value="evento">Evento</option>
                <option value="actualizacion">Actualización</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia máx (días)
              </label>
              <input
                type="number"
                value={formData.frecuencia_maxima_dias}
                onChange={(e) => setFormData({ ...formData, frecuencia_maxima_dias: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <input
                type="number"
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="10"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Condiciones</h3>
              <select
                value={logic}
                onChange={(e) => setLogic(e.target.value as 'AND' | 'OR')}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium"
              >
                <option value="AND">AND (todas)</option>
                <option value="OR">OR (alguna)</option>
              </select>
            </div>

            <div className="space-y-3">
              {conditions.map((condition, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <select
                        value={condition.field}
                        onChange={(e) => updateCondition(index, { field: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        {fieldOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(index, { operator: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        {getOperatorsForField(condition.field).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      {condition.operator !== 'is_birthday_month' && (
                        <input
                          type={condition.field.includes('monto') || condition.field === 'numero_compras' ? 'number' : 'text'}
                          value={condition.value}
                          onChange={(e) => updateCondition(index, { value: condition.field.includes('monto') || condition.field === 'numero_compras' ? parseFloat(e.target.value) : e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Valor"
                        />
                      )}
                    </div>

                    {conditions.length > 1 && (
                      <button
                        onClick={() => removeCondition(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {index < conditions.length - 1 && (
                    <div className="mt-2 text-center text-sm font-semibold text-blue-600">
                      {logic}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addCondition}
              className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar condición</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="activa"
              checked={formData.activa}
              onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="activa" className="text-sm font-medium text-gray-700">
              Regla activa
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar regla'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
