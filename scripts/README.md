# Scripts Folder

Folder ini berisi script-script helper untuk maintenance dan inisialisasi data.

## File-file:

### 1. seed-data.js
Script untuk mengisi database dengan data dummy:
- 15 data santri dengan variasi kamar
- 18 data pelanggaran
- 17 data perizinan

**Cara menjalankan:**
```bash
node scripts/seed-data.js
```

### 2. fix-asrama.js
Script untuk populate data asrama awal (4 asrama)

**Cara menjalankan:**
```bash
node scripts/fix-asrama.js
```

### 3. fix-kamar-nohp.js
Script untuk migrasi database: menambah kolom `nama_kamar` dan menghapus `no_hp` dari tabel santri

**Cara menjalankan:**
```bash
node scripts/fix-kamar-nohp.js
```

### 4. fix-password.js
Script untuk reset password semua user menjadi `password123`

**Cara menjalankan:**
```bash
node scripts/fix-password.js
```

### 5. init-kamar-data.js
Script untuk inisialisasi data kamar awal

**Cara menjalankan:**
```bash
node scripts/init-kamar-data.js
```

## Catatan:
- Semua script menggunakan koneksi database dari `../database/connection.js`
- Pastikan server MySQL sudah running sebelum menjalankan script
- Backup database sebelum menjalankan script yang mengubah struktur
