import { NextRequest } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, menuItems, tables, profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-guard';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(['admin', 'cashier', 'kitchen']);
    const status = new URL(req.url).searchParams.get('status');
    let query = db.select({
      id: orders.id,
      code: orders.code,
      tableNumber: tables.number,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      total: orders.total,
      note: orders.note,
      createdAt: orders.createdAt,
    }).from(orders).innerJoin(tables, eq(orders.tableId, tables.id));

    const result = status ? await query.where(eq(orders.status, status as never)) : await query;
    return Response.json({ success: true, data: result });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return Response.json({ success: false, message: err.message ?? 'Error' }, { status: err.status ?? 500 });
  }
}
