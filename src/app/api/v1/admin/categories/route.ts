import { NextRequest } from 'next/server';
import { db } from '@/db';
import { categories, profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { categorySchema } from '@/lib/validators';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw { status: 401, message: 'Unauthorized' };
  const profile = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  if (!profile.length || profile[0].role !== 'admin') throw { status: 403, message: 'Forbidden' };
}

export async function GET() {
  try {
    await requireAdmin();
    const result = await db.select().from(categories).orderBy(categories.sortOrder);
    return Response.json({ success: true, data: result });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return Response.json({ success: false, message: err.message ?? 'Error' }, { status: err.status ?? 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return Response.json({ success: false, message: 'Validasi gagal', errors: parsed.error.flatten() }, { status: 422 });

    const [cat] = await db.insert(categories).values(parsed.data).returning();
    return Response.json({ success: true, data: cat }, { status: 201 });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return Response.json({ success: false, message: err.message ?? 'Error' }, { status: err.status ?? 500 });
  }
}
