import { NextRequest } from 'next/server';
import { db } from '@/db';
import { tables } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const table = await db.select().from(tables).where(eq(tables.token, token)).limit(1);
  if (!table.length) {
    return Response.json({ success: false, message: 'Meja tidak ditemukan' }, { status: 404 });
  }
  return Response.json({ success: true, data: table[0] });
}
