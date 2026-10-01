import { NextRequest } from 'next/server';
import { db } from '@/db';
import { menuItems, menuOptions, menuOptionValues, categories, profiles } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { menuItemSchema } from '@/lib/validators';

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
    const result = await db.select().from(menuItems).innerJoin(categories, eq(menuItems.categoryId, categories.id));
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
    const parsed = menuItemSchema.safeParse(body);
    if (!parsed.success) return Response.json({ success: false, message: 'Validasi gagal', errors: parsed.error.flatten() }, { status: 422 });
    const [item] = await db.insert(menuItems).values({
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      categoryId: parsed.data.category_id,
      isAvailable: parsed.data.is_available,
      isPopular: parsed.data.is_popular,
      sortOrder: parsed.data.sort_order,
    }).returning();
    return Response.json({ success: true, data: item }, { status: 201 });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return Response.json({ success: false, message: err.message ?? 'Error' }, { status: err.status ?? 500 });
  }
}