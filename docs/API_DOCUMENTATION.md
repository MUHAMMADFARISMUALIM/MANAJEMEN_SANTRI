# 📚 Dokumentasi API

Base URL: `http://localhost:3000/api`

## 🔐 Authentication

Semua endpoint (kecuali `/auth/login`) memerlukan JWT token di header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication Endpoints

### POST `/auth/login`
Login ke sistem

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "nama_lengkap": "Administrator",
      "email": "admin@pesantren.com",
      "role": "admin",
      "jenis_kelamin": "L",
      "status": "aktif"
    }
  }
}
```

### GET `/auth/profile`
Get profile user yang sedang login

**Headers:** `Authorization: Bearer <token>`

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "nama_lengkap": "Administrator",
    "email": "admin@pesantren.com",
    "role": "admin",
    "jenis_kelamin": "L",
    "no_hp": null,
    "foto": null,
    "status": "aktif",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST `/auth/change-password`
Ganti password user yang sedang login

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "old_password": "password123",
  "new_password": "newpassword456",
  "confirm_password": "newpassword456"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Password berhasil diubah"
}
```

---

## 2. Santri Endpoints

### GET `/santri`
Get semua data santri (dengan filter opsional)

**Query Parameters:**
- `status` - Filter status (aktif/alumni/keluar)
- `jenis_kelamin` - Filter jenis kelamin (L/P)
- `asrama_id` - Filter by asrama
- `search` - Pencarian nama/NIS

**Example:** `/api/santri?status=aktif&jenis_kelamin=L&search=ahmad`

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nis": "2024001",
      "nama_lengkap": "Ahmad Fauzi",
      "jenis_kelamin": "L",
      "tempat_lahir": "Jakarta",
      "tanggal_lahir": "2008-05-15",
      "alamat": "Jl. Merdeka No. 123",
      "asrama_id": 1,
      "kamar_id": 1,
      "no_hp": "081234567890",
      "nama_wali": "Bapak Ahmad",
      "no_hp_wali": "081234567891",
      "alamat_wali": "Jakarta",
      "foto": null,
      "tanggal_masuk": "2024-01-01",
      "status": "aktif",
      "nama_asrama": "Asrama Putra 1",
      "nama_kamar": "Kamar 101"
    }
  ]
}
```

### GET `/santri/:id`
Get detail santri by ID

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nis": "2024001",
    "nama_lengkap": "Ahmad Fauzi",
    ...
  }
}
```

### POST `/santri`
Tambah santri baru

**Request Body:**
```json
{
  "nis": "2024002",
  "nama_lengkap": "Fatimah Azzahra",
  "jenis_kelamin": "P",
  "tempat_lahir": "Bandung",
  "tanggal_lahir": "2008-03-20",
  "alamat": "Jl. Raya No. 456",
  "no_hp": "081234567892",
  "nama_wali": "Bapak Zainal",
  "no_hp_wali": "081234567893",
  "alamat_wali": "Bandung",
  "tanggal_masuk": "2024-01-01",
  "status": "aktif"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Santri berhasil ditambahkan",
  "data": {
    "id": 2
  }
}
```

### PUT `/santri/:id`
Update data santri

**Request Body:** (sama seperti POST, tanpa `nis`)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Santri berhasil diupdate"
}
```

### DELETE `/santri/:id`
Hapus santri

**Response Success (200):**
```json
{
  "success": true,
  "message": "Santri berhasil dihapus"
}
```

---

## 3. Perizinan Endpoints

### GET `/perizinan`
Get semua perizinan (dengan filter)

**Query Parameters:**
- `status` - Filter status (pending/disetujui/ditolak)
- `santri_id` - Filter by santri
- `tanggal_dari` - Filter tanggal awal (YYYY-MM-DD)
- `tanggal_sampai` - Filter tanggal akhir (YYYY-MM-DD)

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "santri_id": 1,
      "jenis_izin_id": 1,
      "tanggal_izin": "2024-03-20",
      "tanggal_kembali": "2024-03-22",
      "tujuan": "Rumah",
      "alasan": "Keperluan keluarga",
      "nama_penjemput": "Bapak Ahmad",
      "no_hp_penjemput": "081234567891",
      "status": "pending",
      "nama_santri": "Ahmad Fauzi",
      "nis": "2024001",
      "nama_izin": "Izin Pulang"
    }
  ]
}
```

### POST `/perizinan`
Ajukan perizinan baru

**Request Body:**
```json
{
  "santri_id": 1,
  "jenis_izin_id": 1,
  "tanggal_izin": "2024-03-20",
  "tanggal_kembali": "2024-03-22",
  "jam_keluar": "08:00",
  "jam_kembali": "16:00",
  "tujuan": "Rumah",
  "alasan": "Keperluan keluarga mendesak",
  "alamat_tujuan": "Jl. Merdeka No. 123, Jakarta",
  "nama_penjemput": "Bapak Ahmad",
  "no_hp_penjemput": "081234567891"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Perizinan berhasil diajukan",
  "data": {
    "id": 1
  }
}
```

### PUT `/perizinan/:id/approval`
Approve atau reject perizinan

**Request Body:**
```json
{
  "status": "disetujui",
  "catatan_persetujuan": "Disetujui dengan catatan harus kembali tepat waktu"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Perizinan berhasil disetujui",
  "data": {
    "nomor_surat": "001/SPS/MAA/IV/2026"
  }
}
```

Nomor surat dibuat otomatis saat perizinan disetujui dengan format `NNN/SPS/MAA/ROMAWI/TAHUN`. Jika status ditolak, `data.nomor_surat` bernilai `null`.

