import { db } from '@/db';
import { tables } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import CustomerMenu from '@/components/customer/CustomerMenu';
import Link from 'next/link';

export default async function CustomerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let table;

  if (token === 'demo') {
    const rows = await db.select().from(tables).where(eq(tables.isActive, true)).limit(1);
    table = rows[0];
  } else {
    const rows = await db.select().from(tables).where(eq(tables.token, token)).limit(1);
    table = rows[0];
  }

  if (!table || !table.isActive) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-900 text-white p-4 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">BurjoKu</h1>
          <p className="text-sm text-green-200">Meja No. {table.number}</p>
        </div>
        <Link href="/login" className="text-xs bg-green-800/60 hover:bg-green-700 px-3 py-2 rounded-lg whitespace-nowrap">
          Staff
        </Link>
      </header>
      <CustomerMenu token={table.token} tableNumber={table.number} />
    </div>
  );
}