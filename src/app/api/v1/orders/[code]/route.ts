import { NextRequest } from 'next/server';
import { db } from '@/db';
import { orders, orderItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const token = new URL(req.url).searchParams.get('token');
  if (!token) return Response.json({ success: false, message: 'Token wajib' }, { status: 422 });

  // Validate table ownership
  const order = await db.select().from(orders).where(eq(orders.code, code)).limit(1);
  if (!order.length) return Response.json({ success: false, message: 'Order tidak ditemukan' }, { status: 404 });

  const { getOrderWithItems } = await import('@/services/order-service');
  try {
    const result = await getOrderWithItems(code, token);
    return Response.json({ success: true, data: result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ success: false, message: msg }, { status: 404 });
  }
}
