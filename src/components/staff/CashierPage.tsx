'use client';
import { useState, useEffect } from 'react';
import { formatRupiah } from '@/lib/utils/format-rupiah';

export default function CashierPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const res = await fetch('/api/v1/staff/orders');
      const data = await res.json();
      if (data.success) setOrders(data.data.filter((o: any) => o.paymentStatus === 'unpaid'));
      setLoading(false);
    }
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  async function markPaid(id: string) {
    await fetch(`/api/v1/staff/orders/${id}/pay`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_method: 'cashier' }),
    });
  }

  if (loading) return <div className="p-4">Memuat...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-green-900 mb-4">Kasir</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-600">
            <div className="flex justify-between mb-2">
              <h2 className="font-semibold">Meja {order.tableNumber} — {order.code}</h2>
              <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-800">{formatRupiah(order.total)}</span>
            </div>
            <button
              onClick={() => markPaid(order.id)}
              className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
            >
              Tandai Lunas
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}