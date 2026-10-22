-- Database Schema untuk Sistem Manajemen Asrama Pesantren
-- Buat database
CREATE DATABASE IF NOT EXISTS manajemen_asrama;
USE manajemen_asrama;

-- Tabel Users (untuk login multi-role)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role ENUM('admin', 'ustadz', 'ustadzah', 'pengasuh') NOT NULL,
    jenis_kelamin ENUM('L', 'P') NOT NULL,
    no_hp VARCHAR(15),
    foto VARCHAR(255),
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    akses_menu TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Asrama
CREATE TABLE asrama (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama_asrama VARCHAR(100) NOT NULL,
    jenis ENUM('putra', 'putri') NOT NULL,
    kapasitas INT NOT NULL,
    alamat TEXT,
    pengasuh_id INT,
    keterangan TEXT,
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pengasuh_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel Kamar
CREATE TABLE kamar (
    id INT PRIMARY KEY AUTO_INCREMENT,
    asrama_id INT NOT NULL,
    nama_kamar VARCHAR(50) NOT NULL,
    kapasitas INT NOT NULL,
    lantai INT,
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asrama_id) REFERENCES asrama(id) ON DELETE CASCADE
);

-- Tabel Santri
CREATE TABLE santri (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nis VARCHAR(20) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    jenis_kelamin ENUM('L', 'P') NOT NULL,
    tempat_lahir VARCHAR(50),
    tanggal_lahir DATE,
    alamat TEXT,
    asrama_id INT,
    kamar_id INT,
    nama_kamar VARCHAR(50),  -- Added: nama kamar as string for flexibility
    no_hp VARCHAR(15),
    nama_wali VARCHAR(100),
    no_hp_wali VARCHAR(15),
    alamat_wali TEXT,
    foto VARCHAR(255),
    tanggal_masuk DATE,
    status ENUM('aktif', 'alumni', 'keluar') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asrama_id) REFERENCES asrama(id) ON DELETE SET NULL,
    FOREIGN KEY (kamar_id) REFERENCES kamar(id) ON DELETE SET NULL
);

-- Tabel Jenis Perizinan
CREATE TABLE jenis_izin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama_izin VARCHAR(50) NOT NULL,
    deskripsi TEXT,
    warna VARCHAR(7) DEFAULT '#28a745',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Perizinan Santri
CREATE TABLE perizinan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    santri_id INT NOT NULL,
    jenis_izin_id INT NOT NULL,
    tanggal_izin DATE NOT NULL,
    tanggal_kembali DATE,
    jam_keluar TIME,
    jam_kembali TIME,
    tujuan VARCHAR(255),
    alasan TEXT NOT NULL,
    alamat_tujuan TEXT,
    nama_penjemput VARCHAR(100),
    no_hp_penjemput VARCHAR(15),
    status ENUM('pending', 'disetujui', 'ditolak') DEFAULT 'pending',
    nomor_surat VARCHAR(50) NULL,
    diajukan_oleh INT,
    disetujui_oleh INT,
    tanggal_disetujui TIMESTAMP NULL,
    catatan_persetujuan TEXT,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE,
    FOREIGN KEY (jenis_izin_id) REFERENCES jenis_izin(id),
    FOREIGN KEY (diajukan_oleh) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (disetujui_oleh) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE nomor_surat_counter (
    tahun SMALLINT UNSIGNED PRIMARY KEY,
    nomor_terakhir INT UNSIGNED NOT NULL DEFAULT 0
);

