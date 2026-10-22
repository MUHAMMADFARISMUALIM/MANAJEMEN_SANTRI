# Sistem Manajemen Asrama Pesantren

Aplikasi web untuk mengelola data santri, perizinan, pelanggaran, dan pembinaan di MA Aziziyyah.

## Teknologi

- Backend: Node.js dan Express
- Frontend: HTML, CSS, JavaScript, Bootstrap 5, dan Font Awesome
- Database: MySQL atau MariaDB
- Autentikasi API: JWT; password di-hash dengan bcrypt

Aplikasi ini bukan aplikasi PHP. XAMPP dapat dipakai untuk menjalankan MySQL atau phpMyAdmin, tetapi server aplikasi dijalankan dengan Node.js.

## Fitur

- Login dengan role admin, pengasuh, ustadz, dan ustadzah.
- Admin dapat memilih menu yang boleh diakses setiap user melalui Manajemen User. Perubahan berlaku setelah user login kembali.
- Data santri, asrama, dan kamar.
- Perizinan dengan status `pending`, `disetujui`, atau `ditolak`. Persetujuan menjadi status akhir dan menghasilkan nomor surat.
- Cetak surat perizinan ke PDF melalui dialog Print browser.
- Pencatatan pelanggaran dan rekap berdasarkan Asrama, Kamar, lalu Nama Santri; rekap dapat dicetak ke PDF.
- Pembinaan santri dengan status `proses` atau `selesai`.
- Dashboard dengan statistik dan daftar aktivitas terbaru.

## Persyaratan

- Node.js versi LTS
- MySQL atau MariaDB yang aktif
- Browser modern

## Instalasi Lokal

1. Buka terminal pada folder project dan pasang dependensi:

   ```bash
   npm install
   ```

2. Salin `.env.example` menjadi `.env`:

   **PowerShell:**
   ```powershell
   Copy-Item .env.example .env
   ```

   **macOS/Linux:**
   ```bash
   cp .env.example .env
   ```

3. Atur koneksi database dan secret pada `.env`:

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=manajemen_asrama
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=ganti_dengan_secret_acak_yang_panjang
   JWT_EXPIRES_IN=24h
   UPLOAD_PATH=./uploads
   ```

4. Siapkan database:
   - Untuk database baru, import `database/manajemen_santri.sql` melalui phpMyAdmin, HeidiSQL, atau MySQL client. File ini membuat database `manajemen_asrama` dan tabel awal.
   - Untuk database lama, backup database terlebih dahulu, lalu jalankan bagian **Upgrade compatibility** dari file yang sama. Bagian ini menyelaraskan kolom, mengisi nama kamar dari data kamar, dan menghapus perizinan lama berstatus `selesai` agar sesuai alur status terbaru.

5. Untuk database lokal development yang baru di-import, buat/reset password akun awal:

   ```bash
   node scripts/fix-password.js
   ```

   Script ini mengatur password semua user menjadi `password123`. Jalankan hanya pada database development; jangan gunakan password tersebut di production.

6. Jalankan aplikasi:

   ```bash
   npm run dev
   ```

   Buka <http://localhost:3000>. Untuk menjalankan tanpa auto-reload, gunakan `npm start`.

## Akun Development

Setelah menjalankan `node scripts/fix-password.js`:

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `password123` | Admin |
| `pengasuh` | `password123` | Pengasuh |
| `ustadz1` | `password123` | Ustadz |
| `ustadzah1` | `password123` | Ustadzah |

Segera ganti password default sebelum aplikasi digunakan di luar komputer lokal.

## Data Contoh

Untuk mengisi data dummy pada database development, jalankan:

```bash
node scripts/fix-asrama.js
node scripts/seed-data.js
```

`seed-data.js` menambahkan data contoh santri, pelanggaran, dan perizinan. Jalankan satu kali pada database kosong; menjalankannya berulang dapat membuat pelanggaran dan perizinan duplikat.

## Akses Menu

Admin mengatur menu yang tersedia untuk setiap user melalui **Manajemen User > Tambah/Edit User > Akses Menu**. Pilih Asrama, Kamar, dan menu sesuai kebutuhan. Menu yang dicentang muncul di navigasi; akses langsung ke halaman dan API juga diperiksa. Setelah perubahan disimpan, user perlu login kembali agar izin baru dimuat.

Role tetap membatasi aksi tertentu. Contohnya, operasi Manajemen User dan penghapusan data tetap memerlukan role admin meskipun suatu menu ditampilkan.

## Status Perizinan

- `pending`: menunggu keputusan.
- `disetujui`: izin diterima; menjadi status akhir dan tersedia untuk dicetak.
- `ditolak`: izin tidak diterima.

Tidak ada status `selesai` untuk perizinan. Status `selesai` pada Pembinaan dan Pelanggaran adalah alur yang berbeda.

## API Utama

Semua endpoint API berada di bawah `/api` dan umumnya memerlukan header `Authorization: Bearer <token>`.

- Auth: `/api/auth/login`, `/api/auth/profile`, `/api/auth/logout`, `/api/auth/change-password`
- User: `/api/users`
- Santri: `/api/santri`
- Perizinan: `/api/perizinan`; persetujuan melalui `PUT /api/perizinan/:id/approval`
- Pelanggaran: `/api/pelanggaran`
- Pembinaan: `/api/pembinaan`
- Dashboard: `/api/dashboard/stats`

Detail request, response, dan contoh tersedia di `docs/API_DOCUMENTATION.md`.

## Struktur Project

```text
server.js                     Entry point Express dan static file server
routes/                       Endpoint API
middleware/                   Autentikasi, akses menu, dan upload
public/                       Halaman HTML, CSS, dan JavaScript frontend
database/manajemen_santri.sql Schema dan data awal database
scripts/                      Script setup dan data contoh
uploads/                      Lokasi file yang diunggah
.env.example                  Contoh konfigurasi environment
```

## Troubleshooting

- **`npm` tidak dikenali:** pasang Node.js LTS, tutup lalu buka terminal/VS Code, kemudian coba lagi.
- **Koneksi database gagal:** pastikan MySQL/MariaDB aktif dan nilai `DB_HOST`, `DB_USER`, `DB_PASSWORD`, serta `DB_NAME` pada `.env` benar.
- **Unknown database:** import `database/manajemen_santri.sql` dan pastikan `DB_NAME=manajemen_asrama`.
- **Login akun awal gagal:** untuk database development, jalankan `node scripts/fix-password.js`.
- **Cetak PDF tidak terbuka:** izinkan pop-up untuk `localhost`; pilih **Save as PDF** pada dialog cetak browser.
- **Menu user berubah tetapi belum tampak:** logout lalu login kembali.

Dokumentasi tambahan:
- `docs/INSTALASI.md` - panduan setup
- `docs/API_DOCUMENTATION.md` - detail API
- `scripts/README.md` - script maintenance dan data contoh
