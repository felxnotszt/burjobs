'use client';
import { useState, useEffect } from 'react';
import { formatRupiah } from '@/lib/utils/format-rupiah';
import { useCartStore } from '@/stores/cart-store';

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const res = await fetch('/api/v1/staff/orders');
      const data = await res.json();
      if (data.success) setOrders(data.data);
      setLoading(false);
    }
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/v1/staff/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  }

  const statusFlow = ['pending', 'accepted', 'preparing', 'ready', 'served', 'completed', 'cancelled'];

  if (loading) return <div className="p-4">Memuat...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-green-900 mb-4">Dapur</h1>
      <div className="space-y-4">
        {orders.map(order => {
          const idx = statusFlow.indexOf(order.status);
          const nextStatus = statusFlow[idx + 1];
          return (
            <div key={order.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
              <div className="flex justify-between mb-2">
                <h2 className="font-semibold">Meja {order.tableNumber} — {order.code}</h2>
                <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">{order.status}</span>
              </div>
              {nextStatus && (
                <button
                  onClick={() => updateStatus(order.id, nextStatus)}
                  className="w-full bg-green-900 text-white py-2 rounded hover:bg-green-800"
                >
                  {nextStatus}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}