-- Tabel Jenis Pelanggaran
CREATE TABLE jenis_pelanggaran (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kode_pelanggaran VARCHAR(20) UNIQUE NOT NULL,
    nama_pelanggaran VARCHAR(100) NOT NULL,
    kategori ENUM('ringan', 'sedang', 'berat') NOT NULL,
    poin INT NOT NULL,
    sanksi TEXT,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Pelanggaran Santri
CREATE TABLE pelanggaran (
    id INT PRIMARY KEY AUTO_INCREMENT,
    santri_id INT NOT NULL,
    jenis_pelanggaran_id INT NOT NULL,
    tanggal_pelanggaran DATE NOT NULL,
    waktu_pelanggaran TIME,
    tempat_kejadian VARCHAR(100),
    kronologi TEXT NOT NULL,
    bukti VARCHAR(255),
    saksi VARCHAR(255),
    dilaporkan_oleh INT NOT NULL,
    status ENUM('tercatat', 'dalam_pembinaan', 'selesai') DEFAULT 'tercatat',
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE,
    FOREIGN KEY (jenis_pelanggaran_id) REFERENCES jenis_pelanggaran(id),
    FOREIGN KEY (dilaporkan_oleh) REFERENCES users(id)
);

-- Tabel Pembinaan
CREATE TABLE pembinaan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pelanggaran_id INT NOT NULL,
    santri_id INT NOT NULL,
    tanggal_pembinaan DATE NOT NULL,
    jenis_pembinaan ENUM('teguran_lisan', 'teguran_tertulis', 'konseling', 'sanksi_ringan', 'sanksi_berat', 'pemanggilan_wali') NOT NULL,
    pembina_id INT NOT NULL,
    materi_pembinaan TEXT,
    hasil_pembinaan TEXT,
    tindak_lanjut TEXT,
    status ENUM('proses', 'selesai') DEFAULT 'proses',
    tanggal_selesai DATE,
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pelanggaran_id) REFERENCES pelanggaran(id) ON DELETE CASCADE,
    FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE,
    FOREIGN KEY (pembina_id) REFERENCES users(id)
);

