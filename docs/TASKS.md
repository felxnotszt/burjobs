# TASKS — Roadmap (Next.js + Vercel + Supabase)

Kerjakan berurutan. Centang setelah selesai & diuji.

## Fase 0 — Setup
- [ ] `create-next-app` (TypeScript, App Router, Tailwind), install shadcn/ui
- [ ] Buat project Supabase, pasang integrasi di Vercel, isi `.env`
- [ ] Setup Drizzle (`schema.ts`, `drizzle.config.ts`, koneksi pooled & direct)
- [ ] Helper Supabase client: `client.ts`, `server.ts`, `admin.ts`
- [ ] Setup Git + deploy awal ke Vercel

## Fase 1 — Database & Auth Staf
- [ ] Skema + migration sesuai `DATABASE.md` (enum, tabel, index)
- [ ] Aktifkan RLS + policy, aktifkan Realtime untuk `orders`
- [ ] Seed data contoh burjo
- [ ] Login staf (Supabase Auth) + `middleware.ts` + cek role

## Fase 2 — Admin
- [ ] CRUD kategori
- [ ] CRUD menu + upload foto ke Supabase Storage + toggle tersedia
- [ ] CRUD meja + generate QR + unduh/cetak
- [ ] Pengaturan pajak/service

## Fase 3 — Pelanggan
- [ ] Halaman `/m/[token]`: validasi token, header "Meja No. XX"
- [ ] Daftar menu, filter kategori, pencarian
- [ ] Detail menu (bottom sheet) + opsi & catatan
- [ ] Keranjang (Zustand + localStorage) + cart bar melayang
- [ ] Place order (`POST /tables/{token}/orders`, validasi server)
- [ ] Halaman status pesanan (polling 5 detik) + tambah pesanan

## Fase 4 — Dapur & Kasir
- [ ] Dashboard dapur + Supabase Realtime + notifikasi suara
- [ ] Ubah status order
- [ ] Dashboard kasir + tandai lunas + struk sederhana

## Fase 5 — Laporan & Polish
- [ ] Laporan penjualan harian/mingguan
- [ ] PWA/manifest, optimasi performa, uji di HP nyata
- [ ] Rate limit order, uji keamanan (token, RLS, harga)
- [ ] Test alur order (Vitest / Playwright)

## Fase 6 — Go Live
- [ ] Domain + HTTPS (Vercel), environment Production
- [ ] Cetak QR & uji di warung

## Fase Lanjut
- [ ] QRIS online (payment gateway)
- [ ] Promo/voucher
- [ ] Notifikasi WhatsApp
- [ ] Realtime untuk pelanggan (Supabase Broadcast)
