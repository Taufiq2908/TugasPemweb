require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cek apakah key terbaca
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL atau Key tidak ditemukan di file .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
