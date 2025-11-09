import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

export function Auth() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">D2G Marketing Automation</h1>
          <p className="text-gray-600">Sistema de automatización de campañas</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Contraseña',
                  email_input_placeholder: 'Tu email',
                  password_input_placeholder: 'Tu contraseña',
                  button_label: 'Iniciar sesión',
                  loading_button_label: 'Iniciando sesión...',
                  social_provider_text: 'Iniciar sesión con {{provider}}',
                  link_text: '¿Ya tienes cuenta? Inicia sesión',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Contraseña',
                  email_input_placeholder: 'Tu email',
                  password_input_placeholder: 'Tu contraseña',
                  button_label: 'Registrarse',
                  loading_button_label: 'Registrando...',
                  social_provider_text: 'Registrarse con {{provider}}',
                  link_text: '¿No tienes cuenta? Regístrate',
                },
                forgotten_password: {
                  email_label: 'Email',
                  password_label: 'Contraseña',
                  email_input_placeholder: 'Tu email',
                  button_label: 'Enviar instrucciones',
                  loading_button_label: 'Enviando...',
                  link_text: '¿Olvidaste tu contraseña?',
                },
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
}
