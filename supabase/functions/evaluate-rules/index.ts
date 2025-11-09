import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Condition {
  field: string;
  operator: string;
  value: any;
}

interface RuleConditions {
  logic: 'AND' | 'OR';
  conditions: Condition[];
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const startTime = Date.now();

    const { data: rules, error: rulesError } = await supabase
      .from('marketing_rules')
      .select('*')
      .eq('activa', true)
      .order('prioridad', { ascending: false });

    if (rulesError) throw rulesError;

    const results = [];

    for (const rule of rules || []) {
      const ruleStartTime = Date.now();
      
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*');

      if (customersError) throw customersError;

      let clientesCalificados = 0;
      let emailsEnviados = 0;
      let emailsFallidos = 0;
      const errores: any[] = [];

      for (const customer of customers || []) {
        const cumpleCondiciones = evaluateConditions(
          customer,
          rule.condiciones as RuleConditions
        );

        if (cumpleCondiciones) {
          const yaRecibioReciente = await checkRecentCampaign(
            supabase,
            customer.id,
            rule.id,
            rule.frecuencia_maxima_dias || 7
          );

          if (!yaRecibioReciente) {
            clientesCalificados++;
            
            try {
              const emailEnviado = await sendEmail(
                supabase,
                customer,
                rule
              );
              
              if (emailEnviado) {
                emailsEnviados++;
              } else {
                emailsFallidos++;
              }
            } catch (error) {
              emailsFallidos++;
              errores.push({
                customer_id: customer.id,
                error: error.message,
              });
            }
          }
        }
      }

      const ruleDuration = Date.now() - ruleStartTime;

      await supabase.from('rule_execution_history').insert({
        rule_id: rule.id,
        fecha_ejecucion: new Date().toISOString(),
        clientes_evaluados: customers?.length || 0,
        clientes_calificados: clientesCalificados,
        emails_enviados: emailsEnviados,
        emails_fallidos: emailsFallidos,
        duracion_ms: ruleDuration,
        errores: errores.length > 0 ? errores : null,
      });

      results.push({
        rule_id: rule.id,
        rule_name: rule.nombre,
        clientes_evaluados: customers?.length || 0,
        clientes_calificados: clientesCalificados,
        emails_enviados: emailsEnviados,
        emails_fallidos: emailsFallidos,
      });
    }

    const totalDuration = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        totalDuration,
        results,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function evaluateConditions(
  customer: any,
  ruleConditions: RuleConditions
): boolean {
  const { logic, conditions } = ruleConditions;

  const results = conditions.map((condition) =>
    evaluateCondition(customer, condition)
  );

  if (logic === 'AND') {
    return results.every((r) => r === true);
  } else {
    return results.some((r) => r === true);
  }
}

function evaluateCondition(customer: any, condition: Condition): boolean {
  const fieldValue = getNestedValue(customer, condition.field);
  const { operator, value } = condition;

  switch (operator) {
    case '>':
      return fieldValue > value;
    case '<':
      return fieldValue < value;
    case '>=':
      return fieldValue >= value;
    case '<=':
      return fieldValue <= value;
    case '=':
    case '==':
      return fieldValue == value;
    case '!=':
      return fieldValue != value;
    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
    case 'not_contains':
      return !String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
    case 'starts_with':
      return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());
    case 'ends_with':
      return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase());
    case 'between':
      return fieldValue >= value[0] && fieldValue <= value[1];
    case 'days_ago':
      if (!fieldValue) return false;
      const daysDiff = (Date.now() - new Date(fieldValue).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff >= value;
    case 'days_ahead':
      if (!fieldValue) return false;
      const daysAhead = (new Date(fieldValue).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysAhead >= 0 && daysAhead <= value;
    case 'is_birthday_month':
      if (!fieldValue) return false;
      const birthMonth = new Date(fieldValue).getMonth();
      const currentMonth = new Date().getMonth();
      return birthMonth === currentMonth;
    default:
      return false;
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

async function checkRecentCampaign(
  supabase: any,
  customerId: string,
  ruleId: string,
  maxDays: number
): Promise<boolean> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxDays);

  const { data, error } = await supabase
    .from('campaign_logs')
    .select('id')
    .eq('customer_id', customerId)
    .eq('rule_id', ruleId)
    .gte('fecha_envio', cutoffDate.toISOString())
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

async function sendEmail(
  supabase: any,
  customer: any,
  rule: any
): Promise<boolean> {
  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', rule.template_id)
    .single();

  if (templateError) throw templateError;

  const variables = {
    nombre_cliente: customer.nombre,
    email: customer.email,
    ultima_compra: customer.ultima_compra
      ? new Date(customer.ultima_compra).toLocaleDateString('es-MX')
      : 'Nunca',
    numero_compras: customer.numero_compras,
    monto_total_gastado: `$${customer.monto_total_gastado}`,
    monto_promedio_compra: `$${customer.monto_promedio_compra}`,
    segmento: customer.segmento,
  };

  const asuntoFinal = replaceVariables(template.asunto, variables);
  const contenidoFinal = replaceVariables(template.contenido_html, variables);

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || 're_aM5paLV3_GpsTsXbW5C447U8TjfTWGUf4';

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Marketing <marketing@dumpling-tech.com>',
        to: [customer.email],
        subject: asuntoFinal,
        html: contenidoFinal,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      throw new Error(`Resend error: ${JSON.stringify(resendData)}`);
    }

    const { data: logData, error: logError } = await supabase
      .from('campaign_logs')
      .insert({
        customer_id: customer.id,
        rule_id: rule.id,
        template_id: template.id,
        email_destino: customer.email,
        asunto: asuntoFinal,
        variables_usadas: variables,
        estado: 'enviado',
        fecha_envio: new Date().toISOString(),
      })
      .select()
      .single();

    if (logError) throw logError;

    await supabase.from('campaign_metrics').insert({
      log_id: logData.id,
    });

    return true;
  } catch (error) {
    await supabase.from('campaign_logs').insert({
      customer_id: customer.id,
      rule_id: rule.id,
      template_id: template.id,
      email_destino: customer.email,
      asunto: asuntoFinal,
      variables_usadas: variables,
      estado: 'fallido',
      fecha_envio: new Date().toISOString(),
    });

    throw error;
  }
}

function replaceVariables(text: string, variables: Record<string, any>): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, String(value));
  }
  return result;
}