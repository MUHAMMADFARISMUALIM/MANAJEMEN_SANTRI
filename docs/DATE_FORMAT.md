# Date Format Configuration

## Overview
Seluruh aplikasi menggunakan format tanggal **DD/MM/YYYY** untuk display dan input.

## Format Tanggal yang Digunakan

### 1. Display Format (Tampilan ke User)
Format: **DD/MM/YYYY**
Contoh: 22/09/2026

**Fungsi:** `formatDate()`, `formatDateShort()`
- File: `public/js/config.js`, `public/js/utils.js`
- Digunakan untuk menampilkan tanggal di table, alert, dan output lainnya

### 2. Input Format (HTML Date Input)
Format: **YYYY-MM-DD** (standar HTML)
Contoh: 2026-09-22

**Fungsi:** `formatDateForInput()`
- File: `public/js/config.js`, `public/js/utils.js`
- Digunakan untuk set value ke HTML date input field saat edit data

### 3. Database Format
Format: **YYYY-MM-DD** (MySQL DATE type)
Disimpan dalam database seperti: 2026-09-22

## Fungsi Helper

### formatDate(dateString)
Mengubah tanggal menjadi format DD/MM/YYYY untuk display
```javascript
formatDate('2026-09-22') // Output: 22/09/2026
```

### formatDateShort(dateString)
Alias dari formatDate, gunakan untuk display singkat
```javascript
formatDateShort('2026-09-22') // Output: 22/09/2026
```

### formatDateForInput(dateString)
Mengubah tanggal menjadi format YYYY-MM-DD untuk HTML date input
```javascript
formatDateForInput('22/09/2026') // Output: 2026-09-22
formatDateForInput('2026-09-22') // Output: 2026-09-22 (no change)
```

## Implementasi di Module

### santri.js
- Menggunakan `formatDateForInput()` untuk set `tanggal_lahir` dan `tanggal_masuk` saat edit

### perizinan.js
- Display: `formatDateShort()` untuk tampilkan `tanggal_izin` dan `tanggal_kembali`
- Input: HTML date input secara otomatis handle format YYYY-MM-DD

### pelanggaran.js
- Display: `formatDateShort()` untuk tampilkan `tanggal_pelanggaran`
- Input: HTML date input untuk `tanggal_pelanggaran`

### pembinaan.js
- Display: `formatDateShort()` untuk tampilkan `tanggal_pembinaan`
- Input: HTML date input untuk `tanggal_pembinaan`

### dashboard.js
- Display: `formatDateShort()` untuk tampilkan tanggal di table perizinan dan pelanggaran terbaru

## Konversi Tanggal

### Database → Display
```
Database: 2026-09-22
↓ (formatDate)
Display: 22/09/2026
```

### Display → Input
```
Display: 22/09/2026
↓ (formatDateForInput)
Input: 2026-09-22
```

### Input → Database
```
Input: 2026-09-22 (dari HTML date input)
→ (kirim ke backend)
Database: 2026-09-22
```

## Browser Support

Format DD/MM/YYYY menggunakan:
- `String.padStart()` - IE 11 tidak support, tapi aplikasi support modern browsers
- HTML5 Date Input - Supported di Chrome, Firefox, Safari, Edge

## Testing Checklist

- [x] Display tanggal di table menggunakan DD/MM/YYYY format
- [x] Edit data menampilkan date input dengan format YYYY-MM-DD
- [x] Submit form mengirim tanggal dalam format YYYY-MM-DD ke backend
- [x] Database menyimpan tanggal dalam format YYYY-MM-DD
- [x] Alert detail menampilkan tanggal dalam format DD/MM/YYYY

## Troubleshooting

### Tanggal tidak menampilkan dengan benar
- Pastikan function `formatDate()` sudah dipanggil saat render table
- Cek format data dari database adalah YYYY-MM-DD

### Date input tidak berfungsi
- Pastikan menggunakan `formatDateForInput()` saat set value ke date input
- Jangan set value dengan format DD/MM/YYYY ke HTML date input

### Tampilan tanggal berubah saat pindah page
- Pastikan semua file JS sudah include script date helper
- Cek urutan load script di HTML
