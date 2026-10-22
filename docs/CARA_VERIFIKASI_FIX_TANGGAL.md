# ✅ CARA VERIFIKASI PERBAIKAN MASALAH TANGGAL

## 🎯 LANGKAH 1: VERIFIKASI DATABASE (PENTING!)

Sebelum testing, pastikan kolom `nama_kamar` sudah ada di tabel `santri`.

### Cek Struktur Tabel

```bash
# Buka MySQL Console (Laragon > Menu > MySQL > MySQL Console)
# Atau via command line:
mysql -u root -p
```

```sql
USE manajemen_asrama;

-- Cek struktur tabel santri
DESCRIBE santri;
```

**Yang harus terlihat**:
- Harus ada kolom `nama_kamar` dengan tipe `VARCHAR(50)` setelah `kamar_id`

### Jika Kolom `nama_kamar` TIDAK ADA

```sql
-- Jalankan migration ini:
ALTER TABLE santri ADD COLUMN nama_kamar VARCHAR(50) AFTER kamar_id;

-- Optional: Isi data nama_kamar dari tabel kamar yang sudah ada
UPDATE santri s
LEFT JOIN kamar k ON s.kamar_id = k.id
SET s.nama_kamar = k.nama_kamar
WHERE s.kamar_id IS NOT NULL AND (s.nama_kamar IS NULL OR s.nama_kamar = '');
```

---

## 🎯 LANGKAH 2: RESTART SERVER

Setelah database fix, restart server Node.js:

```bash
# Di terminal, tekan Ctrl+C untuk stop
# Kemudian jalankan lagi:
node server.js
```

---

## 🎯 LANGKAH 3: TESTING MENU DATA SANTRI

### A. Test Tambah Santri Baru

1. Buka halaman **Data Santri**
2. Klik tombol **Tambah Santri**
3. Isi form dengan data lengkap:
   - NIS: `12345TEST`
   - Nama Lengkap: `Test Santri Tanggal`
   - Jenis Kelamin: Pilih salah satu
   - Tempat Lahir: `Jakarta`
   - **Tanggal Lahir**: Pilih tanggal (misal: `15/01/2010`)
   - Asrama: Pilih salah satu
   - Kamar: Pilih salah satu
   - **Tanggal Masuk**: Pilih tanggal (misal: `01/07/2024`)
   - Status: `Aktif`
4. Klik **Simpan**
5. ✅ **Cek**: Data muncul di tabel dengan lengkap

### B. Test Edit Santri

1. Klik tombol **Edit** (ikon pensil) pada santri yang baru ditambahkan
2. ✅ **Cek di Form**:
   - Tanggal Lahir harus muncul di input date
   - Tanggal Masuk harus muncil di input date
   - Asrama dan Kamar terisi dengan benar
3. Ubah salah satu tanggal (misal ubah Tanggal Lahir)
4. Klik **Simpan**
5. ✅ **Cek**: Perubahan tersimpan dengan benar

### C. Test Lihat Detail Santri

1. Klik tombol **Detail** (ikon mata) pada santri
2. ✅ **Cek di Modal Detail**:
   - Tanggal Lahir tampil dengan format `DD/MM/YYYY` (misal: `15/01/2010`)
   - Tanggal Masuk tampil dengan format `DD/MM/YYYY` (misal: `01/07/2024`)
   - Semua field lain tampil lengkap

---

## 🎯 LANGKAH 4: TESTING MENU PERIZINAN

### A. Test Tambah Perizinan

1. Buka halaman **Perizinan**
2. Klik **Tambah Perizinan**
3. Isi form:
   - Pilih santri
   - Pilih jenis izin
   - **Tanggal Izin**: Pilih tanggal (misal: `20/09/2026`)
   - **Tanggal Kembali**: Pilih tanggal (misal: `22/09/2026`)
   - Isi field lain (alasan, dll)
4. Klik **Simpan**
5. ✅ **Cek**: Data perizinan muncul di tabel dengan tanggal yang benar

### B. Test Edit Perizinan

1. Klik tombol **Edit** pada perizinan
2. ✅ **Cek**: Tanggal izin dan tanggal kembali muncul di form
3. Ubah salah satu tanggal
4. Klik **Simpan**
5. ✅ **Cek**: Perubahan tersimpan

### C. Test Detail Perizinan

1. Klik tombol **Detail** pada perizinan
2. ✅ **Cek**: Tanggal tampil dengan format `DD/MM/YYYY`

---

## 🎯 LANGKAH 5: TESTING MENU PELANGGARAN

### A. Test Tambah Pelanggaran

1. Buka halaman **Pelanggaran**
2. Klik **Tambah Pelanggaran**
3. Isi form:
   - Pilih santri
   - Pilih jenis pelanggaran
   - **Tanggal Pelanggaran**: Pilih tanggal (misal: `18/09/2026`)
   - Isi kronologi
4. Klik **Simpan**
5. ✅ **Cek**: Data muncul di tabel dengan tanggal yang benar

### B. Test Edit Pelanggaran

1. Klik tombol **Edit** pada pelanggaran
2. ✅ **Cek**: Tanggal pelanggaran muncul di form
3. Ubah tanggal
4. Klik **Simpan**
5. ✅ **Cek**: Perubahan tersimpan

