const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get all perizinan
router.get('/', verifyToken, async (req, res) => {
    try {
        const { status, santri_id, tanggal_dari, tanggal_sampai } = req.query;
        
        let query = `
            SELECT p.*, 
                   s.nis, s.nama_lengkap as nama_santri,
                   ji.nama_izin, ji.warna,
                   u1.nama_lengkap as diajukan_oleh_nama,
                   u2.nama_lengkap as disetujui_oleh_nama
            FROM perizinan p
            INNER JOIN santri s ON p.santri_id = s.id
            INNER JOIN jenis_izin ji ON p.jenis_izin_id = ji.id
            LEFT JOIN users u1 ON p.diajukan_oleh = u1.id
            LEFT JOIN users u2 ON p.disetujui_oleh = u2.id
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

        if (tanggal_dari) {
            query += ' AND p.tanggal_izin >= ?';
            params.push(tanggal_dari);
        }

        if (tanggal_sampai) {
            query += ' AND p.tanggal_izin <= ?';
            params.push(tanggal_sampai);
        }

        query += ' ORDER BY p.created_at DESC';

        const [perizinan] = await db.query(query, params);

        res.json({
            success: true,
            data: perizinan
        });

    } catch (error) {
        console.error('Get perizinan error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Get perizinan by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [perizinan] = await db.query(`
            SELECT p.*, 
                   s.nis, s.nama_lengkap as nama_santri, s.alamat, s.nama_wali, s.no_hp_wali,
                   s.jenis_kelamin, s.nama_kamar, s.status as status_santri,
                   a.nama_asrama,
                   ji.nama_izin, ji.warna,
                   u1.nama_lengkap as diajukan_oleh_nama,
                   u2.nama_lengkap as disetujui_oleh_nama
            FROM perizinan p
            INNER JOIN santri s ON p.santri_id = s.id
            LEFT JOIN asrama a ON s.asrama_id = a.id
            INNER JOIN jenis_izin ji ON p.jenis_izin_id = ji.id
            LEFT JOIN users u1 ON p.diajukan_oleh = u1.id
            LEFT JOIN users u2 ON p.disetujui_oleh = u2.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (perizinan.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Perizinan tidak ditemukan' 
            });
        }

        res.json({
            success: true,
            data: perizinan[0]
        });

    } catch (error) {
        console.error('Get perizinan error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Create perizinan
router.post('/', verifyToken, checkRole('admin', 'ustadz', 'ustadzah'), async (req, res) => {
    try {
        const { 
            santri_id, jenis_izin_id, tanggal_izin, tanggal_kembali,
            jam_keluar, jam_kembali, tujuan, alasan, alamat_tujuan,
            nama_penjemput, no_hp_penjemput, keterangan
        } = req.body;

        // Validasi
        if (!santri_id || !jenis_izin_id || !tanggal_izin || !alasan) {
            return res.status(400).json({ 
                success: false, 
                message: 'Data tidak lengkap' 
            });
        }

        // Insert perizinan
        const [result] = await db.query(
            `INSERT INTO perizinan 
            (santri_id, jenis_izin_id, tanggal_izin, tanggal_kembali, jam_keluar, jam_kembali,
             tujuan, alasan, alamat_tujuan, nama_penjemput, no_hp_penjemput, diajukan_oleh, 
             status, keterangan) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [santri_id, jenis_izin_id, tanggal_izin || null, tanggal_kembali || null, jam_keluar || null, jam_kembali || null,
             tujuan || null, alasan, alamat_tujuan || null, nama_penjemput || null, no_hp_penjemput || null, req.user.id,
             'pending', keterangan || null]
        );

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Tambah perizinan baru', 'perizinan', `Perizinan ID: ${result.insertId}`]
        );

        res.status(201).json({
            success: true,
            message: 'Perizinan berhasil diajukan',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('Create perizinan error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Update perizinan
router.put('/:id', verifyToken, checkRole('admin', 'ustadz', 'ustadzah'), async (req, res) => {
    try {
        const { 
            santri_id, jenis_izin_id, tanggal_izin, tanggal_kembali,
            jam_keluar, jam_kembali, tujuan, alasan, alamat_tujuan,
            nama_penjemput, no_hp_penjemput, keterangan
        } = req.body;

        // Validasi
        if (!jenis_izin_id || !tanggal_izin || !alasan) {
            return res.status(400).json({ 
                success: false, 
                message: 'Data tidak lengkap' 
            });
        }

        // Cek perizinan exists
        const [perizinan] = await db.query('SELECT id, status FROM perizinan WHERE id = ?', [req.params.id]);
        if (perizinan.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Perizinan tidak ditemukan' 
            });
        }

        // Update perizinan
        await db.query(
            `UPDATE perizinan SET 
            jenis_izin_id = ?, tanggal_izin = ?, tanggal_kembali = ?, jam_keluar = ?, jam_kembali = ?,
            tujuan = ?, alasan = ?, alamat_tujuan = ?, nama_penjemput = ?, no_hp_penjemput = ?, keterangan = ?
            WHERE id = ?`,
            [jenis_izin_id, tanggal_izin || null, tanggal_kembali || null, jam_keluar || null, jam_kembali || null,
             tujuan || null, alasan, alamat_tujuan || null, nama_penjemput || null, no_hp_penjemput || null, keterangan || null, req.params.id]
        );

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Edit perizinan', 'perizinan', `Perizinan ID: ${req.params.id}`]
        );

        res.json({
            success: true,
            message: 'Perizinan berhasil diperbarui'
        });

    } catch (error) {
        console.error('Update perizinan error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Approve/Reject perizinan
router.put('/:id/approval', verifyToken, checkRole('admin', 'pengasuh', 'ustadz', 'ustadzah'), async (req, res) => {
    let connection;
    try {
        const { status, catatan_persetujuan } = req.body;

        if (!['disetujui', 'ditolak'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Status tidak valid' 
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Lock the request while assigning its annual letter number.
        const [perizinan] = await connection.query(
            'SELECT id, status FROM perizinan WHERE id = ? FOR UPDATE',
            [req.params.id]
        );
        if (perizinan.length === 0) {
            await connection.rollback();
            return res.status(404).json({ 
                success: false, 
                message: 'Perizinan tidak ditemukan' 
            });
        }

        if (perizinan[0].status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({ 
                success: false, 
                message: 'Perizinan sudah diproses sebelumnya' 
            });
        }

        let nomorSurat = null;
        if (status === 'disetujui') {
            const [[tanggalSurat]] = await connection.query(
                'SELECT YEAR(CURRENT_DATE()) AS tahun, MONTH(CURRENT_DATE()) AS bulan'
            );
            await connection.query(
                `INSERT INTO nomor_surat_counter (tahun, nomor_terakhir)
                 VALUES (?, LAST_INSERT_ID(1))
                 ON DUPLICATE KEY UPDATE nomor_terakhir = LAST_INSERT_ID(nomor_terakhir + 1)`,
                [tanggalSurat.tahun]
            );
            const [[counter]] = await connection.query('SELECT LAST_INSERT_ID() AS nomor_urut');
            const bulanRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
            nomorSurat = `${String(counter.nomor_urut).padStart(3, '0')}/SPS/MAA/${bulanRomawi[tanggalSurat.bulan - 1]}/${tanggalSurat.tahun}`;
        }

        await connection.query(
            `UPDATE perizinan SET
            status = ?, disetujui_oleh = ?, tanggal_disetujui = NOW(),
            catatan_persetujuan = ?, nomor_surat = ?
            WHERE id = ?`,
            [status, req.user.id, catatan_persetujuan || null, nomorSurat, req.params.id]
        );

        // Log aktivitas
        await connection.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, `${status === 'disetujui' ? 'Menyetujui' : 'Menolak'} perizinan`, 'perizinan', `Perizinan ID: ${req.params.id}${nomorSurat ? `, Nomor: ${nomorSurat}` : ''}`]
        );

        await connection.commit();

        res.json({
            success: true,
            message: `Perizinan berhasil ${status === 'disetujui' ? 'disetujui' : 'ditolak'}`,
            data: { nomor_surat: nomorSurat }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Approval perizinan error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    } finally {
        connection?.release();
    }
});

// Delete perizinan
router.delete('/:id', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        await db.query('DELETE FROM perizinan WHERE id = ?', [req.params.id]);

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Hapus perizinan', 'perizinan', `Perizinan ID: ${req.params.id}`]
        );

        res.json({
            success: true,
            message: 'Perizinan berhasil dihapus'
        });

    } catch (error) {
        console.error('Delete perizinan error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

module.exports = router;
