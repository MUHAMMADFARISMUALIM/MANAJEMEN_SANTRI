const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { verifyToken } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', verifyToken, async (req, res) => {
    try {
        // Total Santri
        const [totalSantri] = await db.query(
            'SELECT COUNT(*) as total FROM santri WHERE status = ?',
            ['aktif']
        );

        // Total Perizinan Pending
        const [perizinanPending] = await db.query(
            'SELECT COUNT(*) as total FROM perizinan WHERE status = ?',
            ['pending']
        );

        // Total Pelanggaran Bulan Ini
        const [pelanggaranBulanIni] = await db.query(
            `SELECT COUNT(*) as total FROM pelanggaran 
             WHERE MONTH(tanggal_pelanggaran) = MONTH(CURRENT_DATE()) 
             AND YEAR(tanggal_pelanggaran) = YEAR(CURRENT_DATE())`
        );

        // Total Pembinaan Proses
        const [pembinaanProses] = await db.query(
            'SELECT COUNT(*) as total FROM pembinaan WHERE status = ?',
            ['proses']
        );

        // Perizinan Terbaru (5 terakhir)
        const [perizinanTerbaru] = await db.query(
            `SELECT p.id, p.tanggal_izin, p.status, p.created_at,
                    s.nama_lengkap as nama_santri, s.nis,
                    ji.nama_izin
             FROM perizinan p
             INNER JOIN santri s ON p.santri_id = s.id
             INNER JOIN jenis_izin ji ON p.jenis_izin_id = ji.id
             ORDER BY p.created_at DESC
             LIMIT 5`
        );

        // Pelanggaran Terbaru (5 terakhir)
        const [pelanggaranTerbaru] = await db.query(
            `SELECT p.id, p.tanggal_pelanggaran, p.status, p.created_at,
                    s.nama_lengkap as nama_santri, s.nis,
                    jp.nama_pelanggaran, jp.kategori
             FROM pelanggaran p
             INNER JOIN santri s ON p.santri_id = s.id
             INNER JOIN jenis_pelanggaran jp ON p.jenis_pelanggaran_id = jp.id
             ORDER BY p.created_at DESC
             LIMIT 5`
        );

        // Statistik Pelanggaran per Kategori
        const [pelanggaranPerKategori] = await db.query(
            `SELECT jp.kategori, COUNT(*) as total
             FROM pelanggaran p
             INNER JOIN jenis_pelanggaran jp ON p.jenis_pelanggaran_id = jp.id
             WHERE MONTH(p.tanggal_pelanggaran) = MONTH(CURRENT_DATE())
             AND YEAR(p.tanggal_pelanggaran) = YEAR(CURRENT_DATE())
             GROUP BY jp.kategori`
        );

        // Santri dengan Pelanggaran Terbanyak (Top 5)
        const [santriPelanggarTerbanyak] = await db.query(
            `SELECT s.id, s.nis, s.nama_lengkap, 
                    COUNT(p.id) as total_pelanggaran,
                    SUM(jp.poin) as total_poin
             FROM santri s
             INNER JOIN pelanggaran p ON s.id = p.santri_id
             INNER JOIN jenis_pelanggaran jp ON p.jenis_pelanggaran_id = jp.id
             WHERE s.status = 'aktif'
             GROUP BY s.id
             ORDER BY total_pelanggaran DESC
             LIMIT 5`
        );

        res.json({
            success: true,
            data: {
                summary: {
                    total_santri: totalSantri[0].total,
                    perizinan_pending: perizinanPending[0].total,
                    pelanggaran_bulan_ini: pelanggaranBulanIni[0].total,
                    pembinaan_proses: pembinaanProses[0].total
                },
                perizinan_terbaru: perizinanTerbaru,
                pelanggaran_terbaru: pelanggaranTerbaru,
                pelanggaran_per_kategori: pelanggaranPerKategori,
                santri_pelanggar_terbanyak: santriPelanggarTerbanyak
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

module.exports = router;
