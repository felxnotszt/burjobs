# AGENTS.md — Instruksi untuk AI Assistant

## Konteks Proyek
Kamu membantu membangun **BurjoKu**, sistem pemesanan burjo via QR code di meja (referensi desain: Foodtro QR Menu & Table Ordering). Baca `PRD.md`, `USER_FLOW.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API_SPEC.md`, dan `UI_UX_GUIDELINES.md` sebelum menulis kode.

## Tech Stack (jangan diganti tanpa izin)
Next.js (App Router) + TypeScript, Tailwind + shadcn/ui, Supabase (Postgres, Auth, Realtime, Storage), Drizzle ORM, Zod, Zustand, deploy di Vercel.

## Aturan Utama
1. Ikuti stack di `ARCHITECTURE.md`, skema di `DATABASE.md`, kontrak di `API_SPEC.md`. Perubahan skema = migration Drizzle baru + jelaskan alasannya.
2. Kerjakan **satu task per sesi** sesuai `TASKS.md`. Jangan mengerjakan fitur di luar scope MVP (`PRD.md` bagian Out of Scope).
3. Pelanggan **tidak login**; meja dikenali lewat token QR (`/m/[token]`).
4. **Keamanan:**
   - `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai di server; jangan pernah di komponen klien atau variabel `NEXT_PUBLIC_*`.
   - Pelanggan tidak mengakses tabel `orders` langsung; semua lewat Route Handler.
   - Hitung ulang harga di server; abaikan harga dari klien.
   - Aktifkan RLS di setiap tabel baru.
   - Cek role staf di `middleware.ts` dan di tiap Route Handler staf.
5. Uang = **integer Rupiah**. Tampilkan dengan helper `formatRupiah()` -> `Rp12.000`.
6. UI berbahasa **Indonesia**; kode, nama variabel, dan komentar berbahasa Inggris.
7. Mobile-first (layar 360–430px).
8. Gunakan **Server Components** secara default; `"use client"` hanya jika perlu (interaksi, Zustand, Realtime).
9. Validasi semua input dengan Zod; response API mengikuti format di `API_SPEC.md`.
10. Ingat Vercel itu serverless: jangan buat server WebSocket/proses long-running; gunakan Supabase Realtime atau polling.
11. Gunakan connection string **pooled** untuk runtime, **direct** hanya untuk migration.

## Konvensi Kode
- TypeScript strict; hindari `any`.
- File/folder `kebab-case`, komponen `PascalCase`, variabel/fungsi `camelCase`, kolom DB `snake_case`.
- Commit: `feat:`, `fix:`, `refactor:`, `docs:`.
- Logika bisnis di `src/services/`, bukan di Route Handler atau komponen.

## Glosarium
- **Burjo**: warung bubur kacang ijo (juga jual indomie, nasi, kopi, dll.)
- **Meja**: tempat duduk pelanggan; punya nomor & QR unik
- **Order / Order Item**: satu pesanan dari satu meja / baris menu di dalamnya
- **Kasir**: staf yang mengonfirmasi pembayaran; **Dapur**: staf yang menyiapkan pesanan

## Yang TIDAK Boleh Dilakukan
- Menyimpan data kartu/pembayaran sensitif.
- Menghapus order yang sudah dibayar (gunakan status).
- Menambah dependency besar tanpa alasan jelas.
- Menaruh secret di repo.
