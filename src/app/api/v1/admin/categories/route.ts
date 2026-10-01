import { NextRequest } from 'next/server';
import { db } from '@/db';
import { categories, profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-guard';
import { categorySchema } from '@/lib/validators';

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
