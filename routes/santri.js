const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all santri
router.get('/', verifyToken, async (req, res) => {
    try {
        const { status, asrama_id, jenis_kelamin, search } = req.query;
        
        let query = `
            SELECT s.*, 
                   a.nama_asrama
            FROM santri s
            LEFT JOIN asrama a ON s.asrama_id = a.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND s.status = ?';
            params.push(status);
        }

        if (asrama_id) {
            query += ' AND s.asrama_id = ?';
            params.push(asrama_id);
        }

        if (jenis_kelamin) {
            query += ' AND s.jenis_kelamin = ?';
            params.push(jenis_kelamin);
        }

        if (search) {
            query += ' AND (s.nama_lengkap LIKE ? OR s.nis LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY s.nama_lengkap ASC';

        const [santri] = await db.query(query, params);

        res.json({
            success: true,
            data: santri
        });

    } catch (error) {
        console.error('Get santri error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Get santri by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [santri] = await db.query(`
            SELECT s.*, 
                   a.nama_asrama
            FROM santri s
            LEFT JOIN asrama a ON s.asrama_id = a.id
            WHERE s.id = ?
        `, [req.params.id]);

        if (santri.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Santri tidak ditemukan' 
            });
        }

        res.json({
            success: true,
            data: santri[0]
        });

    } catch (error) {
        console.error('Get santri error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Create santri
router.post('/', verifyToken, checkRole('admin', 'ustadz', 'ustadzah', 'pengasuh'), upload.single('foto'), async (req, res) => {
    try {
        const { 
            nis, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir,
            alamat, asrama_id, kamar, nama_wali, no_hp_wali, 
            alamat_wali, tanggal_masuk, status 
        } = req.body;

        // Validasi
        if (!nis || !nama_lengkap || !jenis_kelamin) {
            return res.status(400).json({ 
                success: false, 
                message: 'Data tidak lengkap' 
            });
        }

        // Cek NIS sudah ada
        const [existing] = await db.query('SELECT id FROM santri WHERE nis = ?', [nis]);
        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'NIS sudah terdaftar' 
            });
        }

        const foto = req.file ? req.file.filename : null;

        // Insert santri (dengan nama_kamar)
        const [result] = await db.query(
            `INSERT INTO santri 
            (nis, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, 
             asrama_id, nama_kamar, nama_wali, no_hp_wali, alamat_wali, foto, 
             tanggal_masuk, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nis, 
                nama_lengkap, 
                jenis_kelamin, 
                tempat_lahir || null, 
                tanggal_lahir || null,
                alamat || null, 
                asrama_id || null,
                kamar || null,  // nama_kamar dari input
                nama_wali || null, 
                no_hp_wali || null, 
                alamat_wali || null, 
                foto, 
                tanggal_masuk || null,
                status || 'aktif'
            ]
        );

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Tambah santri baru', 'santri', `Santri: ${nama_lengkap}`]
        );

        res.status(201).json({
            success: true,
            message: 'Santri berhasil ditambahkan',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('Create santri error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        });
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server: ' + error.message
        });
    }
});

// Update santri
router.put('/:id', verifyToken, checkRole('admin', 'ustadz', 'ustadzah'), upload.single('foto'), async (req, res) => {
    try {
        const { 
            nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir,
            alamat, asrama_id, kamar, nama_wali, no_hp_wali, 
            alamat_wali, tanggal_masuk, status 
        } = req.body;

        // Cek santri exists
        const [santri] = await db.query('SELECT id, foto FROM santri WHERE id = ?', [req.params.id]);
        if (santri.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Santri tidak ditemukan' 
            });
        }

        const foto = req.file ? req.file.filename : santri[0].foto;

        // Update santri (dengan nama_kamar)
        await db.query(
            `UPDATE santri SET 
            nama_lengkap = ?, jenis_kelamin = ?, tempat_lahir = ?, tanggal_lahir = ?,
            alamat = ?, asrama_id = ?, nama_kamar = ?, nama_wali = ?,
            no_hp_wali = ?, alamat_wali = ?, foto = ?, tanggal_masuk = ?, status = ?
            WHERE id = ?`,
            [
                nama_lengkap, 
                jenis_kelamin, 
                tempat_lahir || null, 
                tanggal_lahir || null,
                alamat || null,
                asrama_id || null,
                kamar || null,
                nama_wali || null, 
                no_hp_wali || null,
                alamat_wali || null, 
                foto,
                tanggal_masuk || null,
                status, 
                req.params.id
            ]
        );

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Update santri', 'santri', `Santri ID: ${req.params.id}`]
        );

        res.json({
            success: true,
            message: 'Santri berhasil diupdate'
        });

    } catch (error) {
        console.error('Update santri error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        });
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server: ' + error.message
        });
    }
});

// Delete santri
router.delete('/:id', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const [santri] = await db.query('SELECT id, nama_lengkap FROM santri WHERE id = ?', [req.params.id]);
        if (santri.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Santri tidak ditemukan' 
            });
        }

        await db.query('DELETE FROM santri WHERE id = ?', [req.params.id]);

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Hapus santri', 'santri', `Santri: ${santri[0].nama_lengkap}`]
        );

        res.json({
            success: true,
            message: 'Santri berhasil dihapus'
        });

    } catch (error) {
        console.error('Delete santri error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

module.exports = router;
