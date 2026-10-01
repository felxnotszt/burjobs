import { NextRequest } from 'next/server';
import { db } from '@/db';
import { orders, profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { payOrderSchema } from '@/lib/validators';

async function requireRole(allowed: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw { status: 401, message: 'Unauthorized' };
  const profile = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  if (!profile.length || !allowed.includes(profile[0].role)) throw { status: 403, message: 'Forbidden' };
  return user;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(['admin', 'cashier']);
    const { id } = await params;
    const body = await req.json();
    const parsed = payOrderSchema.safeParse(body);
    if (!parsed.success) return Response.json({ success: false, message: 'Validasi gagal', errors: parsed.error.flatten() }, { status: 422 });

    await db.update(orders).set({
      paymentStatus: 'paid',
      paymentMethod: parsed.data.payment_method,
      paidAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(orders.id, id));
    return Response.json({ success: true, message: 'Pembayaran dikonfirmasi' });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return Response.json({ success: false, message: err.message ?? 'Error' }, { status: err.status ?? 500 });
  }
}
