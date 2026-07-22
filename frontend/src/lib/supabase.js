import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente devem ser configuradas no seu arquivo .env
// Exemplo (no frontend, usando Vite):
// VITE_SUPABASE_URL=https://xyzcompany.supabase.co
// VITE_SUPABASE_ANON_KEY=public-anon-key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kxgrzaaajrmqtrahbvyr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_c-xruxE_cDeBpW15nbMdrg_vB6a5H_d';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL ou Anon Key não encontradas nas variáveis de ambiente.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
