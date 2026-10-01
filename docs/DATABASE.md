# DATABASE (Supabase PostgreSQL + Drizzle)

Semua uang = **integer Rupiah**. Primary key = `uuid` (default `gen_random_uuid()`), kecuali dinyatakan lain. Semua tabel punya `created_at`, `updated_at` (timestamptz).

## Enum
- `user_role`: `admin | cashier | kitchen`
- `order_status`: `pending | accepted | preparing | ready | served | completed | cancelled`
- `payment_status`: `unpaid | paid | refunded`
- `payment_method`: `cashier | qris`
- `option_type`: `single | multiple`

## Tabel
**profiles** — id (uuid, = `auth.users.id`), name, role (`user_role`)

**tables** — id, number (int, unique), token (text, unique, 32 char acak), is_active

**categories** — id, name, sort_order, is_active

**menu_items** — id, category_id (FK), name, description, price (int), image_path, is_available, is_popular, sort_order

**menu_options** — id, menu_item_id (FK), name (mis. "Level Pedas"), type (`option_type`), is_required

**menu_option_values** — id, menu_option_id (FK), label, extra_price (int, default 0)

**orders** — id, code (text, unique, mis. `BJ-20261001-001`), table_id (FK), status, payment_status, payment_method, subtotal, tax, service, total, note, paid_at

**order_items** — id, order_id (FK), menu_item_id (FK), name_snapshot, price_snapshot, qty, options_snapshot (jsonb), note, subtotal

**settings** — key (PK, text), value (text) -> `shop_name`, `tax_percent`, `service_percent`

## Relasi
- categories 1—N menu_items 1—N menu_options 1—N menu_option_values
- tables 1—N orders 1—N order_items

## Index
`orders(table_id, status)`, `orders(created_at)`, `menu_items(category_id, is_available)`, `tables(token)`.

## Row Level Security (wajib aktif)
| Tabel | anon (pelanggan) | authenticated (staf) |
|---|---|---|
| menu_items, categories, menu_options, menu_option_values | SELECT (hanya data aktif) | Admin: full; lainnya SELECT |
| tables | tanpa akses langsung (lewat server) | Admin: full; lainnya SELECT |
| orders, order_items | **tanpa akses** | kitchen/cashier/admin: SELECT & UPDATE status; admin: full |
| settings | tanpa akses | admin: full; lainnya SELECT |
| profiles | tanpa akses | baca profil sendiri; admin: full |

Pelanggan membuat & melihat order **hanya lewat Route Handler** (service role), jadi tabel order tidak terbuka untuk anon.

## Realtime
Aktifkan Realtime (publication) untuk tabel `orders` dan `order_items`. Klien staf subscribe `postgres_changes` pada `orders`.

## Aturan
- `order_items` menyimpan **snapshot** nama & harga agar riwayat tidak berubah saat menu diedit.
- Kode order di-generate server (prefix + tanggal + nomor urut harian).
- Seed: 1 admin, 10 meja, 5 kategori, ±20 menu contoh khas burjo (`src/db/seed.ts`).
