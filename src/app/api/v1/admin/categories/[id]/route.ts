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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) return Response.json({ success: false, message: 'Validasi gagal', errors: parsed.error.flatten() }, { status: 422 });

    const [updated] = await db.update(categories).set(parsed.data).where(eq(categories.id, id)).returning();
    return Response.json({ success: true, data: updated });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return Response.json({ success: false, message: err.message ?? 'Error' }, { status: err.status ?? 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.delete(categories).where(eq(categories.id, id));
    return Response.json({ success: true, message: 'Kategori dihapus' });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return Response.json({ success: false, message: err.message ?? 'Error' }, { status: err.status ?? 500 });
  }
}
