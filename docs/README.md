# BurjoKu — Sistem Pemesanan Burjo via QR Meja

Sistem pemesanan mandiri untuk burjo (warung bubur kacang ijo, indomie, dll.). Pelanggan scan QR di meja, pilih menu, pesan, lalu pesanan masuk ke dapur/kasir secara real-time. Tanpa install aplikasi dan tanpa login.

**Stack:** Next.js (App Router, TypeScript) · Tailwind + shadcn/ui · Supabase (Postgres, Auth, Realtime, Storage) · Drizzle ORM · Vercel

## Daftar Dokumen (baca berurutan)
| File | Isi |
|---|---|
| `AGENTS.md` | Aturan & konteks untuk AI coding assistant (**baca pertama**) |
| `PRD.md` | Product Requirements: tujuan, fitur, scope |
| `USER_FLOW.md` | Alur pelanggan, kasir, dapur, admin |
| `ARCHITECTURE.md` | Tech stack, struktur folder, env, deploy |
| `DATABASE.md` | Skema, enum, RLS, realtime |
| `API_SPEC.md` | Endpoint Route Handlers |
| `UI_UX_GUIDELINES.md` | Panduan desain (referensi gaya Foodtro) |
| `TASKS.md` | Roadmap & checklist per fase |

## Ringkasan
- **Peran:** Pelanggan, Kasir, Dapur, Admin/Owner.
- **Inti:** QR per meja -> menu digital -> keranjang -> pesan -> dapur -> bayar.
