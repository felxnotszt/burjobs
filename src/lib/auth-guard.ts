// Single auth guard: works in both local (JWT) and Supabase modes.
// Replaces 5x duplicated requireRole/requireAdmin across routes.
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface AuthUser {
  id: string;
  role: string;
}

/** Get current user: tries Supabase first, falls back to JWT cookie (local). */
async function getCurrentUser(): Promise<AuthUser | null> {
  // Try Supabase auth
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Look up role from DB via Drizzle (works with both local & Supabase)
      const row = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
      if (row.length) return { id: user.id, role: row[0].role };
    }
  } catch {
    // Supabase not configured or no session — fall through to JWT
  }

  // Fallback: JWT from cookie (local dev mode)
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (token) {
      const { getSession } = await import('@/lib/auth');
      const session = await getSession(token);
      if (session) return { id: session.userId, role: session.role };
    }
  } catch {}

  return null;
}

/**
 * Require authenticated user with specific role(s).
 * Throws { status, message } on failure — catch and return Response in routes.
 *
 * Usage:
 *   const user = await requireAuth(['admin', 'cashier']);
 */
export async function requireAuth(allowedRoles: string[]): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw { status: 401, message: 'Unauthorized' };
  if (!allowedRoles.includes(user.role)) throw { status: 403, message: 'Forbidden' };
  return user;
}

/** Shorthand for admin-only routes */
export async function requireAdmin(): Promise<AuthUser> {
  return requireAuth(['admin']);
}
