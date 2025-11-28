# User Manual - Finance Tracker

## Panduan Penggunaan Aplikasi

### Memulai

#### 1. Registrasi Akun
- Buka aplikasi Finance Tracker
- Klik "Belum punya akun? Daftar"
- Masukkan email dan password (minimal 6 karakter)
- Klik "Daftar Akun"

#### 2. Login
- Masukkan email dan password yang sudah didaftarkan
- Klik "Masuk"

### Dashboard

#### Tampilan Ringkasan
Dashboard menampilkan 3 kartu statistik utama:
- **Total Saldo**: Selisih antara pemasukan dan pengeluaran
- **Pemasukan**: Total semua pemasukan
- **Pengeluaran**: Total semua pengeluaran

### Menambah Transaksi

1. Klik tombol "Tambah Transaksi" di pojok kanan atas
2. Pilih tipe transaksi:
   - **Pemasukan**: Gaji, bonus, investasi, dll
   - **Pengeluaran**: Belanja, tagihan, transportasi, dll
3. Isi form transaksi:
   - **Jumlah**: Masukkan nominal dalam Rupiah
   - **Kategori**: Pilih dari kategori yang tersedia
   - **Judul**: Nama transaksi (contoh: "Makan siang")
   - **Deskripsi**: Catatan tambahan (opsional)
   - **Tanggal**: Tanggal transaksi terjadi
4. Klik "Simpan"

### Kategori Transaksi

#### Kategori Pemasukan Default:
- Gaji
- Bonus
- Investasi
- Freelance
- Lainnya

#### Kategori Pengeluaran Default:
- Makanan & Minuman
- Transportasi
- Tagihan
- Belanja
- Hiburan
- Kesehatan
- Pendidikan
- Lainnya

### Mencari dan Filter Transaksi

#### 1. Pencarian Teks
- Gunakan kolom pencarian di atas daftar transaksi
- Ketik kata kunci dari judul atau deskripsi transaksi
- Hasil akan muncul secara real-time

#### 2. Filter Berdasarkan Kategori
- Klik dropdown "Kategori"
- Pilih kategori yang diinginkan
- Tampilkan hanya transaksi dari kategori tersebut

#### 3. Filter Berdasarkan Tipe
- Klik dropdown "Tipe"
- Pilih "Pemasukan" atau "Pengeluaran"
- Tampilkan hanya transaksi dengan tipe yang dipilih

#### 4. Filter Berdasarkan Rentang Tanggal
- Isi "Dari Tanggal" untuk tanggal mulai
- Isi "Sampai Tanggal" untuk tanggal akhir
- Tampilkan transaksi dalam rentang waktu tersebut

#### 5. Menghapus Filter
- Klik tombol "Hapus Filter" untuk reset semua filter

### Mengedit Transaksi

1. Cari transaksi yang ingin diedit
2. Klik icon pensil (Edit) di sebelah kanan transaksi
3. Ubah data yang diperlukan
4. Klik "Simpan"

### Menghapus Transaksi

1. Cari transaksi yang ingin dihapus
2. Klik icon tempat sampah (Hapus) di sebelah kanan transaksi
3. Konfirmasi penghapusan
4. Transaksi akan dihapus permanen

### Tampilan Transaksi

Transaksi ditampilkan dalam format:
- **Dikelompokkan berdasarkan tanggal**
- **Transaksi terbaru di atas**
- **Warna hijau**: Pemasukan (dengan tanda +)
- **Warna merah**: Pengeluaran (dengan tanda -)
- **Icon kategori**: Menunjukkan jenis transaksi

### Logout

- Klik tombol "Keluar" di pojok kanan atas
- Anda akan kembali ke halaman login

## Tips Penggunaan

### 1. Catat Transaksi Segera
- Tambahkan transaksi segera setelah terjadi
- Hindari menumpuk transaksi yang belum dicatat

### 2. Gunakan Deskripsi
- Tambahkan detail di kolom deskripsi
- Memudahkan pencarian di kemudian hari

### 3. Konsisten dengan Kategori
- Gunakan kategori yang sama untuk jenis pengeluaran yang sama
- Memudahkan tracking dan analisis

### 4. Review Berkala
- Cek statistik saldo secara rutin
- Evaluasi pola pengeluaran Anda

### 5. Gunakan Filter untuk Laporan
- Filter berdasarkan bulan untuk laporan bulanan
- Filter berdasarkan kategori untuk analisis per kategori

## Fitur PWA (Progressive Web App)

### Install di Smartphone

#### Android:
1. Buka aplikasi di Chrome browser
2. Tap menu (3 titik)
3. Pilih "Install App"
4. Aplikasi akan muncul di home screen

#### iOS:
1. Buka aplikasi di Safari
2. Tap tombol Share
3. Pilih "Add to Home Screen"

### Keunggulan PWA:
- Akses cepat dari home screen
- Loading lebih cepat
- Dapat digunakan offline (terbatas)
- Notifikasi push (jika diaktifkan)

## Keamanan Data

### Enkripsi
- Semua data tersimpan dengan aman di Supabase
- Koneksi menggunakan HTTPS/SSL

### Privasi
- Data transaksi hanya bisa diakses oleh Anda
- Tidak ada user lain yang bisa melihat data Anda
- Password di-hash dengan algoritma aman

### Backup
- Data otomatis ter-backup di cloud
- Anda bisa login dari device manapun
- Data akan tetap tersimpan

## Troubleshooting

### Tidak Bisa Login
- Pastikan email dan password benar
- Check koneksi internet
- Clear cache browser dan coba lagi

### Transaksi Tidak Muncul
- Refresh halaman (F5 atau pull to refresh)
- Pastikan tidak ada filter aktif
- Check koneksi internet

### Data Hilang
- Data tersimpan di cloud, tidak akan hilang
- Login ulang untuk sinkronisasi
- Pastikan menggunakan email yang benar

### Aplikasi Lambat
- Clear cache browser
- Tutup tab browser yang tidak digunakan
- Check koneksi internet

## Kontak Support

Jika mengalami masalah atau memiliki saran:
- Buat issue di repository GitHub
- Hubungi developer melalui email

## Update dan Maintenance

- Aplikasi akan otomatis update saat ada versi baru
- Refresh browser untuk mendapatkan update terbaru
- Service worker akan mengelola caching otomatis

---

Selamat menggunakan Finance Tracker!
Kelola keuangan Anda dengan lebih baik dan lebih mudah.
