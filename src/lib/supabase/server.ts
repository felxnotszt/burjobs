import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );
}

export async function getUser() {
  // Fallback: JWT from cookie (local auth)
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (token) {
    const { getSession } = await import('@/lib/auth');
    const session = await getSession(token);
    if (session) return { id: session.userId, role: session.role };
  }
  return null;
}
