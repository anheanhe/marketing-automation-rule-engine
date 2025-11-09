export interface Customer {
  id: string;
  email: string;
  nombre: string;
  fecha_registro: string;
  ultima_compra: string | null;
  numero_compras: number;
  monto_total_gastado: number;
  monto_promedio_compra: number;
  fecha_nacimiento: string | null;
  segmento: string;
  metadata: Record<string, any>;
}

export interface EmailTemplate {
  id: string;
  nombre: string;
  asunto: string;
  contenido_html: string;
  contenido_texto: string;
  variables_disponibles: string[];
}

export interface Condition {
  field: string;
  operator: string;
  value: any;
}

export interface RuleConditions {
  logic: 'AND' | 'OR';
  conditions: Condition[];
}

export interface MarketingRule {
  id: string;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  tipo_disparador: 'tiempo' | 'evento' | 'actualizacion';
  condiciones: RuleConditions;
  template_id: string | null;
  frecuencia_maxima_dias: number;
  prioridad: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignLog {
  id: string;
  customer_id: string;
  rule_id: string;
  template_id: string | null;
  email_destino: string;
  asunto: string;
  variables_usadas: Record<string, any>;
  estado: 'programado' | 'enviado' | 'fallido';
  fecha_envio: string;
  external_id: string | null;
  error_mensaje: string | null;
}

export interface CampaignMetrics {
  id: string;
  log_id: string;
  abierto: boolean;
  fecha_apertura: string | null;
  clicks: number;
  fecha_primer_click: string | null;
  convertido: boolean;
  fecha_conversion: string | null;
  monto_conversion: number | null;
  metadata: Record<string, any>;
}

export interface RuleExecutionHistory {
  id: string;
  rule_id: string;
  fecha_ejecucion: string;
  clientes_evaluados: number;
  clientes_calificados: number;
  emails_enviados: number;
  emails_fallidos: number;
  duracion_ms: number;
  errores: any;
}
