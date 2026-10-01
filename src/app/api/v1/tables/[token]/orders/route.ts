import { NextRequest } from 'next/server';
import { createOrderSchema } from '@/lib/validators';
import { createOrder, getOrdersByTable } from '@/services/order-service';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const orders = await getOrdersByTable(token);
    return Response.json({ success: true, data: orders });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ success: false, message: msg }, { status: 404 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, message: 'Validasi gagal', errors: parsed.error.flatten() }, { status: 422 });
    }
    const order = await createOrder(token, parsed.data);
    return Response.json({ success: true, data: order, message: 'Pesanan dibuat' }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ success: false, message: msg }, { status: 422 });
  }
}
