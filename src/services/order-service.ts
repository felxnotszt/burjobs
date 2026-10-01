import { db } from '@/db';
import { orders, orderItems, menuItems, menuOptionValues, tables, settings } from '@/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';

export async function createOrder(tableToken: string, data: {
  payment_method: 'cashier' | 'qris';
  note?: string;
  items: { menu_item_id: string; qty: number; option_value_ids?: string[]; note?: string }[];
}) {
  // Validate table
  const table = await db.select().from(tables).where(eq(tables.token, tableToken)).limit(1);
  if (!table.length) throw new Error('Meja tidak ditemukan');

  // Fetch menu items & recalculate prices server-side
  const menuItemIds = data.items.map(i => i.menu_item_id);
  const dbMenuItems = await db.select().from(menuItems).where(inArray(menuItems.id, menuItemIds));

  // Fetch settings for tax/service
  const taxPercent = Number((await db.select().from(settings).where(eq(settings.key, 'tax_percent')).limit(1))[0]?.value ?? 0);
  const servicePercent = Number((await db.select().from(settings).where(eq(settings.key, 'service_percent')).limit(1))[0]?.value ?? 0);

  let subtotal = 0;
  const orderItemsData = [];

  for (const item of data.items) {
    const menuItem = dbMenuItems.find(m => m.id === item.menu_item_id);
    if (!menuItem || !menuItem.isAvailable) throw new Error(`Menu ${item.menu_item_id} tidak tersedia`);

    let itemTotal = menuItem.price * item.qty;
    let optionsSnapshot: { name: string; label: string; extraPrice: number }[] = [];

    if (item.option_value_ids?.length) {
      const optVals = await db.select().from(menuOptionValues).where(inArray(menuOptionValues.id, item.option_value_ids));
      for (const ov of optVals) {
        itemTotal += ov.extraPrice * item.qty;
        optionsSnapshot.push({ name: ov.label, label: ov.label, extraPrice: ov.extraPrice });
      }
    }

    subtotal += itemTotal;
    orderItemsData.push({
      menuItemId: menuItem.id,
      nameSnapshot: menuItem.name,
      priceSnapshot: menuItem.price,
      qty: item.qty,
      optionsSnapshot: optionsSnapshot,
      note: item.note,
      subtotal: itemTotal,
    });
  }

  const tax = Math.round(subtotal * taxPercent / 100);
  const service = Math.round(subtotal * servicePercent / 100);
  const total = subtotal + tax + service;

  // Generate order code: BJ-YYYYMMDD-NNN
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const countResult = await db.select({ count: sql<number>`count(*)::int` }).from(orders).where(sql`created_at::date = current_date`);
  const seq = String((countResult[0]?.count ?? 0) + 1).padStart(3, '0');
  const code = `BJ-${today}-${seq}`;

  const [order] = await db.insert(orders).values({
    code,
    tableId: table[0].id,
    paymentMethod: data.payment_method,
    note: data.note,
    subtotal,
    tax,
    service,
    total,
  }).returning();

  await db.insert(orderItems).values(orderItemsData.map(oi => ({ ...oi, orderId: order.id })));

  return order;
}

export async function getOrdersByTable(tableToken: string) {
  const table = await db.select().from(tables).where(eq(tables.token, tableToken)).limit(1);
  if (!table.length) throw new Error('Meja tidak ditemukan');

  const result = await db.select().from(orders).where(
    and(eq(orders.tableId, table[0].id), sql`${orders.status} NOT IN ('completed', 'cancelled')`)
  );
  return result;
}

export async function getOrderWithItems(code: string, tableToken: string) {
  const table = await db.select().from(tables).where(eq(tables.token, tableToken)).limit(1);
  if (!table.length) throw new Error('Meja tidak ditemukan');

  const order = await db.select().from(orders).where(eq(orders.code, code)).limit(1);
  if (!order.length || order[0].tableId !== table[0].id) throw new Error('Order tidak ditemukan');

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order[0].id));
  return { ...order[0], items };
}
