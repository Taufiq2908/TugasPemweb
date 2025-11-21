const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "[Supabase] SUPABASE_URL atau SERVICE_ROLE_KEY belum diset di file .env"
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
