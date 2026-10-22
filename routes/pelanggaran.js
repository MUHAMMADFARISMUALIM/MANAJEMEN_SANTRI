const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all pelanggaran
router.get('/', verifyToken, async (req, res) => {
    try {
        const { status, santri_id, kategori, tanggal_dari, tanggal_sampai } = req.query;
        
        let query = `
            SELECT p.*, 
                   s.nis, s.nama_lengkap as nama_santri, s.nama_kamar,
                   a.nama_asrama,
                   jp.kode_pelanggaran, jp.nama_pelanggaran, jp.kategori, jp.poin,
                   u.nama_lengkap as dilaporkan_oleh_nama
            FROM pelanggaran p
            INNER JOIN santri s ON p.santri_id = s.id
            LEFT JOIN asrama a ON s.asrama_id = a.id
            INNER JOIN jenis_pelanggaran jp ON p.jenis_pelanggaran_id = jp.id
            INNER JOIN users u ON p.dilaporkan_oleh = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND p.status = ?';
            params.push(status);
        }

        if (santri_id) {
            query += ' AND p.santri_id = ?';
            params.push(santri_id);
        }

        if (kategori) {
            query += ' AND jp.kategori = ?';
            params.push(kategori);
        }

        if (tanggal_dari) {
            query += ' AND p.tanggal_pelanggaran >= ?';
            params.push(tanggal_dari);
        }

        if (tanggal_sampai) {
            query += ' AND p.tanggal_pelanggaran <= ?';
            params.push(tanggal_sampai);
        }

        query += ' ORDER BY p.created_at DESC';

        const [pelanggaran] = await db.query(query, params);

        res.json({
            success: true,
            data: pelanggaran
        });

    } catch (error) {
        console.error('Get pelanggaran error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Get pelanggaran by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [pelanggaran] = await db.query(`
            SELECT p.*, 
                   s.nis, s.nama_lengkap as nama_santri, s.asrama_id,
                   s.jenis_kelamin, s.nama_kamar, s.status as status_santri,
                   a.nama_asrama,
                   jp.kode_pelanggaran, jp.nama_pelanggaran, jp.kategori, jp.poin, jp.sanksi,
                   u.nama_lengkap as dilaporkan_oleh_nama
            FROM pelanggaran p
            INNER JOIN santri s ON p.santri_id = s.id
            LEFT JOIN asrama a ON s.asrama_id = a.id
            INNER JOIN jenis_pelanggaran jp ON p.jenis_pelanggaran_id = jp.id
            INNER JOIN users u ON p.dilaporkan_oleh = u.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (pelanggaran.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pelanggaran tidak ditemukan' 
            });
        }

        res.json({
            success: true,
            data: pelanggaran[0]
        });

    } catch (error) {
        console.error('Get pelanggaran error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Create pelanggaran
router.post('/', verifyToken, checkRole('admin', 'ustadz', 'ustadzah'), upload.single('bukti'), async (req, res) => {
    try {
        const { 
            santri_id, jenis_pelanggaran_id, tanggal_pelanggaran, waktu_pelanggaran,
            tempat_kejadian, kronologi, saksi, catatan
        } = req.body;

        // Validasi
        if (!santri_id || !jenis_pelanggaran_id || !tanggal_pelanggaran || !kronologi) {
            return res.status(400).json({ 
                success: false, 
                message: 'Data tidak lengkap' 
            });
        }

        const bukti = req.file ? req.file.filename : null;

        // Insert pelanggaran
        const [result] = await db.query(
            `INSERT INTO pelanggaran 
            (santri_id, jenis_pelanggaran_id, tanggal_pelanggaran, waktu_pelanggaran,
             tempat_kejadian, kronologi, bukti, saksi, dilaporkan_oleh, status, catatan) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [santri_id, jenis_pelanggaran_id, tanggal_pelanggaran || null, waktu_pelanggaran || null,
             tempat_kejadian || null, kronologi, bukti, saksi || null, req.user.id, 'tercatat', catatan || null]
        );

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Catat pelanggaran baru', 'pelanggaran', `Pelanggaran ID: ${result.insertId}`]
        );

        res.status(201).json({
            success: true,
            message: 'Pelanggaran berhasil dicatat',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('Create pelanggaran error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Update pelanggaran
router.put('/:id', verifyToken, checkRole('admin', 'ustadz', 'ustadzah'), async (req, res) => {
    try {
        const { 
            jenis_pelanggaran_id, tanggal_pelanggaran, waktu_pelanggaran,
            tempat_kejadian, kronologi, saksi, catatan
        } = req.body;

        // Validasi
        if (!jenis_pelanggaran_id || !tanggal_pelanggaran || !kronologi) {
            return res.status(400).json({ 
                success: false, 
                message: 'Data tidak lengkap' 
            });
        }

        // Cek pelanggaran exists
        const [pelanggaran] = await db.query('SELECT id FROM pelanggaran WHERE id = ?', [req.params.id]);
        if (pelanggaran.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pelanggaran tidak ditemukan' 
            });
        }

        // Update pelanggaran
        await db.query(
            `UPDATE pelanggaran SET 
            jenis_pelanggaran_id = ?, tanggal_pelanggaran = ?, waktu_pelanggaran = ?,
            tempat_kejadian = ?, kronologi = ?, saksi = ?, catatan = ?
            WHERE id = ?`,
            [jenis_pelanggaran_id, tanggal_pelanggaran || null, waktu_pelanggaran || null,
             tempat_kejadian || null, kronologi, saksi || null, catatan || null, req.params.id]
        );

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Edit pelanggaran', 'pelanggaran', `Pelanggaran ID: ${req.params.id}`]
        );

        res.json({
            success: true,
            message: 'Pelanggaran berhasil diperbarui'
        });

    } catch (error) {
        console.error('Update pelanggaran error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Update status pelanggaran
router.put('/:id/status', verifyToken, checkRole('admin', 'ustadz', 'ustadzah', 'pengasuh'), async (req, res) => {
    try {
        const { status, catatan } = req.body;

        if (!['tercatat', 'dalam_pembinaan', 'selesai'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Status tidak valid' 
            });
        }

        const [pelanggaran] = await db.query('SELECT id FROM pelanggaran WHERE id = ?', [req.params.id]);
        if (pelanggaran.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pelanggaran tidak ditemukan' 
            });
        }

        await db.query(
            'UPDATE pelanggaran SET status = ?, catatan = ? WHERE id = ?',
            [status, catatan, req.params.id]
        );

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Update status pelanggaran', 'pelanggaran', `Pelanggaran ID: ${req.params.id} => ${status}`]
        );

        res.json({
            success: true,
            message: 'Status pelanggaran berhasil diupdate'
        });

    } catch (error) {
        console.error('Update status pelanggaran error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Get rekap pelanggaran per santri
router.get('/rekap/santri/:santri_id', verifyToken, async (req, res) => {
    try {
        const [rekap] = await db.query(`
            SELECT 
                COUNT(*) as total_pelanggaran,
                SUM(jp.poin) as total_poin,
                SUM(CASE WHEN jp.kategori = 'ringan' THEN 1 ELSE 0 END) as pelanggaran_ringan,
                SUM(CASE WHEN jp.kategori = 'sedang' THEN 1 ELSE 0 END) as pelanggaran_sedang,
                SUM(CASE WHEN jp.kategori = 'berat' THEN 1 ELSE 0 END) as pelanggaran_berat
            FROM pelanggaran p
            INNER JOIN jenis_pelanggaran jp ON p.jenis_pelanggaran_id = jp.id
            WHERE p.santri_id = ?
        `, [req.params.santri_id]);

        res.json({
            success: true,
            data: rekap[0]
        });

    } catch (error) {
        console.error('Get rekap pelanggaran error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Delete pelanggaran
router.delete('/:id', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        await db.query('DELETE FROM pelanggaran WHERE id = ?', [req.params.id]);

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Hapus pelanggaran', 'pelanggaran', `Pelanggaran ID: ${req.params.id}`]
        );

        res.json({
            success: true,
            message: 'Pelanggaran berhasil dihapus'
        });

    } catch (error) {
        console.error('Delete pelanggaran error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

module.exports = router;
