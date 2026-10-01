# USER FLOW

## 1. Alur Pelanggan
1. Duduk di meja, scan QR (URL: `/m/{table_token}`).
2. Sistem validasi token -> tampilkan "Meja No. XX" + menu.
3. Pilih kategori / cari menu -> klik **Add**.
4. (Opsional) pilih opsi & isi catatan.
5. Buka **Keranjang** -> cek item & total.
6. Pilih metode bayar -> **Place Order**.
7. Halaman status pesanan (real-time): Diterima -> Diproses -> Siap -> Selesai.
8. Bisa **tambah pesanan** dari menu.
9. Bayar di kasir -> status Lunas.

```
Scan QR -> Menu -> Keranjang -> Place Order -> Status Pesanan -> Bayar -> Selesai
```

## 2. Alur Dapur
Login -> Dashboard antrean -> Order baru muncul (bunyi) -> "Proses" -> "Siap" -> Pelayan antar.

## 3. Alur Kasir
Login -> Daftar meja aktif -> Pilih meja -> Cek rincian -> Terima pembayaran -> "Tandai Lunas" -> Meja kembali kosong.

## 4. Alur Admin
Login -> Kelola Menu/Kategori -> Kelola Meja & QR -> Lihat Laporan -> Atur Pajak.

## 5. Status Order
`pending` -> `accepted` -> `preparing` -> `ready` -> `served` -> `completed`  
Cabang: `cancelled` (oleh kasir/admin saja setelah `preparing`).

## 6. Status Pembayaran
`unpaid` -> `paid` (atau `refunded`).

## 7. Edge Case
- Token QR tidak valid -> halaman "QR tidak dikenali, minta bantuan staf".
- Menu habis saat checkout -> tampilkan pesan & hapus dari keranjang.
- Koneksi putus -> keranjang tersimpan di localStorage.
- Dua HP di meja yang sama -> order tergabung dalam satu sesi meja.
