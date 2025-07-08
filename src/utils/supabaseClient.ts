import { createClient } from "@supabase/supabase-js";

// Validación de variables de entorno en desarrollo
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL no está definida");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Configuración optimizada para producción
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce", // Más seguro para aplicaciones SPA
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Limita eventos en tiempo real
    },
  },
  db: {
    schema: "public",
  },
});

// Tipos de base de datos para mejor tipo de seguridad
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: number;
          name: string;
          email: string;
          phone: string;
          address: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          name: string;
          email: string;
          phone: string;
          address: string;
          user_id: string;
        };
        Update: Partial<{
          name: string;
          email: string;
          phone: string;
          address: string;
        }>;
      };
      visits: {
        Row: {
          id: number;
          company_id: number;
          user_id: string;
          start_time: string;
          end_time: string;
          status: "creada" | "terminada" | "cancelada";
          completed_at: string | null;
          cancelled_at: string | null;
          report_summary: string | null;
          created_at: string;
        };
        Insert: {
          company_id: number;
          user_id: string;
          start_time: string;
          end_time: string;
          status?: "creada" | "terminada" | "cancelada";
        };
        Update: Partial<{
          start_time: string;
          end_time: string;
          status: "creada" | "terminada" | "cancelada";
          completed_at: string | null;
          cancelled_at: string | null;
          report_summary: string | null;
        }>;
      };
      tasks: {
        Row: {
          id: number;
          visit_id: number;
          title: string;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          visit_id: number;
          title: string;
          is_completed?: boolean;
        };
        Update: Partial<{
          title: string;
          is_completed: boolean;
        }>;
      };
    };
  };
};
