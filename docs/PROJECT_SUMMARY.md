# 📋 Project Summary - Sistem Manajemen Asrama Pesantren

## 🎯 Deskripsi Project
Aplikasi web full-stack untuk manajemen asrama pesantren dengan fitur perizinan santri, pencatatan pelanggaran, dan sistem pembinaan. Dilengkapi dengan sistem autentikasi multi-role (Admin, Pengasuh, Ustadz/Ustadzah).

---

## 📁 Struktur File yang Telah Dibuat

### Backend (Node.js + Express + MySQL)

#### 📂 Database
```
database/
├── manajemen_santri.sql # Schema database lengkap + data awal
└── connection.js       # Konfigurasi koneksi MySQL
```

#### 📂 Routes (API Endpoints)
```
routes/
├── auth.js            # Login, logout, change password
├── users.js           # CRUD user (admin only)
├── santri.js          # CRUD data santri
├── perizinan.js       # CRUD perizinan + approval
├── pelanggaran.js     # CRUD pelanggaran
├── pembinaan.js       # CRUD pembinaan
└── dashboard.js       # Statistik & data dashboard
```

#### 📂 Middleware
```
middleware/
├── auth.js            # JWT authentication & role checking
└── upload.js          # File upload handler (Multer)
```

#### 📂 Server
```
server.js              # Main server application
```

---

### Frontend (HTML + CSS + JavaScript)

#### 📂 HTML Pages
```
public/
├── index.html         # Login page
├── dashboard.html     # Dashboard utama
├── santri.html        # Manajemen data santri
├── perizinan.html     # Manajemen perizinan
├── pelanggaran.html   # Manajemen pelanggaran
├── pembinaan.html     # Manajemen pembinaan
└── users.html         # Manajemen user (admin only)
```

#### 📂 CSS
```
public/css/
└── style.css          # Custom styling (Bootstrap 5 based)
```

#### 📂 JavaScript
```
public/js/
├── config.js          # API configuration & helpers
├── auth.js            # Login logic
├── utils.js           # Utility functions (alerts, validation, etc)
├── sidebar.js         # Sidebar component
├── dashboard.js       # Dashboard logic
├── santri.js          # Santri page logic
├── perizinan.js       # Perizinan page logic
├── pelanggaran.js     # Pelanggaran page logic
├── pembinaan.js       # Pembinaan page logic
└── users.js           # User management logic
```

---

### 📂 Dokumentasi
```
README.md              # Dokumentasi lengkap project
INSTALASI.md           # Panduan instalasi step-by-step
API_DOCUMENTATION.md   # Dokumentasi API endpoints
PROJECT_SUMMARY.md     # File ini
```

---

### 📂 Configuration
```
.env                   # Environment variables (database, JWT, etc)
.env.example           # Template environment variables
.gitignore             # Git ignore file
package.json           # Dependencies & scripts
```

---

## 🗄️ Database Schema

### Tables (11 tabel):
1. **users** - Data pengguna sistem (admin, ustadz, pengasuh)
2. **asrama** - Data asrama
3. **kamar** - Data kamar di asrama
4. **santri** - Data santri
5. **jenis_izin** - Master jenis perizinan
6. **perizinan** - Data perizinan santri
7. **jenis_pelanggaran** - Master jenis pelanggaran
8. **pelanggaran** - Data pelanggaran santri
9. **pembinaan** - Data pembinaan santri
10. **pengiriman** - Log pengiriman notifikasi
11. **activity_log** - Log aktivitas sistem

---

## 🎨 Fitur Aplikasi

### 1. Authentication & Authorization
- ✅ Login dengan JWT
- ✅ Multi-role (Admin, Pengasuh, Ustadz, Ustadzah)
- ✅ Role-based access control
- ✅ Change password
- ✅ Auto logout on token expire

### 2. Dashboard
- ✅ Statistik realtime (total santri, perizinan pending, pelanggaran, pembinaan)
- ✅ Tabel perizinan terbaru
- ✅ Tabel pelanggaran terbaru
- ✅ Chart pelanggaran per kategori
- ✅ Top 5 santri pelanggar

### 3. Manajemen Santri
- ✅ CRUD santri
- ✅ Upload foto santri
- ✅ Data lengkap (biodata, asrama, kamar, wali)
- ✅ Filter & pencarian
- ✅ Status santri (aktif, alumni, keluar)

### 4. Perizinan Santri
- ✅ Ajukan perizinan (izin pulang, sakit, keperluan keluarga, dll)
- ✅ Data penjemput & tujuan
- ✅ Sistem approval (pending → disetujui/ditolak → selesai)
- ✅ Filter berdasarkan status & tanggal
- ✅ Catatan persetujuan

### 5. Pelanggaran Santri
- ✅ Catat pelanggaran
- ✅ Kategori (ringan, sedang, berat)
- ✅ Sistem poin
- ✅ Kronologi & saksi
- ✅ Upload bukti (optional)
- ✅ Status (tercatat, dalam pembinaan, selesai)
- ✅ Rekap pelanggaran per santri
- ✅ Integrasi dengan pembinaan

### 6. Pembinaan Santri
- ✅ Jenis pembinaan (teguran lisan, tertulis, konseling, sanksi, pemanggilan wali)
- ✅ Materi pembinaan
- ✅ Hasil & tindak lanjut
- ✅ Status (proses, selesai)
- ✅ Auto update status pelanggaran

### 7. Manajemen User (Admin Only)
- ✅ CRUD user
- ✅ Reset password
- ✅ Aktivasi/deaktivasi user
- ✅ Filter by role & status

---

## 🔐 Security Features

- ✅ Password hashing dengan bcrypt (salt rounds: 10)
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ Input validation
- ✅ SQL injection prevention (Parameterized queries)
- ✅ CORS enabled
- ✅ Secure file upload
- ✅ Activity logging

