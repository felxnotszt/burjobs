import { z } from 'zod';

export const createOrderSchema = z.object({
  payment_method: z.enum(['cashier', 'qris']),
  note: z.string().optional(),
  items: z.array(z.object({
    menu_item_id: z.string().uuid(),
    qty: z.number().int().min(1),
    option_value_ids: z.array(z.string().uuid()).optional(),
    note: z.string().optional(),
  })).min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['accepted', 'preparing', 'ready', 'served', 'completed', 'cancelled']),
});

export const payOrderSchema = z.object({
  payment_method: z.enum(['cashier', 'qris']),
});

export const categorySchema = z.object({
  name: z.string().min(1),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const menuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().min(0),
  category_id: z.string().uuid(),
  is_available: z.boolean().default(true),
  is_popular: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
});

export const tableSchema = z.object({
  number: z.number().int().min(1),
  is_active: z.boolean().default(true),
});
