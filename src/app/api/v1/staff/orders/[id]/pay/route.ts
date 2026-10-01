import { NextRequest } from 'next/server';
import { db } from '@/db';
import { orders, profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-guard';
import { payOrderSchema } from '@/lib/validators';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(['admin', 'cashier']);
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
