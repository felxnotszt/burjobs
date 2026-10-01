# PRD — BurjoKu (QR Menu & Table Ordering)

## 1. Latar Belakang
Pemesanan manual di burjo memakan waktu, rawan salah catat, dan menyulitkan saat ramai. Solusi: pelanggan memesan sendiri lewat HP dengan scan QR di meja.

## 2. Tujuan
- Mempercepat proses pemesanan & mengurangi salah catat.
- Memudahkan dapur melihat antrean pesanan real-time.
- Memudahkan owner mengelola menu, stok, dan melihat laporan penjualan.

## 3. Target Pengguna
| Peran | Kebutuhan |
|---|---|
| Pelanggan | Lihat menu, pesan dari meja, tanpa install/login |
| Kasir | Lihat pesanan, konfirmasi pembayaran |
| Dapur | Lihat antrean, ubah status pesanan |
| Admin/Owner | Kelola menu, meja, QR, laporan |

## 4. Fitur MVP
### 4.1 Pelanggan
- F1. Scan QR -> buka menu dengan nomor meja otomatis terisi.
- F2. Daftar menu per kategori (Bubur, Mie, Nasi, Minuman, Camilan) + pencarian.
- F3. Detail menu: foto, deskripsi, harga, opsi (mis. level pedas, topping), catatan.
- F4. Keranjang: ubah jumlah, hapus, catatan per item, subtotal.
- F5. Kirim pesanan (Place Order).
- F6. Pilih metode bayar: **Bayar di Kasir** (MVP) / QRIS (fase lanjut).
- F7. Status pesanan real-time: Diterima -> Diproses -> Siap -> Selesai.
- F8. Tambah pesanan lagi ke meja yang sama.

### 4.2 Dapur
- F9. Daftar pesanan masuk (urut waktu) + notifikasi suara/visual.
- F10. Ubah status: Diproses -> Siap.

### 4.3 Kasir
- F11. Lihat pesanan per meja, tandai **Lunas**, cetak/lihat struk sederhana.

### 4.4 Admin
- F12. CRUD kategori & menu (foto, harga, ketersediaan/stok habis).
- F13. CRUD meja + generate & unduh QR per meja.
- F14. Laporan penjualan harian/mingguan sederhana.
- F15. Login admin/kasir/dapur (Supabase Auth, role-based).

## 5. Fitur Fase Lanjut (Post-MVP)
- Pembayaran QRIS online (payment gateway).
- Promo/voucher, rekomendasi menu populer.
- Notifikasi WhatsApp.
- Multi-cabang.
- Cetak otomatis ke printer dapur.

## 6. Out of Scope (MVP)
- Aplikasi mobile native.
- Akun/login pelanggan, poin loyalitas.
- Delivery/ojek online.
- Manajemen stok bahan baku detail.

## 7. Kebutuhan Non-Fungsional
- Mobile-first, load < 3 detik pada 4G.
- Real-time untuk dapur/kasir (Supabase Realtime); pelanggan memakai polling 5 detik.
- Keamanan: token meja tidak mudah ditebak, rate limit pada order, validasi harga di server.
- Berjalan di Vercel (serverless) + Supabase.
- Bisa dipakai di HP biasa (Android Chrome / iOS Safari).
- Mendukung ±50 order bersamaan.

## 8. Aturan Bisnis
- Satu meja boleh punya beberapa order dalam satu sesi; total dihitung gabungan.
- Item "habis" tidak bisa dipesan.
- Order yang sudah "Diproses" tidak bisa dibatalkan pelanggan (hanya kasir/admin).
- Pajak/service charge opsional, dapat diatur admin (default 0%).

## 9. Metrik Keberhasilan
- Waktu dari scan ke order terkirim < 2 menit.
- Salah pesan < 2% dari total order.
- Minimal 80% pelanggan memakai QR dalam 1 bulan.
