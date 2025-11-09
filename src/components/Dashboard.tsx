import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, Users, Mail, Clock, FileText, Plus, LogOut } from 'lucide-react';
import { RulesList } from './RulesList';
import { RecentCampaigns } from './RecentCampaigns';
import { RuleBuilder } from './RuleBuilder';
import { TemplateEditor } from './TemplateEditor';
import { CustomersList } from './CustomersList';
import { CustomerEditor } from './CustomerEditor';
import type { User } from '@supabase/supabase-js';

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rules' | 'campaigns' | 'templates' | 'customers'>('customers');
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showCustomerEditor, setShowCustomerEditor] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function loadStats() {
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">D2G Marketing Automation</h1>
              <p className="text-gray-600 mt-1">Sistema de reglas dinámicas y automatización de campañas</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Última actualización: {new Date().toLocaleTimeString('es-MX')}</span>
              </div>
              <div className="flex items-center space-x-3 border-l border-gray-300 pl-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cómo usar este sistema</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Gestiona tus clientes</h3>
                  <p className="text-gray-600 mb-4">
                    Añade y administra tu base de clientes. El sistema automáticamente segmenta según su comportamiento de compra.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Crea plantillas de email</h3>
                  <p className="text-gray-600 mb-4">
                    Diseña plantillas personalizadas con variables dinámicas como nombre del cliente, última compra, y más.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">3. Define reglas de automatización</h3>
                  <p className="text-gray-600 mb-4">
                    Configura reglas basadas en condiciones específicas (días sin comprar, cumpleaños, monto gastado, etc).
                  </p>

                  <h3 className="text-lg font-semibold text-gray-800 mb-3">4. Ejecuta y monitorea</h3>
                  <p className="text-gray-600 mb-4">
                    El sistema evalúa automáticamente tus reglas y envía emails personalizados. Revisa los resultados en la sección de campañas.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="border-b border-gray-200">
                <div className="flex items-center justify-between px-6">
                  <nav className="flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('customers')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'customers'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Clientes</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('templates')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'templates'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Plantillas</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('rules')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'rules'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4" />
                        <span>Reglas</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('campaigns')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'campaigns'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Campañas</span>
                      </div>
                    </button>
                  </nav>

                  <div className="flex items-center space-x-3 py-3">
                    {activeTab === 'customers' && (
                      <button
                        onClick={() => {
                          setEditingCustomerId(null);
                          setShowCustomerEditor(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo cliente
                      </button>
                    )}
                    {activeTab === 'templates' && (
                      <button
                        onClick={() => {
                          setEditingTemplateId(null);
                          setShowTemplateEditor(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva plantilla
                      </button>
                    )}
                    {activeTab === 'rules' && (
                      <button
                        onClick={() => {
                          setEditingRuleId(null);
                          setShowRuleBuilder(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva regla
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'customers' && <CustomersList key={`customers-${refreshKey}`} />}
                {activeTab === 'templates' && (
                  <TemplatesList
                    key={`templates-${refreshKey}`}
                    onEdit={(templateId) => {
                      setEditingTemplateId(templateId);
                      setShowTemplateEditor(true);
                    }}
                  />
                )}
                {activeTab === 'rules' && (
                  <RulesList
                    key={`rules-${refreshKey}`}
                    onEdit={(ruleId) => {
                      setEditingRuleId(ruleId);
                      setShowRuleBuilder(true);
                    }}
                  />
                )}
                {activeTab === 'campaigns' && <RecentCampaigns />}
              </div>
            </div>
          </>
        )}
      </main>

      {showRuleBuilder && (
        <RuleBuilder
          editingRuleId={editingRuleId}
          onClose={() => {
            setShowRuleBuilder(false);
            setEditingRuleId(null);
          }}
          onSave={() => {
            setShowRuleBuilder(false);
            setEditingRuleId(null);
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}

      {showTemplateEditor && (
        <TemplateEditor
          editingTemplateId={editingTemplateId}
          onClose={() => {
            setShowTemplateEditor(false);
            setEditingTemplateId(null);
          }}
          onSave={() => {
            setShowTemplateEditor(false);
            setEditingTemplateId(null);
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}

      {showCustomerEditor && (
        <CustomerEditor
          editingCustomerId={editingCustomerId}
          onClose={() => {
            setShowCustomerEditor(false);
            setEditingCustomerId(null);
          }}
          onSave={() => {
            setShowCustomerEditor(false);
            setEditingCustomerId(null);
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
}

function TemplatesList({ onEdit }: { onEdit: (id: string) => void }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const { data, error } = await supabase.from('email_templates').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return;

    try {
      const { error } = await supabase.from('email_templates').delete().eq('id', id);
      if (error) throw error;
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error al eliminar la plantilla');
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Plantillas de email</h3>

      {templates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay plantillas creadas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{template.nombre}</h4>
                  <p className="text-sm text-gray-600 mb-2">{template.asunto}</p>
                  {template.variables_disponibles && template.variables_disponibles.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.variables_disponibles.map((variable: string) => (
                        <span
                          key={variable}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => onEdit(template.id)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
