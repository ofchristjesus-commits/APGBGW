import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente devem ser configuradas no seu arquivo .env
// Exemplo (no backend, usando Node.js com dotenv):
// SUPABASE_URL=https://xyzcompany.supabase.co
// SUPABASE_ANON_KEY=public-anon-key
// SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (Apenas para operações administrativas)

const supabaseUrl = process.env.SUPABASE_URL || 'https://kxgrzaaajrmqtrahbvyr.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_c-xruxE_cDeBpW15nbMdrg_vB6a5H_d';

// Para usar a Service Role Key (que ignora as políticas RLS)
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL ou Key não encontradas nas variáveis de ambiente.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
