/*
  # Marketing Automation System - D2G
  
  ## Descripción
  Sistema completo de automatización de marketing con reglas dinámicas,
  plantillas de email personalizadas y monitoreo de efectividad.
  
  ## 1. Nuevas Tablas
  
  ### customers
  Almacena información de clientes y su comportamiento de compra
  - `id` (uuid, primary key)
  - `email` (text, único)
  - `nombre` (text)
  - `fecha_registro` (timestamp)
  - `ultima_compra` (timestamp, nullable)
  - `numero_compras` (integer, default 0)
  - `monto_total_gastado` (decimal)
  - `monto_promedio_compra` (decimal)
  - `fecha_nacimiento` (date, nullable)
  - `segmento` (text, ej: 'vip', 'regular', 'nuevo')
  - `metadata` (jsonb, campos personalizados)
  
  ### marketing_rules
  Define las reglas de automatización
  - `id` (uuid, primary key)
  - `nombre` (text, nombre descriptivo de la regla)
  - `descripcion` (text)
  - `activa` (boolean, default true)
  - `tipo_disparador` (text: 'tiempo', 'evento', 'actualizacion')
  - `condiciones` (jsonb, estructura de condiciones lógicas)
  - `template_id` (uuid, foreign key a email_templates)
  - `frecuencia_maxima_dias` (integer, evitar spam, ej: no enviar si ya recibió en últimos X días)
  - `prioridad` (integer, para ordenar ejecución)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
  
  ### email_templates
  Plantillas de correos con variables dinámicas
  - `id` (uuid, primary key)
  - `nombre` (text)
  - `asunto` (text, con variables: {{nombre_cliente}})
  - `contenido_html` (text, HTML del email)
  - `contenido_texto` (text, versión texto plano)
  - `variables_disponibles` (jsonb, lista de variables y descripciones)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
  
  ### campaign_logs
  Registro de cada email enviado
  - `id` (uuid, primary key)
  - `customer_id` (uuid, foreign key)
  - `rule_id` (uuid, foreign key)
  - `template_id` (uuid, foreign key)
  - `email_destino` (text)
  - `asunto` (text, asunto final procesado)
  - `variables_usadas` (jsonb, valores de variables al momento del envío)
  - `estado` (text: 'enviado', 'fallido', 'programado')
  - `fecha_envio` (timestamp)
  - `external_id` (text, ID del proveedor de email)
  - `error_mensaje` (text, nullable)
  
  ### campaign_metrics
  Métricas de efectividad
  - `id` (uuid, primary key)
  - `log_id` (uuid, foreign key a campaign_logs)
  - `abierto` (boolean, default false)
  - `fecha_apertura` (timestamp, nullable)
  - `clicks` (integer, default 0)
  - `fecha_primer_click` (timestamp, nullable)
  - `convertido` (boolean, default false)
  - `fecha_conversion` (timestamp, nullable)
  - `monto_conversion` (decimal, nullable)
  - `metadata` (jsonb, datos adicionales)
  
  ### rule_execution_history
  Histórico de ejecuciones de reglas (para debugging)
  - `id` (uuid, primary key)
  - `rule_id` (uuid, foreign key)
  - `fecha_ejecucion` (timestamp)
  - `clientes_evaluados` (integer)
  - `clientes_calificados` (integer)
  - `emails_enviados` (integer)
  - `emails_fallidos` (integer)
  - `duracion_ms` (integer)
  - `errores` (jsonb, nullable)
  
  ## 2. Seguridad (RLS)
  - Todas las tablas tienen RLS habilitado
  - Solo usuarios autenticados pueden acceder
  - Políticas específicas por tabla
  
  ## 3. Índices
  - Índices en campos frecuentemente consultados para optimizar queries
  - Índices en foreign keys
  - Índices en campos de fecha para reportes
*/

-- Tabla: customers
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  nombre text NOT NULL,
  fecha_registro timestamptz DEFAULT now() NOT NULL,
  ultima_compra timestamptz,
  numero_compras integer DEFAULT 0 NOT NULL,
  monto_total_gastado decimal(10,2) DEFAULT 0 NOT NULL,
  monto_promedio_compra decimal(10,2) DEFAULT 0 NOT NULL,
  fecha_nacimiento date,
  segmento text DEFAULT 'nuevo',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Tabla: email_templates
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  asunto text NOT NULL,
  contenido_html text NOT NULL,
  contenido_texto text NOT NULL,
  variables_disponibles jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Tabla: marketing_rules