---

## 🛠️ Tech Stack

### Backend:
- **Node.js** v14+
- **Express.js** v4.18
- **MySQL** 5.7+
- **JWT** (jsonwebtoken)
- **Bcrypt** (bcryptjs)
- **Multer** (file upload)
- **Dotenv** (environment variables)

### Frontend:
- **HTML5**
- **CSS3** + **Bootstrap 5.3**
- **JavaScript** (Vanilla ES6+)
- **Font Awesome 6** (icons)

---

## 📊 API Endpoints Summary

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | /api/auth/login | Login | ❌ | All |
| GET | /api/auth/profile | Get profile | ✅ | All |
| POST | /api/auth/logout | Logout | ✅ | All |
| GET | /api/users | List users | ✅ | Admin |
| POST | /api/users | Create user | ✅ | Admin |
| GET | /api/santri | List santri | ✅ | All |
| POST | /api/santri | Create santri | ✅ | Admin, Ustadz |
| GET | /api/perizinan | List perizinan | ✅ | All |
| POST | /api/perizinan | Create perizinan | ✅ | Admin, Ustadz |
| PUT | /api/perizinan/:id/approval | Approve/reject | ✅ | Admin, Pengasuh, Ustadz |
| GET | /api/pelanggaran | List pelanggaran | ✅ | All |
| POST | /api/pelanggaran | Create pelanggaran | ✅ | Admin, Ustadz |
| GET | /api/pembinaan | List pembinaan | ✅ | All |
| POST | /api/pembinaan | Create pembinaan | ✅ | Admin, Ustadz, Pengasuh |
| GET | /api/dashboard/stats | Dashboard stats | ✅ | All |

*Lihat `API_DOCUMENTATION.md` untuk detail lengkap*

---

## 👥 Default Users

| Username | Password | Role | Access |
|----------|----------|------|--------|
| admin | password123 | Admin | Full access |
| pengasuh | password123 | Pengasuh | Approval, monitoring |
| ustadz1 | password123 | Ustadz | Input data, approval |
| ustadzah1 | password123 | Ustadzah | Input data, approval |

**⚠️ PENTING:** Ganti password setelah instalasi!

---

## 🚀 How to Run

### Quick Start:
```bash
# 1. Install dependencies
npm install

# 2. Setup database
# Import database/manajemen_santri.sql ke MySQL

# 3. Configure .env
# Edit DB_HOST, DB_USER, DB_PASSWORD, DB_NAME

# 4. Run server
npm run dev

# 5. Open browser
# http://localhost:3000
```

*Lihat `INSTALASI.md` untuk panduan lengkap*

---

## 📦 Dependencies

### Production:
- express - Web framework
- mysql2 - MySQL driver
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- dotenv - Environment variables
- cors - CORS middleware
- express-validator - Input validation
- multer - File upload

### Development:
- nodemon - Auto-reload server

---

## 🎯 Features Status

### ✅ Completed:
- [x] Authentication & Authorization
- [x] Dashboard dengan statistik
- [x] Manajemen Santri (CRUD)
- [x] Perizinan dengan approval
- [x] Pelanggaran dengan kategori & poin
- [x] Pembinaan dengan tracking
- [x] Manajemen User (Admin)
- [x] Responsive UI
- [x] API Documentation
- [x] Activity logging

### 🚧 Future Enhancements (Optional):
- [ ] Notifikasi WhatsApp ke wali
- [ ] Export laporan ke PDF
- [ ] Dashboard charts lebih advanced
- [ ] Upload foto bukti pelanggaran
- [ ] Kalender perizinan
- [ ] Rekap bulanan/tahunan
- [ ] Profile page & edit profile
- [ ] Change password di UI

---

## 📝 Notes

1. **Password default:** Semua user default menggunakan password `password123`. **Ganti setelah instalasi!**

2. **JWT Secret:** Default JWT secret di `.env` harus diganti di production dengan key yang lebih aman.

3. **Database:** Schema sudah include data awal (4 user, jenis izin, jenis pelanggaran).

4. **Upload:** Folder `uploads/` untuk menyimpan foto santri dan bukti pelanggaran (max 5MB).

5. **Port:** Default port 3000, bisa diganti di `.env`.

6. **MySQL:** Pastikan MySQL di Laragon sudah running sebelum start server.

---

## 🎓 Untuk Mahasiswa

Project ini cocok untuk:
- ✅ Tugas Akhir / Skripsi
- ✅ Proyek Semester
- ✅ Portfolio
- ✅ Belajar Full-Stack Development

**Skills yang dipraktikkan:**
- Backend API dengan Node.js + Express
- Database design & MySQL
- Frontend dengan Vanilla JS
- Authentication & Authorization
- REST API design
- CRUD operations
- Role-based access control

---

## 📞 Support & Issues

Jika ada pertanyaan atau issue:
1. Baca dokumentasi (`README.md`, `INSTALASI.md`, `API_DOCUMENTATION.md`)
2. Cek error di browser Console (F12)
3. Cek error di terminal server
4. Verifikasi database sudah di-import
5. Pastikan Node.js dan MySQL running

---

## 📜 License

MIT License - Bebas digunakan untuk keperluan pribadi maupun komersial.

---

**Dibuat dengan ❤️ untuk Pesantren Indonesia**

---

## 🎉 Congratulations!

Project sudah lengkap dan siap digunakan! Semua fitur sudah terimplementasi dengan baik.

**Next Steps:**
1. Install Node.js (jika belum)
2. Install dependencies (`npm install`)
3. Import database
4. Jalankan server (`npm run dev`)
5. Buka browser & enjoy! 🚀

**Happy Coding! 💻✨**