-- Tabel Pengiriman (Notifikasi/Pesan ke Wali)
CREATE TABLE pengiriman (
    id INT PRIMARY KEY AUTO_INCREMENT,
    santri_id INT NOT NULL,
    jenis_pengiriman ENUM('perizinan', 'pelanggaran', 'pembinaan', 'informasi') NOT NULL,
    referensi_id INT,
    judul VARCHAR(255) NOT NULL,
    pesan TEXT NOT NULL,
    no_hp_tujuan VARCHAR(15),
    status ENUM('pending', 'terkirim', 'gagal') DEFAULT 'pending',
    tanggal_kirim TIMESTAMP NULL,
    dikirim_oleh INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE,
    FOREIGN KEY (dikirim_oleh) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel Aktivitas Log
CREATE TABLE activity_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    aktivitas VARCHAR(255) NOT NULL,
    modul VARCHAR(50),
    keterangan TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Upgrade compatibility for databases created with an older schema.
-- Fresh databases already contain these columns; IF NOT EXISTS keeps this safe.
ALTER TABLE users ADD COLUMN IF NOT EXISTS akses_menu TEXT NULL AFTER status;
ALTER TABLE santri ADD COLUMN IF NOT EXISTS nama_kamar VARCHAR(50) AFTER kamar_id;
ALTER TABLE perizinan ADD COLUMN IF NOT EXISTS nomor_surat VARCHAR(50) NULL AFTER status;
CREATE TABLE IF NOT EXISTS nomor_surat_counter (
    tahun SMALLINT UNSIGNED PRIMARY KEY,
    nomor_terakhir INT UNSIGNED NOT NULL DEFAULT 0
);

DELETE FROM perizinan WHERE CAST(status AS CHAR) = 'selesai';
ALTER TABLE perizinan MODIFY status ENUM('pending', 'disetujui', 'ditolak') DEFAULT 'pending';

UPDATE santri s
LEFT JOIN kamar k ON s.kamar_id = k.id
SET s.nama_kamar = k.nama_kamar
WHERE s.kamar_id IS NOT NULL AND (s.nama_kamar IS NULL OR s.nama_kamar = '');

UPDATE perizinan AS p
JOIN (
    SELECT approved.id, approved.tahun, approved.bulan,
           ROW_NUMBER() OVER (
               PARTITION BY approved.tahun
               ORDER BY approved.tanggal_nomor, approved.id
           ) AS nomor_urut
    FROM (
        SELECT id,
               YEAR(COALESCE(tanggal_disetujui, tanggal_izin)) AS tahun,
               MONTH(COALESCE(tanggal_disetujui, tanggal_izin)) AS bulan,
               COALESCE(tanggal_disetujui, tanggal_izin) AS tanggal_nomor
        FROM perizinan
        WHERE status = 'disetujui' AND nomor_surat IS NULL
    ) AS approved
) AS ranked ON ranked.id = p.id
SET p.nomor_surat = CONCAT(
    LPAD(ranked.nomor_urut, 3, '0'),
    '/SPS/MAA/',
    CASE ranked.bulan
        WHEN 1 THEN 'I' WHEN 2 THEN 'II' WHEN 3 THEN 'III'
        WHEN 4 THEN 'IV' WHEN 5 THEN 'V' WHEN 6 THEN 'VI'
        WHEN 7 THEN 'VII' WHEN 8 THEN 'VIII' WHEN 9 THEN 'IX'
        WHEN 10 THEN 'X' WHEN 11 THEN 'XI' WHEN 12 THEN 'XII'
    END,
    '/', ranked.tahun
);

INSERT INTO nomor_surat_counter (tahun, nomor_terakhir)
SELECT YEAR(COALESCE(tanggal_disetujui, tanggal_izin)) AS tahun,
       MAX(CAST(SUBSTRING_INDEX(nomor_surat, '/', 1) AS UNSIGNED)) AS nomor_terakhir
FROM perizinan
WHERE nomor_surat IS NOT NULL
GROUP BY YEAR(COALESCE(tanggal_disetujui, tanggal_izin))
ON DUPLICATE KEY UPDATE nomor_terakhir = GREATEST(nomor_terakhir, VALUES(nomor_terakhir));

-- Insert Data Awal

-- Insert default admin
INSERT INTO users (username, password, nama_lengkap, email, role, jenis_kelamin, status) 
VALUES 
('admin', '$2a$10$rH8qNKQwQYEjGKkXPZvOu.vJZhXXxZ9L8fKZKZJXJZJXJZJXJZJXJ', 'Administrator', 'admin@pesantren.com', 'admin', 'L', 'aktif'),
('pengasuh', '$2a$10$rH8qNKQwQYEjGKkXPZvOu.vJZhXXxZ9L8fKZKZJXJZJXJZJXJZJXJ', 'KH. Ahmad Dahlan', 'pengasuh@pesantren.com', 'pengasuh', 'L', 'aktif'),
('ustadz1', '$2a$10$rH8qNKQwQYEjGKkXPZvOu.vJZhXXxZ9L8fKZKZJXJZJXJZJXJZJXJ', 'Ustadz Muhammad', 'ustadz@pesantren.com', 'ustadz', 'L', 'aktif'),
('ustadzah1', '$2a$10$rH8qNKQwQYEjGKkXPZvOu.vJZhXXxZ9L8fKZKZJXJZJXJZJXJZJXJ', 'Ustadzah Fatimah', 'ustadzah@pesantren.com', 'ustadzah', 'P', 'aktif');
-- Password default untuk semua: "password123"

-- Insert jenis izin
INSERT INTO jenis_izin (nama_izin, deskripsi, warna) VALUES
('Izin Pulang', 'Izin pulang ke rumah', '#28a745'),
('Izin Sakit', 'Izin karena sakit/berobat', '#ffc107'),
('Izin Keperluan Keluarga', 'Izin untuk keperluan keluarga mendesak', '#17a2b8'),
('Izin Keluar Sebentar', 'Izin keluar sebentar (kurang dari 1 hari)', '#6c757d');

-- Insert jenis pelanggaran
INSERT INTO jenis_pelanggaran (kode_pelanggaran, nama_pelanggaran, kategori, poin, sanksi, deskripsi) VALUES
('PR-001', 'Terlambat Sholat Berjamaah', 'ringan', 5, 'Teguran lisan dan tambahan tugas', 'Terlambat mengikuti sholat berjamaah'),
('PR-002', 'Tidak Rapi Berpakaian', 'ringan', 3, 'Teguran dan perbaikan', 'Tidak menggunakan pakaian sesuai aturan'),
('PS-001', 'Keluar Asrama Tanpa Izin', 'sedang', 15, 'Teguran tertulis dan sanksi pembersihan', 'Keluar area asrama tanpa izin pengurus'),
('PS-002', 'Tidak Masuk Pengajian', 'sedang', 10, 'Konseling dan tugas tambahan', 'Tidak mengikuti pengajian tanpa alasan jelas'),
('PB-001', 'Membawa Barang Terlarang', 'berat', 30, 'Sanksi berat dan pemanggilan wali', 'Membawa rokok, hp yang tidak diizinkan, dll'),
('PB-002', 'Berkelahi', 'berat', 40, 'Sanksi berat dan konseling intensif', 'Terlibat perkelahian dengan santri lain');
