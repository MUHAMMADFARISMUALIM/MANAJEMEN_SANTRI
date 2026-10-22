# 🚀 Panduan Instalasi Cepat

## Prasyarat
✅ Node.js (v14+) - Download: https://nodejs.org  
✅ MySQL (5.7+) - Sudah ada di Laragon  
✅ Browser Modern (Chrome, Firefox, Edge)

## Langkah Instalasi

### 1️⃣ Install Node.js di Laragon
Karena kamu menggunakan Laragon:
1. Buka **Laragon**
2. Klik **Menu** → **Quick add** → **nodejs**
3. Tunggu sampai selesai download & install
4. Restart Laragon
5. Buka **Terminal** (Ctrl+Alt+T di Laragon)
6. Ketik `node -v` untuk cek instalasi

### 2️⃣ Install Dependencies
Buka terminal di folder project ini, lalu jalankan:
```bash
npm install
```

Tunggu sampai selesai (sekitar 1-2 menit).

### 3️⃣ Setup Database
1. Buka **phpMyAdmin** atau **HeidiSQL** (dari Laragon)
2. Buat database baru:
   ```sql
   CREATE DATABASE manajemen_asrama;
   ```
3. Pilih database `manajemen_asrama`
4. Klik **Import** atau **SQL**
5. Import file `database/manajemen_santri.sql`
6. Tunggu sampai selesai

`database/manajemen_santri.sql` juga memuat migrasi kompatibilitas untuk kolom `akses_menu` dan `nama_kamar`. Untuk database yang sudah ada, backup terlebih dahulu lalu jalankan bagian **Upgrade compatibility** dari file yang sama.

### 4️⃣ Konfigurasi Database
File `.env` sudah dibuat dengan konfigurasi default Laragon:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=manajemen_asrama
```

**Jika kamu menggunakan password MySQL**, edit file `.env` dan isi `DB_PASSWORD`.

### 5️⃣ Jalankan Server
Di terminal, ketik:
```bash
npm run dev
```

Tunggu sampai muncul:
```
✓ Database connected successfully
🚀 Server berjalan pada port 3000
📍 URL: http://localhost:3000
```

### 6️⃣ Buka Aplikasi
1. Buka browser
2. Ketik: `http://localhost:3000`
3. Login dengan salah satu akun:

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | Admin |
| pengasuh | password123 | Pengasuh |
| ustadz1 | password123 | Ustadz |
| ustadzah1 | password123 | Ustadzah |

## ✅ Selesai!

Aplikasi sudah berjalan! 🎉

---

## 🔧 Troubleshooting

### Error: "npm command not found"
**Solusi:** Node.js belum terinstall. Ulangi langkah 1️⃣.

### Error: "Database connection failed"
**Solusi:** 
- Pastikan MySQL di Laragon sudah **Start All**
- Cek konfigurasi `.env` (username, password, database name)
- Pastikan database `manajemen_asrama` sudah dibuat

### Error: "Port 3000 already in use"
**Solusi:**
- Ganti port di file `.env`: `PORT=3001`
- Atau stop aplikasi lain yang pakai port 3000

### Server jalan tapi halaman kosong/error
**Solusi:**
- Cek Console di browser (F12)
- Pastikan file di folder `public/` sudah lengkap
- Restart server: Tekan `Ctrl+C`, lalu `npm run dev` lagi

### Tidak bisa login
**Solusi:**
- Pastikan database sudah di-import
- Cek table `users` sudah ada data (4 user default)
- Cek Network di browser Console (F12) untuk lihat error API

---

## 📞 Butuh Bantuan?

Jika masih ada masalah:
1. Baca `README.md` untuk dokumentasi lengkap
2. Cek error message di terminal
3. Cek browser Console (F12) → tab Console & Network

---

**Happy Coding! 💻✨**
