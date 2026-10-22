const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get all pembinaan
router.get('/', verifyToken, async (req, res) => {
    try {
        const { status, santri_id, jenis_pembinaan } = req.query;
        
        let query = `
            SELECT pb.*, 
                   s.nis, s.nama_lengkap as nama_santri,
                   p.tanggal_pelanggaran,
                   jp.nama_pelanggaran, jp.kategori,
                   u.nama_lengkap as pembina_nama
            FROM pembinaan pb
            INNER JOIN santri s ON pb.santri_id = s.id
            INNER JOIN pelanggaran p ON pb.pelanggaran_id = p.id
            INNER JOIN jenis_pelanggaran jp ON p.jenis_pelanggaran_id = jp.id
            INNER JOIN users u ON pb.pembina_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND pb.status = ?';
            params.push(status);
        }

        if (santri_id) {
            query += ' AND pb.santri_id = ?';
            params.push(santri_id);
        }

        if (jenis_pembinaan) {
            query += ' AND pb.jenis_pembinaan = ?';
            params.push(jenis_pembinaan);
        }

        query += ' ORDER BY pb.created_at DESC';

        const [pembinaan] = await db.query(query, params);

        res.json({
            success: true,
            data: pembinaan
        });

    } catch (error) {
        console.error('Get pembinaan error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Get pembinaan by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [pembinaan] = await db.query(`
            SELECT pb.*, 
                   s.nis, s.nama_lengkap as nama_santri, s.nama_wali, s.no_hp_wali,
                   s.jenis_kelamin, s.nama_kamar, s.status as status_santri,
                   a.nama_asrama,
                   p.tanggal_pelanggaran, p.kronologi,
                   jp.nama_pelanggaran, jp.kategori, jp.sanksi,
                   u.nama_lengkap as pembina_nama
            FROM pembinaan pb
            INNER JOIN santri s ON pb.santri_id = s.id
            LEFT JOIN asrama a ON s.asrama_id = a.id
            INNER JOIN pelanggaran p ON pb.pelanggaran_id = p.id
            INNER JOIN jenis_pelanggaran jp ON p.jenis_pelanggaran_id = jp.id
            INNER JOIN users u ON pb.pembina_id = u.id
            WHERE pb.id = ?
        `, [req.params.id]);

        if (pembinaan.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pembinaan tidak ditemukan' 
            });
        }

        res.json({
            success: true,
            data: pembinaan[0]
        });

    } catch (error) {
        console.error('Get pembinaan error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Create pembinaan
router.post('/', verifyToken, checkRole('admin', 'ustadz', 'ustadzah', 'pengasuh'), async (req, res) => {
    try {
        const { 
            pelanggaran_id, santri_id, tanggal_pembinaan, jenis_pembinaan,
            materi_pembinaan, hasil_pembinaan, tindak_lanjut, catatan
        } = req.body;

        // Validasi
        if (!pelanggaran_id || !santri_id || !tanggal_pembinaan || !jenis_pembinaan) {
            return res.status(400).json({ 
                success: false, 
                message: 'Data tidak lengkap' 
            });
        }

        // Insert pembinaan
        const [result] = await db.query(
            `INSERT INTO pembinaan 
            (pelanggaran_id, santri_id, tanggal_pembinaan, jenis_pembinaan, pembina_id,
             materi_pembinaan, hasil_pembinaan, tindak_lanjut, status, catatan) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [pelanggaran_id, santri_id, tanggal_pembinaan || null, jenis_pembinaan, req.user.id,
             materi_pembinaan || null, hasil_pembinaan || null, tindak_lanjut || null, 'proses', catatan || null]
        );

        // Update status pelanggaran menjadi dalam_pembinaan
        await db.query(
            'UPDATE pelanggaran SET status = ? WHERE id = ?',
            ['dalam_pembinaan', pelanggaran_id]
        );

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Tambah pembinaan baru', 'pembinaan', `Pembinaan ID: ${result.insertId}`]
        );

        res.status(201).json({
            success: true,
            message: 'Pembinaan berhasil ditambahkan',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('Create pembinaan error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Update pembinaan
router.put('/:id', verifyToken, checkRole('admin', 'ustadz', 'ustadzah', 'pengasuh'), async (req, res) => {
    try {
        const { 
            tanggal_pembinaan, jenis_pembinaan, materi_pembinaan, 
            hasil_pembinaan, tindak_lanjut, catatan
        } = req.body;

        const [pembinaan] = await db.query('SELECT id FROM pembinaan WHERE id = ?', [req.params.id]);
        if (pembinaan.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pembinaan tidak ditemukan' 
            });
        }

        await db.query(
            `UPDATE pembinaan SET 
            tanggal_pembinaan = ?, jenis_pembinaan = ?, materi_pembinaan = ?,
            hasil_pembinaan = ?, tindak_lanjut = ?, catatan = ?
            WHERE id = ?`,
            [tanggal_pembinaan || null, jenis_pembinaan, materi_pembinaan || null, hasil_pembinaan || null,
             tindak_lanjut || null, catatan || null, req.params.id]
        );

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Update pembinaan', 'pembinaan', `Pembinaan ID: ${req.params.id}`]
        );

        res.json({
            success: true,
            message: 'Pembinaan berhasil diupdate'
        });

    } catch (error) {
        console.error('Update pembinaan error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Selesaikan pembinaan
router.put('/:id/selesai', verifyToken, checkRole('admin', 'ustadz', 'ustadzah', 'pengasuh'), async (req, res) => {
    try {
        const { tanggal_selesai, hasil_pembinaan, catatan } = req.body;

        const [pembinaan] = await db.query('SELECT id, pelanggaran_id, status FROM pembinaan WHERE id = ?', [req.params.id]);
        
        if (pembinaan.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pembinaan tidak ditemukan' 
            });
        }

        if (pembinaan[0].status === 'selesai') {
            return res.status(400).json({ 
                success: false, 
                message: 'Pembinaan sudah diselesaikan sebelumnya' 
            });
        }

        await db.query(
            `UPDATE pembinaan SET 
            status = ?, tanggal_selesai = ?, hasil_pembinaan = ?, catatan = ?
            WHERE id = ?`,
            ['selesai', tanggal_selesai || null, hasil_pembinaan || null, catatan || null, req.params.id]
        );

        // Update status pelanggaran menjadi selesai
        await db.query(
            'UPDATE pelanggaran SET status = ? WHERE id = ?',
            ['selesai', pembinaan[0].pelanggaran_id]
        );

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Selesaikan pembinaan', 'pembinaan', `Pembinaan ID: ${req.params.id}`]
        );

        res.json({
            success: true,
            message: 'Pembinaan berhasil diselesaikan'
        });

    } catch (error) {
        console.error('Selesai pembinaan error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Delete pembinaan
router.delete('/:id', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        await db.query('DELETE FROM pembinaan WHERE id = ?', [req.params.id]);

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Hapus pembinaan', 'pembinaan', `Pembinaan ID: ${req.params.id}`]
        );

        res.json({
            success: true,
            message: 'Pembinaan berhasil dihapus'
        });

    } catch (error) {
        console.error('Delete pembinaan error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

module.exports = router;
