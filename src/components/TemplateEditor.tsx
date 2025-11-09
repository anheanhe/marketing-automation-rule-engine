import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, X, Eye } from 'lucide-react';

interface TemplateEditorProps {
  onClose: () => void;
  onSave: () => void;
  editingTemplateId?: string | null;
}

export function TemplateEditor({ onClose, onSave, editingTemplateId }: TemplateEditorProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    asunto: '',
    contenido_html: '',
    contenido_texto: '',
  });
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'html' | 'text'>('html');

  useEffect(() => {
    if (editingTemplateId) {
      loadTemplate(editingTemplateId);
    }
  }, [editingTemplateId]);

  async function loadTemplate(templateId: string) {
    const { data } = await supabase.from('email_templates').select('*').eq('id', templateId).single();
    if (data) {
      setFormData({
        nombre: data.nombre,
        asunto: data.asunto,
        contenido_html: data.contenido_html,
        contenido_texto: data.contenido_texto,
      });
    }
  }

  async function handleSave() {
    if (!formData.nombre || !formData.asunto || !formData.contenido_html) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      const variablesUsadas = extractVariables(formData.contenido_html + ' ' + formData.asunto);
      const templateData = {
        ...formData,
        variables_disponibles: variablesUsadas,
      };

      if (editingTemplateId) {
        const { error } = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', editingTemplateId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('email_templates').insert(templateData);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error al guardar la plantilla');
    } finally {
      setSaving(false);
    }
  }

  function extractVariables(text: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = text.matchAll(regex);
    const variables = new Set<string>();
    for (const match of matches) {
      variables.add(match[1].trim());
    }
    return Array.from(variables);
  }

  function insertVariable(variable: string) {
    setFormData({
      ...formData,
      contenido_html: formData.contenido_html + `{{${variable}}}`,
    });
  }

  const availableVariables = [
    { name: 'nombre_cliente', description: 'Nombre del cliente' },
    { name: 'email', description: 'Email del cliente' },
    { name: 'ultima_compra', description: 'Fecha de última compra' },
    { name: 'numero_compras', description: 'Número total de compras' },
    { name: 'monto_total_gastado', description: 'Monto total gastado' },
    { name: 'monto_promedio_compra', description: 'Monto promedio por compra' },
    { name: 'segmento', description: 'Segmento del cliente' },
  ];

  const detectedVariables = extractVariables(formData.contenido_html + ' ' + formData.asunto);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingTemplateId ? 'Editar plantilla' : 'Nueva plantilla de email'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la plantilla *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Win-back con cupón"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asunto del email *
                </label>
                <input
                  type="text"
                  value={formData.asunto}
                  onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Usa {{variables}} para personalizar"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Contenido HTML *
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewMode('html')}
                      className={`px-3 py-1 text-sm rounded ${
                        previewMode === 'html'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Editor
                    </button>
                    <button
                      onClick={() => setPreviewMode('text')}
                      className={`px-3 py-1 text-sm rounded flex items-center space-x-1 ${
                        previewMode === 'text'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Vista previa</span>
                    </button>
                  </div>
                </div>

                {previewMode === 'html' ? (
                  <textarea
                    value={formData.contenido_html}
                    onChange={(e) => setFormData({ ...formData, contenido_html: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    rows={15}
                    placeholder="<html>...</html>"
                  />
                ) : (
                  <div
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white overflow-auto"
                    style={{ minHeight: '360px' }}
                    dangerouslySetInnerHTML={{
                      __html: formData.contenido_html.replace(/\{\{([^}]+)\}\}/g, '<span style="background: #fef3c7; padding: 2px 6px; border-radius: 4px; font-weight: 600;">$1</span>')
                    }}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenido en texto plano
                </label>
                <textarea
                  value={formData.contenido_texto}
                  onChange={(e) => setFormData({ ...formData, contenido_texto: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={8}
                  placeholder="Versión en texto plano del email"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">Variables disponibles</h4>
                <div className="space-y-2">
                  {availableVariables.map((variable) => (
                    <button
                      key={variable.name}
                      onClick={() => insertVariable(variable.name)}
                      className="w-full text-left px-3 py-2 bg-white rounded border border-blue-200 hover:bg-blue-100 transition-colors group"
                    >
                      <div className="font-mono text-xs text-blue-700 font-semibold">
                        {`{{${variable.name}}}`}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">{variable.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {detectedVariables.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-semibold text-green-900 mb-2">Variables detectadas</h4>
                  <div className="flex flex-wrap gap-2">
                    {detectedVariables.map((variable) => (
                      <span
                        key={variable}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Ejemplo de uso</h4>
                <div className="text-xs text-gray-600 space-y-2">
                  <p>Las variables se escriben entre dobles llaves:</p>
                  <code className="block bg-white p-2 rounded border border-gray-300 font-mono">
                    Hola {`{{nombre_cliente}}`}
                  </code>
                  <p className="mt-2">Al enviar el email, se reemplazará con el valor real del cliente.</p>
                </div>
              </div>
            </div>
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
            <span>{saving ? 'Guardando...' : 'Guardar plantilla'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
