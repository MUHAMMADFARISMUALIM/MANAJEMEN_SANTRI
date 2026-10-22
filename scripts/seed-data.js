// Script untuk insert data dummy
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedData() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sistem_santri'
        });

        console.log('✓ Terhubung ke database');

        // Data santri (15 santri dengan variasi nama kamar)
        const santriData = [
            { nis: '2024001', nama: 'Ahmad Fauzi', jk: 'L', tempat_lahir: 'Jakarta', tanggal_lahir: '2008-05-12', alamat: 'Jl. Merdeka No. 10 Jakarta', asrama_id: 1, kamar: 'Umar', wali: 'Bapak Fauzi', hp_wali: '081234567801' },
            { nis: '2024002', nama: 'Muhammad Rizki', jk: 'L', tempat_lahir: 'Bogor', tanggal_lahir: '2008-08-20', alamat: 'Jl. Pajajaran Bogor', asrama_id: 1, kamar: 'Usman', wali: 'Ibu Siti', hp_wali: '081234567802' },
            { nis: '2024003', nama: 'Abdullah Aziz', jk: 'L', tempat_lahir: 'Bandung', tanggal_lahir: '2009-02-15', alamat: 'Jl. Asia Afrika Bandung', asrama_id: 2, kamar: 'Abu Bakar', wali: 'Bapak Aziz', hp_wali: '081234567803' },
            { nis: '2024004', nama: 'Yusuf Hakim', jk: 'L', tempat_lahir: 'Bekasi', tanggal_lahir: '2008-11-30', alamat: 'Jl. Raya Bekasi', asrama_id: 2, kamar: 'Ali', wali: 'Ibu Hakim', hp_wali: '081234567804' },
            { nis: '2024005', nama: 'Ibrahim Khalil', jk: 'L', tempat_lahir: 'Depok', tanggal_lahir: '2009-04-18', alamat: 'Jl. Margonda Depok', asrama_id: 1, kamar: 'Umar', wali: 'Bapak Khalil', hp_wali: '081234567805' },
            { nis: '2024006', nama: 'Zainal Abidin', jk: 'L', tempat_lahir: 'Tangerang', tanggal_lahir: '2008-07-25', alamat: 'Jl. BSD Tangerang', asrama_id: 2, kamar: 'Usman', wali: 'Ibu Zainal', hp_wali: '081234567806' },
            { nis: '2024007', nama: 'Hamzah Firdaus', jk: 'L', tempat_lahir: 'Sukabumi', tanggal_lahir: '2009-01-10', alamat: 'Jl. Pelabuhan Ratu', asrama_id: 1, kamar: 'Ali', wali: 'Bapak Hamzah', hp_wali: '081234567807' },
            { nis: '2024008', nama: 'Umar Said', jk: 'L', tempat_lahir: 'Cianjur', tanggal_lahir: '2008-09-05', alamat: 'Jl. Raya Cianjur', asrama_id: 2, kamar: 'Abu Bakar', wali: 'Ibu Said', hp_wali: '081234567808' },
            
            { nis: '2024009', nama: 'Fatimah Azzahra', jk: 'P', tempat_lahir: 'Jakarta', tanggal_lahir: '2008-06-14', alamat: 'Jl. Sudirman Jakarta', asrama_id: 3, kamar: 'Aisyah', wali: 'Bapak Ahmad', hp_wali: '081234567809' },
            { nis: '2024010', nama: 'Khadijah Salsabila', jk: 'P', tempat_lahir: 'Bogor', tanggal_lahir: '2009-03-22', alamat: 'Jl. Raya Bogor', asrama_id: 3, kamar: 'Khadijah', wali: 'Ibu Khadijah', hp_wali: '081234567810' },
            { nis: '2024011', nama: 'Maryam Khairunisa', jk: 'P', tempat_lahir: 'Bandung', tanggal_lahir: '2008-12-08', alamat: 'Jl. Dago Bandung', asrama_id: 4, kamar: 'Fatimah', wali: 'Bapak Hasan', hp_wali: '081234567811' },
            { nis: '2024012', nama: 'Aisyah Nur Azizah', jk: 'P', tempat_lahir: 'Bekasi', tanggal_lahir: '2009-05-17', alamat: 'Jl. Kalimalang Bekasi', asrama_id: 4, kamar: 'Aisyah', wali: 'Ibu Aisyah', hp_wali: '081234567812' },
            { nis: '2024013', nama: 'Zainab Aulia', jk: 'P', tempat_lahir: 'Depok', tanggal_lahir: '2008-10-28', alamat: 'Jl. Juanda Depok', asrama_id: 3, kamar: 'Khadijah', wali: 'Bapak Zain', hp_wali: '081234567813' },
            { nis: '2024014', nama: 'Hafsah Nabila', jk: 'P', tempat_lahir: 'Tangerang', tanggal_lahir: '2009-02-19', alamat: 'Jl. Serpong Tangerang', asrama_id: 4, kamar: 'Fatimah', wali: 'Ibu Nabila', hp_wali: '081234567814' },
            { nis: '2024015', nama: 'Ruqayyah Zahra', jk: 'P', tempat_lahir: 'Sukabumi', tanggal_lahir: '2008-08-11', alamat: 'Jl. Cibadak Sukabumi', asrama_id: 3, kamar: 'Aisyah', wali: 'Bapak Zaki', hp_wali: '081234567815' },
        ];

        console.log('\n📝 Menambahkan data santri...');
        for (const santri of santriData) {
            const [existing] = await connection.query('SELECT id FROM santri WHERE nis = ?', [santri.nis]);
            if (existing.length === 0) {
                await connection.query(
                    `INSERT INTO santri (nis, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir, 
                     alamat, asrama_id, nama_kamar, nama_wali, no_hp_wali, tanggal_masuk, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'aktif')`,
                    [santri.nis, santri.nama, santri.jk, santri.tempat_lahir, santri.tanggal_lahir, 
                     santri.alamat, santri.asrama_id, santri.kamar, santri.wali, santri.hp_wali]
                );
                console.log(`✓ ${santri.nama} ditambahkan`);
            }
        }

        // Ambil ID santri yang baru ditambahkan
        const [santriList] = await connection.query('SELECT id, nama_lengkap FROM santri ORDER BY id DESC LIMIT 15');
        
        // Data pelanggaran (minimal 15 pelanggaran bervariasi)
        console.log('\n🚨 Menambahkan data pelanggaran...');
        const pelanggaranData = [
            { santri_idx: 0, jenis_id: 1, tanggal: '2024-09-01', waktu: '05:30', tempat: 'Masjid', kronologi: 'Terlambat sholat subuh' },
            { santri_idx: 1, jenis_id: 2, tanggal: '2024-09-02', waktu: '07:00', tempat: 'Asrama', kronologi: 'Seragam tidak rapi' },
            { santri_idx: 2, jenis_id: 3, tanggal: '2024-09-03', waktu: '15:00', tempat: 'Gerbang', kronologi: 'Keluar tanpa izin' },
            { santri_idx: 3, jenis_id: 1, tanggal: '2024-09-04', waktu: '12:30', tempat: 'Masjid', kronologi: 'Terlambat sholat dzuhur' },
            { santri_idx: 4, jenis_id: 4, tanggal: '2024-09-05', waktu: '20:00', tempat: 'Kelas', kronologi: 'Tidak masuk pengajian malam' },
            { santri_idx: 5, jenis_id: 2, tanggal: '2024-09-06', waktu: '06:00', tempat: 'Asrama', kronologi: 'Kamar tidak rapi' },
            { santri_idx: 6, jenis_id: 1, tanggal: '2024-09-07', waktu: '18:45', tempat: 'Masjid', kronologi: 'Terlambat sholat maghrib' },
            { santri_idx: 7, jenis_id: 3, tanggal: '2024-09-08', waktu: '14:00', tempat: 'Gerbang', kronologi: 'Keluar area tanpa izin' },
            { santri_idx: 8, jenis_id: 4, tanggal: '2024-09-09', waktu: '19:00', tempat: 'Kelas', kronologi: 'Bolos pengajian' },
            { santri_idx: 9, jenis_id: 2, tanggal: '2024-09-10', waktu: '08:00', tempat: 'Asrama', kronologi: 'Tidak memakai jilbab' },
            { santri_idx: 10, jenis_id: 1, tanggal: '2024-09-11', waktu: '04:45', tempat: 'Masjid', kronologi: 'Terlambat sholat subuh' },
            { santri_idx: 11, jenis_id: 5, tanggal: '2024-09-12', waktu: '21:00', tempat: 'Kamar', kronologi: 'Membawa HP' },
            { santri_idx: 12, jenis_id: 3, tanggal: '2024-09-13', waktu: '16:00', tempat: 'Warung', kronologi: 'Keluar tanpa izin' },
            { santri_idx: 13, jenis_id: 4, tanggal: '2024-09-14', waktu: '20:30', tempat: 'Kelas', kronologi: 'Tidak ikut pengajian' },
            { santri_idx: 14, jenis_id: 2, tanggal: '2024-09-15', waktu: '07:30', tempat: 'Asrama', kronologi: 'Pakaian tidak sesuai aturan' },
            { santri_idx: 0, jenis_id: 1, tanggal: '2024-09-16', waktu: '13:00', tempat: 'Masjid', kronologi: 'Terlambat sholat ashar' },
            { santri_idx: 1, jenis_id: 6, tanggal: '2024-09-17', waktu: '10:00', tempat: 'Asrama', kronologi: 'Berkelahi dengan teman' },
            { santri_idx: 2, jenis_id: 4, tanggal: '2024-09-18', waktu: '19:30', tempat: 'Kelas', kronologi: 'Tidak masuk kelas malam' },
        ];

        // Get user ID untuk dilaporkan_oleh (ambil admin)
        const [admin] = await connection.query('SELECT id FROM users WHERE role = "admin" LIMIT 1');
        const adminId = admin[0].id;

        for (const pel of pelanggaranData) {
            const santriId = santriList[pel.santri_idx].id;
            await connection.query(
                `INSERT INTO pelanggaran (santri_id, jenis_pelanggaran_id, tanggal_pelanggaran, 
                 waktu_pelanggaran, tempat_kejadian, kronologi, dilaporkan_oleh, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'tercatat')`,
                [santriId, pel.jenis_id, pel.tanggal, pel.waktu, pel.tempat, pel.kronologi, adminId]
            );
        }
        console.log(`✓ ${pelanggaranData.length} pelanggaran ditambahkan`);

        // Data perizinan (minimal 15 perizinan bervariasi)
        console.log('\n📋 Menambahkan data perizinan...');
        const perizinanData = [
            { santri_idx: 0, jenis: 1, tanggal: '2024-09-20', kembali: '2024-09-22', tujuan: 'Rumah (Jakarta)', alasan: 'Pulang menjenguk orangtua', status: 'disetujui' },
            { santri_idx: 1, jenis: 2, tanggal: '2024-09-21', kembali: '2024-09-21', tujuan: 'RS Mitra Keluarga', alasan: 'Sakit demam', status: 'disetujui' },
            { santri_idx: 2, jenis: 3, tanggal: '2024-09-22', kembali: '2024-09-23', tujuan: 'Bandung', alasan: 'Pernikahan saudara', status: 'disetujui' },
            { santri_idx: 3, jenis: 4, tanggal: '2024-09-23', kembali: '2024-09-23', tujuan: 'Minimarket', alasan: 'Beli keperluan', status: 'disetujui' },
            { santri_idx: 4, jenis: 1, tanggal: '2024-09-24', kembali: '2024-09-25', tujuan: 'Depok', alasan: 'Pulang ke rumah', status: 'disetujui' },
            { santri_idx: 5, jenis: 2, tanggal: '2024-09-25', kembali: '2024-09-25', tujuan: 'Klinik Al-Hikmah', alasan: 'Periksa gigi', status: 'disetujui' },
            { santri_idx: 6, jenis: 3, tanggal: '2024-09-26', kembali: '2024-09-27', tujuan: 'Sukabumi', alasan: 'Acara keluarga', status: 'pending' },
            { santri_idx: 7, jenis: 1, tanggal: '2024-09-27', kembali: '2024-09-29', tujuan: 'Cianjur', alasan: 'Liburan ke rumah', status: 'disetujui' },
            { santri_idx: 8, jenis: 4, tanggal: '2024-09-28', kembali: '2024-09-28', tujuan: 'Alfamart', alasan: 'Beli pulsa', status: 'disetujui' },
            { santri_idx: 9, jenis: 2, tanggal: '2024-09-29', kembali: '2024-09-29', tujuan: 'Puskesmas', alasan: 'Sakit flu', status: 'disetujui' },
            { santri_idx: 10, jenis: 3, tanggal: '2024-09-30', kembali: '2024-10-01', tujuan: 'Bandung', alasan: 'Aqiqah keponakan', status: 'pending' },
            { santri_idx: 11, jenis: 1, tanggal: '2024-10-01', kembali: '2024-10-03', tujuan: 'Bekasi', alasan: 'Kunjungan keluarga', status: 'disetujui' },
            { santri_idx: 12, jenis: 4, tanggal: '2024-10-02', kembali: '2024-10-02', tujuan: 'Warung', alasan: 'Beli makanan', status: 'disetujui' },
            { santri_idx: 13, jenis: 2, tanggal: '2024-10-03', kembali: '2024-10-03', tujuan: 'RS Hermina', alasan: 'Cek kesehatan', status: 'pending' },
            { santri_idx: 14, jenis: 1, tanggal: '2024-10-04', kembali: '2024-10-05', tujuan: 'Sukabumi', alasan: 'Pulang kampung', status: 'disetujui' },
            { santri_idx: 0, jenis: 3, tanggal: '2024-10-05', kembali: '2024-10-06', tujuan: 'Jakarta Pusat', alasan: 'Walimah teman', status: 'pending' },
            { santri_idx: 1, jenis: 4, tanggal: '2024-10-06', kembali: '2024-10-06', tujuan: 'Fotokopi', alasan: 'Print tugas', status: 'disetujui' },
        ];

        for (const izin of perizinanData) {
            const santriId = santriList[izin.santri_idx].id;
            const disetujuiOleh = izin.status !== 'pending' ? adminId : null;
            const tanggalDisetujui = izin.status !== 'pending' ? 'NOW()' : 'NULL';
            
            await connection.query(
                `INSERT INTO perizinan (santri_id, jenis_izin_id, tanggal_izin, tanggal_kembali, 
                 tujuan, alasan, diajukan_oleh, disetujui_oleh, tanggal_disetujui, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ${tanggalDisetujui}, ?)`,
                [santriId, izin.jenis, izin.tanggal, izin.kembali, izin.tujuan, izin.alasan, 
                 adminId, disetujuiOleh, izin.status]
            );
        }
        console.log(`✓ ${perizinanData.length} perizinan ditambahkan`);

        console.log('\n✅ SELESAI! Data dummy berhasil ditambahkan.');
        console.log('\nRingkasan:');
        console.log(`- ${santriData.length} santri dengan variasi kamar (Umar, Usman, Abu Bakar, Ali, Aisyah, Khadijah, Fatimah)`);
        console.log(`- ${pelanggaranData.length} pelanggaran dengan variasi jenis`);
        console.log(`- ${perizinanData.length} perizinan dengan berbagai status`);

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedData();