CREATE TABLE IF NOT EXISTS marketing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  activa boolean DEFAULT true NOT NULL,
  tipo_disparador text NOT NULL CHECK (tipo_disparador IN ('tiempo', 'evento', 'actualizacion')),
  condiciones jsonb NOT NULL,
  template_id uuid REFERENCES email_templates(id) ON DELETE SET NULL,
  frecuencia_maxima_dias integer DEFAULT 7,
  prioridad integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Tabla: campaign_logs
CREATE TABLE IF NOT EXISTS campaign_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  rule_id uuid REFERENCES marketing_rules(id) ON DELETE CASCADE NOT NULL,
  template_id uuid REFERENCES email_templates(id) ON DELETE SET NULL,
  email_destino text NOT NULL,
  asunto text NOT NULL,
  variables_usadas jsonb DEFAULT '{}'::jsonb,
  estado text DEFAULT 'programado' CHECK (estado IN ('programado', 'enviado', 'fallido')),
  fecha_envio timestamptz DEFAULT now() NOT NULL,
  external_id text,
  error_mensaje text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Tabla: campaign_metrics
CREATE TABLE IF NOT EXISTS campaign_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id uuid REFERENCES campaign_logs(id) ON DELETE CASCADE NOT NULL UNIQUE,
  abierto boolean DEFAULT false NOT NULL,
  fecha_apertura timestamptz,
  clicks integer DEFAULT 0 NOT NULL,
  fecha_primer_click timestamptz,
  convertido boolean DEFAULT false NOT NULL,
  fecha_conversion timestamptz,
  monto_conversion decimal(10,2),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Tabla: rule_execution_history
CREATE TABLE IF NOT EXISTS rule_execution_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES marketing_rules(id) ON DELETE CASCADE NOT NULL,
  fecha_ejecucion timestamptz DEFAULT now() NOT NULL,
  clientes_evaluados integer DEFAULT 0,
  clientes_calificados integer DEFAULT 0,
  emails_enviados integer DEFAULT 0,
  emails_fallidos integer DEFAULT 0,
  duracion_ms integer,
  errores jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_ultima_compra ON customers(ultima_compra);
CREATE INDEX IF NOT EXISTS idx_customers_segmento ON customers(segmento);
CREATE INDEX IF NOT EXISTS idx_customers_fecha_nacimiento ON customers(fecha_nacimiento);

CREATE INDEX IF NOT EXISTS idx_marketing_rules_activa ON marketing_rules(activa);
CREATE INDEX IF NOT EXISTS idx_marketing_rules_tipo_disparador ON marketing_rules(tipo_disparador);

CREATE INDEX IF NOT EXISTS idx_campaign_logs_customer ON campaign_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_rule ON campaign_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_fecha_envio ON campaign_logs(fecha_envio);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_estado ON campaign_logs(estado);

CREATE INDEX IF NOT EXISTS idx_campaign_metrics_log ON campaign_metrics(log_id);

CREATE INDEX IF NOT EXISTS idx_rule_execution_rule ON rule_execution_history(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_execution_fecha ON rule_execution_history(fecha_ejecucion);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_rules_updated_at BEFORE UPDATE ON marketing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_metrics_updated_at BEFORE UPDATE ON campaign_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS en todas las tablas
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_execution_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para customers
CREATE POLICY "Usuarios autenticados pueden ver clientes"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar clientes"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar clientes"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas RLS para email_templates
CREATE POLICY "Usuarios autenticados pueden ver plantillas"
  ON email_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear plantillas"
  ON email_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar plantillas"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar plantillas"
  ON email_templates FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para marketing_rules
CREATE POLICY "Usuarios autenticados pueden ver reglas"
  ON marketing_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear reglas"
  ON marketing_rules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar reglas"
  ON marketing_rules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar reglas"
  ON marketing_rules FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para campaign_logs
CREATE POLICY "Usuarios autenticados pueden ver logs"
  ON campaign_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear logs"
  ON campaign_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas RLS para campaign_metrics
CREATE POLICY "Usuarios autenticados pueden ver métricas"
  ON campaign_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear métricas"
  ON campaign_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar métricas"
  ON campaign_metrics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas RLS para rule_execution_history
CREATE POLICY "Usuarios autenticados pueden ver historial"
  ON rule_execution_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear historial"
  ON rule_execution_history FOR INSERT
  TO authenticated
  WITH CHECK (true);