### C. Test Detail Pelanggaran

1. Klik tombol **Detail** pada pelanggaran
2. ✅ **Cek**: Tanggal tampil dengan format `DD/MM/YYYY`

---

## 🎯 LANGKAH 6: TESTING MENU PEMBINAAN

### A. Test Tambah Pembinaan

1. Buka halaman **Pembinaan**
2. Klik **Tambah Pembinaan**
3. Isi form:
   - Pilih santri (yang ada pelanggaran)
   - Pilih pelanggaran
   - **Tanggal Pembinaan**: Pilih tanggal (misal: `19/09/2026`)
   - Pilih jenis pembinaan
   - Isi materi/hasil (opsional)
4. Klik **Simpan**
5. ✅ **Cek**: Data muncul di tabel dengan tanggal yang benar

### B. Test Edit Pembinaan

1. Klik tombol **Edit** pada pembinaan
2. ✅ **Cek**: Tanggal pembinaan muncul di form
3. Ubah tanggal atau isi field lain
4. Klik **Simpan**
5. ✅ **Cek**: Perubahan tersimpan

### C. Test Selesaikan Pembinaan

1. Klik tombol **Selesaikan** pada pembinaan status "Proses"
2. Isi form:
   - **Tanggal Selesai**: Pilih tanggal (misal: `22/09/2026`)
   - Isi hasil pembinaan
3. Klik **Selesaikan**
4. ✅ **Cek**: Status berubah jadi "Selesai" dan tanggal selesai muncul

### D. Test Detail Pembinaan

1. Klik tombol **Detail** pada pembinaan
2. ✅ **Cek**: Tanggal pembinaan dan tanggal selesai tampil dengan format `DD/MM/YYYY`

---

## 🐛 TROUBLESHOOTING

### Masalah: Tanggal masih tidak tersimpan

**Solusi**:
1. Buka **Browser Console** (tekan F12 > Console)
2. Lihat apakah ada error saat simpan data
3. Buka **Network Tab** (F12 > Network)
4. Saat klik Simpan, cek request payload:
   - Pastikan format tanggal adalah `YYYY-MM-DD`
   - Contoh: `"tanggal_lahir": "2010-01-15"`
5. Cek response dari backend:
   - Jika ada error, catat pesannya

### Masalah: Error "Unknown column 'nama_kamar'"

**Solusi**:
```sql
-- Jalankan di MySQL:
USE manajemen_asrama;
ALTER TABLE santri ADD COLUMN nama_kamar VARCHAR(50) AFTER kamar_id;
```

### Masalah: Tanggal tidak muncul di form edit

**Solusi**:
1. Cek browser console untuk pesan error
2. Pastikan data di database tidak NULL
3. Cek format tanggal di database:
   ```sql
   SELECT id, nis, nama_lengkap, tanggal_lahir, tanggal_masuk 
   FROM santri 
   WHERE id = [ID_SANTRI];
   ```
4. Format harus: `YYYY-MM-DD` (misal: `2010-01-15`)

### Masalah: Format tanggal salah (tahun/bulan/hari terbalik)

**Solusi**: Sudah diperbaiki di `public/js/utils.js` dengan fungsi `formatDateForInput()` dan `formatDate()`.

---

## 📊 CHECKLIST VERIFIKASI

Centang setelah berhasil test:

### Database
- [ ] Kolom `nama_kamar` sudah ada di tabel `santri`
- [ ] Server sudah di-restart setelah database fix

### Data Santri
- [ ] ✅ Tambah santri dengan tanggal → berhasil
- [ ] ✅ Edit santri → tanggal tampil di form
- [ ] ✅ Simpan edit → tanggal tersimpan
- [ ] ✅ Detail santri → tanggal tampil DD/MM/YYYY

### Perizinan
- [ ] ✅ Tambah perizinan dengan tanggal → berhasil
- [ ] ✅ Edit perizinan → tanggal tampil di form
- [ ] ✅ Simpan edit → tanggal tersimpan
- [ ] ✅ Detail perizinan → tanggal tampil DD/MM/YYYY

### Pelanggaran
- [ ] ✅ Tambah pelanggaran dengan tanggal → berhasil
- [ ] ✅ Edit pelanggaran → tanggal tampil di form
- [ ] ✅ Simpan edit → tanggal tersimpan
- [ ] ✅ Detail pelanggaran → tanggal tampil DD/MM/YYYY

### Pembinaan
- [ ] ✅ Tambah pembinaan dengan tanggal → berhasil
- [ ] ✅ Edit pembinaan → tanggal tampil di form
- [ ] ✅ Simpan edit → tanggal tersimpan
- [ ] ✅ Selesaikan pembinaan dengan tanggal selesai → berhasil
- [ ] ✅ Detail pembinaan → tanggal tampil DD/MM/YYYY

---

## ✅ KESIMPULAN

Jika semua checklist di atas berhasil, maka masalah tanggal sudah **SELESAI** diperbaiki! 🎉

Jika masih ada masalah, screenshot error dan beritahu saya.

---

**Terakhir diupdate**: 22 September 2026  
**Status**: Semua perbaikan sudah diterapkan, siap untuk testing
