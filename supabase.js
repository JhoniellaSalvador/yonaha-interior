// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

const SUPABASE_URL = "https://wqrjbkapjwnzfilgjcci.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_M-XebtS40PbrpeXBYiBoYQ_dkJ41jx2";

window.db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

console.log("✅ Supabase Connected");