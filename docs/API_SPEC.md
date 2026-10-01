# API SPEC (Next.js Route Handlers)

Base path: `/api/v1` (file: `src/app/api/v1/.../route.ts`). Validasi dengan **Zod**. Respons:
```json
{ "success": true, "data": {}, "message": "OK" }
```
Error: `{ "success": false, "message": "...", "errors": {} }`

## Pelanggan (tanpa login, pakai token meja)
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/tables/{token}` | Validasi token, info meja |
| GET | `/menu?category_id=&q=` | Menu aktif + kategori (filter/cari) |
| GET | `/menu/{id}` | Detail menu + opsi |
| POST | `/tables/{token}/orders` | Buat order |
| GET | `/tables/{token}/orders` | Order aktif di meja |
| GET | `/orders/{code}?token={token}` | Detail & status order (polling 5 detik) |

**POST /tables/{token}/orders**
```json
{
  "payment_method": "cashier",
  "note": "Jangan pakai bawang",
  "items": [
    { "menu_item_id": "uuid", "qty": 2, "option_value_ids": ["uuid"], "note": "pedas banget" }
  ]
}
```
Respons 201: `{ code, status, payment_status, subtotal, tax, service, total }`

Aturan: tolak jika menu tidak tersedia; hitung ulang semua harga dari DB; `GET /orders/{code}` wajib cocok dengan token meja pemilik order.

## Staf (Supabase Auth session + cek role)
| Method | Endpoint | Role |
|---|---|---|
| GET | `/staff/orders?status=` | kitchen, cashier, admin |
| PATCH | `/staff/orders/{id}/status` | kitchen, cashier, admin |
| PATCH | `/staff/orders/{id}/pay` | cashier, admin |
| GET/POST/PATCH/DELETE | `/admin/categories` | admin |
| GET/POST/PATCH/DELETE | `/admin/menu` | admin |
| PATCH | `/admin/menu/{id}/availability` | admin |
| POST | `/admin/menu/upload` | admin (upload ke Supabase Storage) |
| GET/POST/PATCH/DELETE | `/admin/tables` | admin |
| GET | `/admin/tables/{id}/qr` | admin (PNG/SVG, isi: `{APP_URL}/m/{token}`) |
| POST | `/admin/tables/{id}/regenerate-token` | admin |
| GET | `/admin/reports/sales?from=&to=` | admin |
| GET/PUT | `/admin/settings` | admin |

Login/logout staf memakai **Supabase Auth** (`signInWithPassword`, `signOut`) langsung di klien/server; tidak perlu endpoint khusus.

## Realtime
- Dapur/Kasir: subscribe `postgres_changes` pada tabel `orders` (INSERT, UPDATE) lewat Supabase client (user terautentikasi, dilindungi RLS).
- Pelanggan: polling `GET /orders/{code}` tiap 5 detik.

## Aturan
- Rate limit pembuatan order: 10/menit per token (mis. Upstash Ratelimit via Marketplace, atau cek di DB sebagai MVP).
- Kode HTTP: 200, 201, 401, 403, 404, 422, 429.
- Jangan pernah percaya harga/total dari klien.
