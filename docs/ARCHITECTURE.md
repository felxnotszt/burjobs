# ARCHITECTURE

## Tech Stack
| Lapisan | Pilihan |
|---|---|
| Framework | **Next.js (App Router) + TypeScript** |
| Styling/UI | Tailwind CSS + shadcn/ui |
| Database | **Supabase (PostgreSQL)** |
| ORM | **Drizzle ORM** (migration via `drizzle-kit`) |
| Auth staf | Supabase Auth (email + password) + tabel `profiles` untuk role |
| Realtime | Supabase Realtime (`postgres_changes`) untuk dapur/kasir |
| Storage | Supabase Storage (bucket `menu-images`, public read) |
| Validasi | Zod |
| State klien | Zustand (keranjang, disimpan di localStorage) |
| QR | `qrcode` (generate PNG/SVG di server) |
| Deploy | **Vercel** + integrasi Supabase dari Vercel Marketplace |

## Arsitektur
```
[HP Pelanggan] --scan QR--> Next.js (Vercel) --Route Handlers--> Supabase Postgres
[Dapur/Kasir/Admin] -------> Next.js (Vercel) --Supabase Auth---> Supabase Postgres
        ^                                                              |
        +------------------ Supabase Realtime (WebSocket) -------------+
```
- Vercel bersifat serverless -> **tidak ada server WebSocket sendiri**. Realtime memakai Supabase Realtime langsung dari browser staf.
- Pelanggan **anonim**: tidak membaca tabel langsung. Semua aksi pelanggan lewat Route Handler di server (pakai service role key, hanya di server).
- Status order untuk pelanggan: **polling 5 detik** (MVP). Opsional nanti: Supabase Broadcast.

## Struktur Folder
```
src/
  app/
    m/[token]/                # halaman pelanggan (menu, keranjang, status)
    (staff)/login/
    (staff)/kitchen/
    (staff)/cashier/
    (staff)/admin/{menu,categories,tables,reports,settings}/
    api/v1/...                # Route Handlers
  components/{ui,customer,staff}/
  db/{schema.ts,index.ts,seed.ts}
  lib/{supabase/{client,server,admin}.ts,validators/,utils/format-rupiah.ts}
  services/order-service.ts   # logika bisnis (hitung harga, buat order)
  stores/cart-store.ts
drizzle/                      # file migration
middleware.ts                 # proteksi route staf berdasarkan session & role
```

## Prinsip
- Logika bisnis di `services/`, Route Handler tipis (validasi Zod -> panggil service -> response).
- Harga **dihitung ulang di server** saat order dibuat.
- `SUPABASE_SERVICE_ROLE_KEY` **jangan pernah** diekspos ke client (tanpa prefix `NEXT_PUBLIC_`).
- Role staf dicek di `middleware.ts` **dan** di setiap Route Handler staf.
- RLS aktif di semua tabel (lihat `DATABASE.md`).

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only
DATABASE_URL=                     # pooled connection string (pgbouncer / transaction mode)
DIRECT_URL=                       # direct connection, hanya untuk migration
NEXT_PUBLIC_APP_URL=              # dipakai untuk isi QR: {APP_URL}/m/{token}
```

## Catatan Deploy (Vercel)
- Pasang integrasi Supabase lewat Vercel Marketplace agar env tersinkron.
- Pakai **pooled** connection string untuk runtime; **direct** untuk migration.
- Atur Preview vs Production environment terpisah (proyek Supabase berbeda jika memungkinkan).
