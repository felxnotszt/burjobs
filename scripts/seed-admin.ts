// Minimal seed: buat user admin via Supabase Admin API (REST, no direct DB)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin = createClient(supabaseUrl, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data, error } = await admin.auth.admin.createUser({
    email: 'admin@burjoku.id',
    password: 'admin123',
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('User already exists — skipping');
      return;
    }
    throw error;
  }

  console.log('User created:', data.user?.email, data.user?.id);

  // Insert profile via REST
  if (data.user) {
    const { error: profileErr } = await admin.from('profiles').insert({
      id: data.user.id,
      name: 'Admin',
      role: 'admin',
    });
    if (profileErr && !profileErr.message.includes('duplicate')) {
      console.error('Profile insert warning:', profileErr.message);
    } else {
      console.log('Profile created');
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
