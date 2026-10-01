'use client';
import { useState, useEffect } from 'react';
import { formatRupiah } from '@/lib/utils/format-rupiah';
import { useCartStore, CartItem } from '@/stores/cart-store';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imagePath: string | null;
  isPopular: boolean;
  categoryId: string;
  categoryName: string;
}

interface Category {
  id: string;
  name: string;
}

export default function CustomerMenu({ token, tableNumber }: { token: string; tableNumber: number }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [orderStatus, setOrderStatus] = useState<any>(null);

  const cart = useCartStore();

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/v1/menu`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
        const cats: Category[] = [];
        const seen = new Set<string>();
        for (const item of data.data) {
          if (!seen.has(item.categoryId)) {
            seen.add(item.categoryId);
            cats.push({ id: item.categoryId, name: item.categoryName });
          }
        }
        setCategories(cats);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = items.filter(i => {
    if (activeCategory && i.categoryId !== activeCategory) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function addToCart(item: MenuItem) {
    cart.addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
      optionValueIds: [],
      optionLabels: [],
      extraPrice: 0,
      note: '',
    });
  }

  async function placeOrder() {
    const res = await fetch(`/api/v1/tables/${token}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment_method: 'cashier',
        items: cart.items.map(i => ({
          menu_item_id: i.menuItemId,
          qty: i.qty,
          option_value_ids: i.optionValueIds,
          note: i.note,
        })),
      }),
    });
    const data = await res.json();
    if (data.success) {
      cart.clear();
      setShowCart(false);
      setOrderStatus(data.data);
    }
  }

  if (loading) return <div className="p-4 text-center">Memuat menu...</div>;

  if (orderStatus) {
    return <OrderStatusView code={orderStatus.code} token={token} onBack={() => setOrderStatus(null)} />;
  }

  return (
    <div className="pb-20">
      <div className="p-4">
        <input
          type="search"
          placeholder="Cari menu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${!activeCategory ? 'bg-green-900 text-white' : 'bg-gray-200'}`}
        >
          Semua
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${activeCategory === c.id ? 'bg-green-900 text-white' : 'bg-gray-200'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        {filtered.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
            {item.imagePath && (
              <img src={item.imagePath} alt={item.name} className="w-full h-32 object-cover" />
            )}
            <div className="p-3">
              <h3 className="font-semibold text-sm">{item.name}</h3>
              {item.isPopular && <span className="text-xs text-orange-600">Populer</span>}
              <p className="text-green-900 font-bold text-sm mt-1">{formatRupiah(item.price)}</p>
              <button
                onClick={() => addToCart(item)}
                className="w-full mt-2 bg-green-900 text-white py-1 rounded text-sm"
              >
                + Keranjang
              </button>
            </div>
          </div>
        ))}
      </div>

      {cart.count() > 0 && (
        <div
          onClick={() => setShowCart(true)}
          className="fixed bottom-0 left-0 right-0 bg-orange-600 text-white p-4 flex justify-between items-center cursor-pointer max-w-md mx-auto"
        >
          <span>{cart.count()} item</span>
          <span className="font-bold">{formatRupiah(cart.total())}</span>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-bold">Keranjang</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-500">&times;</button>
            </div>
            {cart.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{formatRupiah(item.price)} x {item.qty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => item.qty <= 1 ? cart.removeItem(i) : cart.updateQty(i, item.qty - 1)} className="w-6 h-6 bg-gray-200 rounded">-</button>
                  <span className="text-sm">{item.qty}</span>
                  <button onClick={() => cart.updateQty(i, item.qty + 1)} className="w-6 h-6 bg-gray-200 rounded">+</button>
                </div>
              </div>
            ))}
            <div className="flex justify-between font-bold mt-4">
              <span>Total</span>
              <span>{formatRupiah(cart.total())}</span>
            </div>
            <button onClick={placeOrder} className="w-full bg-green-900 text-white py-3 rounded-lg mt-4 font-semibold">
              Pesan Sekarang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderStatusView({ code, token, onBack }: { code: string; token: string; onBack: () => void }) {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    async function poll() {
      const res = await fetch(`/api/v1/orders/${code}?token=${token}`);
      const data = await res.json();
      if (data.success) setOrder(data.data);
    }
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [code, token]);

  const statusLabel: Record<string, string> = {
    pending: 'Menunggu',
    accepted: 'Diterima',
    preparing: 'Diproses',
    ready: 'Siap',
    served: 'Disajikan',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };

  if (!order) return <div className="p-4 text-center">Memuat status...</div>;

  return (
    <div className="p-4">
      <button onClick={onBack} className="text-green-900 mb-4">&larr; Kembali ke Menu</button>
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h2 className="text-lg font-bold mb-2">{order.code}</h2>
        <div className="inline-block px-4 py-2 rounded-full bg-green-100 text-green-900 font-bold text-lg mb-4">
          {statusLabel[order.status] ?? order.status}
        </div>
        <p className="text-gray-500 text-sm">Total: {formatRupiah(order.total)}</p>
        <p className="text-xs text-gray-400 mt-2">Status diperbarui otomatis tiap 5 detik</p>
      </div>
    </div>
  );
}