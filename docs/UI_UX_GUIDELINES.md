# UI/UX GUIDELINES

Referensi: desain **Foodtro QR Menu & Table Ordering** (bersih, hijau-putih, kartu menu dengan tombol "Add").

## Prinsip
- Mobile-first, satu tangan, tombol besar (min 44px).
- Maksimal 3 ketuk dari scan sampai item masuk keranjang.
- Bahasa sederhana, Indonesia.

## Warna (usulan)
| Peran | Warna |
|---|---|
| Primary | Hijau tua `#1B5E20` (identik kacang ijo) |
| Accent | Oranye `#F57C00` |
| Background | Putih `#FFFFFF` / abu muda `#F5F5F5` |
| Teks | `#212121` / `#757575` |

## Tipografi
Sans-serif modern (Inter / Poppins via `next/font`). Gunakan `next/image` untuk foto menu. Judul 20–24px bold, body 14–16px.

## Halaman Pelanggan
1. **Menu**: header (logo + "Meja No. 07"), search, banner promo, grid kategori (ikon), daftar menu (foto, nama, deskripsi singkat, harga, tombol **Add**), bar keranjang melayang di bawah ("Keranjang · Rp26.480").
2. **Detail Menu** (bottom sheet): foto, opsi, catatan, qty, tombol tambah.
3. **Keranjang / Pesanan Anda**: daftar item +/- qty, catatan, subtotal, pajak, total, tombol **Pesan Sekarang** dan **Bayar di Kasir**.
4. **Status Pesanan**: stepper (Diterima -> Diproses -> Siap -> Selesai), tombol "Tambah Pesanan".

## Halaman Staf
- **Dapur**: kartu per order (meja, item, catatan), warna per status, tombol besar, bunyi notifikasi.
- **Kasir**: daftar meja aktif, total, tombol "Tandai Lunas".
- **Admin**: sidebar sederhana, tabel + form.

## Komponen
Gunakan komponen shadcn/ui sebagai dasar (Button, Sheet, Dialog, Badge, Toast). Komponen khusus: MenuCard, CategoryChip, QtyStepper, CartBar, StatusBadge, BottomSheet, Toast.

## State
Loading (skeleton), kosong ("Keranjang masih kosong"), error (pesan + coba lagi), menu habis (badge "Habis", tombol nonaktif).

## Aksesibilitas
Kontras teks cukup, label tombol jelas, ukuran font bisa dibaca.
