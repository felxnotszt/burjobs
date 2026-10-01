import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const staffPaths = ['/kitchen', '/cashier', '/admin'];
  const isStaffPath = staffPaths.some(p => request.nextUrl.pathname.startsWith(p));

  if (!isStaffPath) return response;

  const user = await requireAuthMiddleware(request);
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (request.nextUrl.pathname.startsWith('/admin') && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/kitchen', request.url));
  }

  return response;
}

async function requireAuthMiddleware(request: NextRequest): Promise<{ role: string } | null> {
  // Try Supabase session
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const profile = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
      if (profile.length) return profile[0];
    }
  } catch {
    // Supabase not configured — fall through
  }

  // Fallback: JWT session cookie (local mode)
  const token = request.cookies.get('session')?.value;
  if (token) {
    try {
      const { getSession } = await import('@/lib/auth');
      const session = await getSession(token);
      if (session) return { role: session.role };
    } catch {}
  }

  return null;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
