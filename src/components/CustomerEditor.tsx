import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, X } from 'lucide-react';

interface CustomerEditorProps {
  onClose: () => void;
  onSave: () => void;
  editingCustomerId?: string | null;
}

export function CustomerEditor({ onClose, onSave, editingCustomerId }: CustomerEditorProps) {
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    fecha_nacimiento: '',
    numero_compras: 0,
    monto_total_gastado: 0,
    monto_promedio_compra: 0,
    ultima_compra: '',
    segmento: 'nuevo',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingCustomerId) {
      loadCustomer(editingCustomerId);
    }
  }, [editingCustomerId]);

  async function loadCustomer(customerId: string) {
    const { data } = await supabase.from('customers').select('*').eq('id', customerId).single();
    if (data) {
      setFormData({
        email: data.email,
        nombre: data.nombre,
        fecha_nacimiento: data.fecha_nacimiento || '',
        numero_compras: data.numero_compras,
        monto_total_gastado: data.monto_total_gastado,
        monto_promedio_compra: data.monto_promedio_compra,
        ultima_compra: data.ultima_compra || '',
        segmento: data.segmento,
      });
    }
  }

  async function handleSave() {
    if (!formData.email || !formData.nombre) {
      alert('Por favor completa el email y nombre');
      return;
    }

    setSaving(true);
    try {
      const customerData = {
        ...formData,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        ultima_compra: formData.ultima_compra || null,
        monto_promedio_compra: formData.numero_compras > 0
          ? formData.monto_total_gastado / formData.numero_compras
          : 0,
      };

      if (editingCustomerId) {
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', editingCustomerId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('customers').insert(customerData);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error al guardar el cliente');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingCustomerId ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="juan@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Segmento
              </label>
              <select
                value={formData.segmento}
                onChange={(e) => setFormData({ ...formData, segmento: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="nuevo">Nuevo</option>
                <option value="regular">Regular</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de compras</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de compras
                </label>
                <input
                  type="number"
                  value={formData.numero_compras}
                  onChange={(e) => setFormData({ ...formData, numero_compras: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto total gastado
                </label>
                <input
                  type="number"
                  value={formData.monto_total_gastado}
                  onChange={(e) => setFormData({ ...formData, monto_total_gastado: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Última compra
                </label>
                <input
                  type="date"
                  value={formData.ultima_compra}
                  onChange={(e) => setFormData({ ...formData, ultima_compra: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {formData.numero_compras > 0 && (
              <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-900">
                  Monto promedio por compra: <span className="font-semibold">
                    ${(formData.monto_total_gastado / formData.numero_compras).toFixed(2)}
                  </span>
                </p>
              </div>
            )}
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
            <span>{saving ? 'Guardando...' : 'Guardar cliente'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
