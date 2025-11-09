/*
  # Datos de Ejemplo - Sistema de Marketing Automation D2G
  
  ## Descripción
  Inserta datos de ejemplo para demostrar el funcionamiento del sistema:
  - 3 plantillas de email
  - 3 reglas típicas de marketing automation
  - Clientes de muestra
  
  ## Plantillas
  1. Recompra (win-back)
  2. Cumpleaños
  3. Carrito abandonado
  
  ## Reglas
  1. Win-back: clientes sin compra en 30+ días
  2. Cumpleaños: clientes con cumpleaños en el mes actual
  3. Carrito abandonado: última compra < $500 y más de 15 días
*/

-- Insertar plantillas de email
INSERT INTO email_templates (id, nombre, asunto, contenido_html, contenido_texto, variables_disponibles)
VALUES 
  (
    gen_random_uuid(),
    'Win-back - Recompra',
    '¡Hace tiempo que no compras con nosotros, {{nombre_cliente}}!',
    '<html><body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">
      <div style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;\">
        <h1 style=\"color: white; margin: 0;\">Te extrañamos, {{nombre_cliente}}! 💙</h1>
      </div>
      <div style=\"background: white; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;\">
        <p style=\"font-size: 18px; color: #333;\">Han pasado varios días desde tu última compra y queríamos recordarte que seguimos aquí para ti.</p>
        <p style=\"font-size: 16px; color: #666;\">Tu última compra fue el <strong>{{ultima_compra}}</strong></p>
        <div style=\"background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;\">
          <h2 style=\"color: #667eea; margin-top: 0;\">¡20% de descuento!</h2>
          <p style=\"font-size: 24px; font-weight: bold; color: #333; margin: 10px 0;\">Código: VOLVEMOS20</p>
          <p style=\"color: #666; font-size: 14px;\">Válido por 7 días</p>
        </div>
        <div style=\"text-align: center; margin-top: 30px;\">
          <a href=\"https://d2g.com.mx/shop\" style=\"background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">Ver productos</a>
        </div>
        <p style=\"font-size: 14px; color: #999; margin-top: 40px; text-align: center;\">Has realizado {{numero_compras}} compras con nosotros por un total de {{monto_total_gastado}}</p>
      </div>
    </body></html>',
    'Hola {{nombre_cliente}},\n\nTe extrañamos! Han pasado varios días desde tu última compra ({{ultima_compra}}).\n\nTenemos un regalo para ti: 20% de descuento con el código VOLVEMOS20\n\nVisita: https://d2g.com.mx/shop\n\nGracias por ser cliente.',
    '["nombre_cliente", "ultima_compra", "numero_compras", "monto_total_gastado"]'::jsonb
  ),
  (
    gen_random_uuid(),
    'Cumpleaños feliz',
    '🎉 ¡Feliz cumpleaños {{nombre_cliente}}! Tenemos un regalo para ti',
    '<html><body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">
      <div style=\"background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 60px 40px; text-align: center; border-radius: 10px 10px 0 0;\">
        <h1 style=\"color: white; margin: 0; font-size: 36px;\">🎂 ¡Feliz Cumpleaños!</h1>
        <p style=\"color: white; font-size: 24px; margin: 10px 0;\">{{nombre_cliente}}</p>
      </div>
      <div style=\"background: white; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;\">
        <p style=\"font-size: 18px; color: #333; text-align: center;\">En tu día especial queremos celebrar contigo ��</p>
        <div style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin: 30px 0; text-align: center;\">
          <p style=\"color: white; font-size: 16px; margin: 0 0 10px 0;\">Tu regalo de cumpleaños:</p>
          <h2 style=\"color: white; margin: 10px 0; font-size: 32px;\">30% OFF</h2>
          <p style=\"font-size: 20px; font-weight: bold; color: white; background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 10px 0;\">CUMPLE30</p>
          <p style=\"color: white; font-size: 14px; margin: 10px 0 0 0;\">Válido durante todo tu mes de cumpleaños</p>
        </div>
        <div style=\"text-align: center; margin-top: 30px;\">
          <a href=\"https://d2g.com.mx/shop\" style=\"background: #f5576c; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">Usar mi regalo</a>
        </div>
        <p style=\"font-size: 14px; color: #999; margin-top: 40px; text-align: center;\">Gracias por ser parte de la familia D2G</p>
      </div>
    </body></html>',
    'Feliz cumpleaños {{nombre_cliente}}!\n\nEn tu día especial tenemos un regalo: 30% de descuento con el código CUMPLE30\n\nVálido durante todo tu mes de cumpleaños.\n\nVisita: https://d2g.com.mx/shop\n\nCelebra con nosotros!',
    '["nombre_cliente"]'::jsonb
  ),
  (
    gen_random_uuid(),
    'Carrito abandonado',
    '{{nombre_cliente}}, ¡completa tu compra y obtén envío gratis! 📦',
    '<html><body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">
      <div style=\"background: #2c3e50; padding: 40px; text-align: center; border-radius: 10px 10px 0 0;\">
        <h1 style=\"color: white; margin: 0;\">¡No te vayas sin tu compra!</h1>
      </div>
      <div style=\"background: white; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;\">
        <p style=\"font-size: 18px; color: #333;\">Hola {{nombre_cliente}},</p>
        <p style=\"font-size: 16px; color: #666;\">Notamos que estuviste navegando en nuestra tienda pero no completaste tu compra.</p>
        <div style=\"background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0;\">
          <p style=\"margin: 0; color: #856404; font-size: 16px;\">⏰ <strong>Oferta por tiempo limitado:</strong></p>
          <p style=\"margin: 10px 0 0 0; color: #856404; font-size: 18px; font-weight: bold;\">ENVÍO GRATIS + 15% descuento</p>
        </div>
        <div style=\"background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;\">
          <p style=\"font-size: 14px; color: #666; margin: 0 0 10px 0;\">Usa este código al finalizar tu compra:</p>
          <p style=\"font-size: 24px; font-weight: bold; color: #27ae60; margin: 10px 0;\">COMPLETA15</p>
          <p style=\"font-size: 12px; color: #999; margin: 10px 0 0 0;\">Válido por 48 horas</p>
        </div>
        <div style=\"text-align: center; margin-top: 30px;\">
          <a href=\"https://d2g.com.mx/cart\" style=\"background: #27ae60; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;\">Completar mi compra</a>
        </div>
        <p style=\"font-size: 14px; color: #999; margin-top: 40px; text-align: center;\">Si tienes dudas, contáctanos. ¡Estamos para ayudarte!</p>
      </div>
    </body></html>',
    'Hola {{nombre_cliente}},\n\nNotamos que no completaste tu compra.\n\nPor tiempo limitado: ENVÍO GRATIS + 15% descuento con el código COMPLETA15\n\nVálido por 48 horas.\n\nVisita: https://d2g.com.mx/cart\n\nEstamos para ayudarte!',
    '["nombre_cliente"]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Obtener IDs de las plantillas recién insertadas
DO $$
DECLARE
  template_winback_id uuid;
  template_birthday_id uuid;
  template_cart_id uuid;
BEGIN
  -- Obtener ID de plantilla win-back
  SELECT id INTO template_winback_id 
  FROM email_templates 
  WHERE nombre = 'Win-back - Recompra' 
  LIMIT 1;
  
  -- Obtener ID de plantilla cumpleaños
  SELECT id INTO template_birthday_id 
  FROM email_templates 
  WHERE nombre = 'Cumpleaños feliz' 
  LIMIT 1;
  
  -- Obtener ID de plantilla carrito abandonado
  SELECT id INTO template_cart_id 
  FROM email_templates 
  WHERE nombre = 'Carrito abandonado' 
  LIMIT 1;

  -- Insertar reglas de marketing
  INSERT INTO marketing_rules (nombre, descripcion, activa, tipo_disparador, condiciones, template_id, frecuencia_maxima_dias, prioridad)
  VALUES 
    (
      'Win-back: Clientes inactivos 30+ días',
      'Envía email de recuperación a clientes que no han comprado en más de 30 días',
      true,
      'tiempo',
      jsonb_build_object(
        'logic', 'AND',
        'conditions', jsonb_build_array(
          jsonb_build_object(
            'field', 'ultima_compra',
            'operator', 'days_ago',
            'value', 30
          ),
          jsonb_build_object(
            'field', 'numero_compras',
            'operator', '>',
            'value', 0
          )
        )
      ),
      template_winback_id,
      30,
      10
    ),
    (
      'Cumpleaños del mes',
      'Envía felicitación y cupón especial a clientes en su mes de cumpleaños',
      true,
      'tiempo',
      jsonb_build_object(
        'logic', 'AND',
        'conditions', jsonb_build_array(
          jsonb_build_object(
            'field', 'fecha_nacimiento',
            'operator', 'is_birthday_month',
            'value', true
          )
        )
      ),
      template_birthday_id,
      365,
      5
    ),
    (
      'Carrito abandonado: Compra baja',
      'Incentiva a clientes con compras pequeñas recientes a aumentar ticket promedio',
      true,
      'tiempo',
      jsonb_build_object(
        'logic', 'AND',
        'conditions', jsonb_build_array(
          jsonb_build_object(
            'field', 'monto_promedio_compra',
            'operator', '<',
            'value', 500
          ),
          jsonb_build_object(
            'field', 'ultima_compra',
            'operator', 'days_ago',
            'value', 15
          ),
          jsonb_build_object(
            'field', 'numero_compras',
            'operator', '>=',
            'value', 1
          )
        )
      ),
      template_cart_id,
      15,
      7
    )
  ON CONFLICT DO NOTHING;
END $$;

-- Insertar clientes de muestra
INSERT INTO customers (email, nombre, fecha_registro, ultima_compra, numero_compras, monto_total_gastado, monto_promedio_compra, fecha_nacimiento, segmento)
VALUES 
  (
    'maria.gonzalez@example.com',
    'María González',
    '2024-01-15'::timestamptz,
    '2024-09-01'::timestamptz,
    5,
    2500.00,
    500.00,
    '1990-11-15'::date,
    'regular'
  ),
  (
    'carlos.rodriguez@example.com',
    'Carlos Rodríguez',
    '2023-06-20'::timestamptz,
    '2024-10-20'::timestamptz,
    12,
    8500.00,
    708.33,
    '1985-03-22'::date,
    'vip'
  ),
  (
    'ana.martinez@example.com',
    'Ana Martínez',
    '2024-08-10'::timestamptz,
    '2024-10-15'::timestamptz,
    2,
    650.00,
    325.00,
    '1995-11-08'::date,
    'nuevo'
  ),
  (
    'juan.lopez@example.com',
    'Juan López',
    '2023-03-05'::timestamptz,
    '2024-07-10'::timestamptz,
    8,
    3200.00,
    400.00,
    '1988-05-30'::date,
    'regular'
  ),
  (
    'laura.hernandez@example.com',
    'Laura Hernández',
    '2024-02-28'::timestamptz,
    '2024-09-25'::timestamptz,
    3,
    1200.00,
    400.00,
    '1992-11-20'::date,
    'nuevo'
  )
ON CONFLICT (email) DO NOTHING;