---

## 4. Pelanggaran Endpoints

### GET `/pelanggaran`
Get semua pelanggaran (dengan filter)

**Query Parameters:**
- `status` - Filter status
- `santri_id` - Filter by santri
- `kategori` - Filter kategori (ringan/sedang/berat)
- `tanggal_dari` - Filter tanggal awal
- `tanggal_sampai` - Filter tanggal akhir

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "santri_id": 1,
      "jenis_pelanggaran_id": 1,
      "tanggal_pelanggaran": "2024-03-15",
      "waktu_pelanggaran": "14:30:00",
      "tempat_kejadian": "Asrama",
      "kronologi": "Terlambat sholat dzuhur berjamaah",
      "saksi": "Ustadz Muhammad",
      "status": "tercatat",
      "nama_santri": "Ahmad Fauzi",
      "nis": "2024001",
      "nama_pelanggaran": "Terlambat Sholat Berjamaah",
      "kategori": "ringan",
      "poin": 5
    }
  ]
}
```

### POST `/pelanggaran`
Catat pelanggaran baru

**Request Body:**
```json
{
  "santri_id": 1,
  "jenis_pelanggaran_id": 1,
  "tanggal_pelanggaran": "2024-03-15",
  "waktu_pelanggaran": "14:30",
  "tempat_kejadian": "Asrama",
  "kronologi": "Santri terlambat datang ke masjid untuk sholat dzuhur berjamaah",
  "saksi": "Ustadz Muhammad",
  "catatan": null
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Pelanggaran berhasil dicatat",
  "data": {
    "id": 1
  }
}
```

### GET `/pelanggaran/rekap/santri/:santri_id`
Get rekap pelanggaran per santri

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "total_pelanggaran": 5,
    "total_poin": 35,
    "pelanggaran_ringan": 3,
    "pelanggaran_sedang": 1,
    "pelanggaran_berat": 1
  }
}
```

---

## 5. Pembinaan Endpoints

### GET `/pembinaan`
Get semua pembinaan

**Query Parameters:**
- `status` - Filter status (proses/selesai)
- `santri_id` - Filter by santri
- `jenis_pembinaan` - Filter jenis pembinaan

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "pelanggaran_id": 1,
      "santri_id": 1,
      "tanggal_pembinaan": "2024-03-16",
      "jenis_pembinaan": "teguran_lisan",
      "materi_pembinaan": "Pentingnya disiplin waktu dalam beribadah",
      "hasil_pembinaan": "Santri berjanji tidak akan mengulangi",
      "status": "proses",
      "nama_santri": "Ahmad Fauzi",
      "nama_pelanggaran": "Terlambat Sholat Berjamaah",
      "pembina_nama": "Ustadz Muhammad"
    }
  ]
}
```

### POST `/pembinaan`
Tambah pembinaan baru

**Request Body:**
```json
{
  "pelanggaran_id": 1,
  "santri_id": 1,
  "tanggal_pembinaan": "2024-03-16",
  "jenis_pembinaan": "konseling",
  "materi_pembinaan": "Konseling tentang pentingnya disiplin waktu",
  "hasil_pembinaan": null,
  "tindak_lanjut": "Monitoring selama 1 minggu",
  "catatan": null
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Pembinaan berhasil ditambahkan",
  "data": {
    "id": 1
  }
}
```

### PUT `/pembinaan/:id/selesai`
Selesaikan pembinaan

**Request Body:**
```json
{
  "tanggal_selesai": "2024-03-23",
  "hasil_pembinaan": "Santri sudah menunjukkan perbaikan yang signifikan",
  "catatan": "Tidak ada pelanggaran serupa dalam 1 minggu"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Pembinaan berhasil diselesaikan"
}
```

---

## 6. Dashboard Endpoints

### GET `/dashboard/stats`
Get statistik untuk dashboard

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_santri": 150,
      "perizinan_pending": 5,
      "pelanggaran_bulan_ini": 12,
      "pembinaan_proses": 3
    },
    "perizinan_terbaru": [...],
    "pelanggaran_terbaru": [...],
    "pelanggaran_per_kategori": [...],
    "santri_pelanggar_terbanyak": [...]
  }
}
```

---

## 7. User Management Endpoints (Admin Only)

### GET `/users`
Get semua user

**Query Parameters:**
- `role` - Filter by role
- `status` - Filter by status

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "nama_lengkap": "Administrator",
      "email": "admin@pesantren.com",
      "role": "admin",
      "jenis_kelamin": "L",
      "no_hp": null,
      "status": "aktif",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST `/users`
Tambah user baru

**Request Body:**
```json
{
  "username": "ustadz2",
  "password": "password123",
  "nama_lengkap": "Ustadz Abdullah",
  "email": "abdullah@pesantren.com",
  "role": "ustadz",
  "jenis_kelamin": "L",
  "no_hp": "081234567894"
}
```

### POST `/users/:id/reset-password`
Reset password user

**Request Body:**
```json
{
  "new_password": "newpassword123"
}
```

---

## 🔴 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Data tidak lengkap"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token tidak valid atau kadaluarsa"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Akses ditolak. Role Anda tidak memiliki izin untuk aksi ini"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Data tidak ditemukan"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Terjadi kesalahan pada server"
}
```

---

## 📝 Notes

- Semua tanggal menggunakan format: `YYYY-MM-DD`
- Semua waktu menggunakan format: `HH:MM:SS` atau `HH:MM`
- Token JWT expired setelah 24 jam (configurable di .env)
- Semua response menggunakan format JSON
- Status HTTP code mengikuti standar REST API

---

**Happy Coding! 🚀**
