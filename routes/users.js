const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/connection');
const { verifyToken, checkRole } = require('../middleware/auth');
const { normalizeMenuAccess } = require('../middleware/menu-access');

// Get all users (hanya admin)
router.get('/', verifyToken, async (req, res) => {
    try {
        const { role, status } = req.query;
        
        let query = 'SELECT id, username, nama_lengkap, email, role, jenis_kelamin, no_hp, foto, status, akses_menu, created_at FROM users WHERE 1=1';
        const params = [];

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const [users] = await db.query(query, params);

        res.json({
            success: true,
            data: users.map(user => ({
                ...user,
                akses_menu: normalizeMenuAccess(user.akses_menu, user.role)
            }))
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Get user by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, nama_lengkap, email, role, jenis_kelamin, no_hp, foto, status, akses_menu, created_at FROM users WHERE id = ?',
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        res.json({
            success: true,
            data: {
                ...users[0],
                akses_menu: normalizeMenuAccess(users[0].akses_menu, users[0].role)
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Create new user (hanya admin)
router.post('/', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const { username, password, nama_lengkap, email, role, jenis_kelamin, no_hp, akses_menu } = req.body;

        // Validasi
        if (!username || !password || !nama_lengkap || !role || !jenis_kelamin) {
            return res.status(400).json({ 
                success: false, 
                message: 'Data tidak lengkap' 
            });
        }

        if (akses_menu !== undefined && !Array.isArray(akses_menu)) {
            return res.status(400).json({ success: false, message: 'Format akses menu tidak valid' });
        }

        const menuAccess = normalizeMenuAccess(akses_menu, role);
        if (menuAccess.length === 0) {
            return res.status(400).json({ success: false, message: 'Pilih minimal satu menu untuk user' });
        }

        // Cek username sudah ada
        const [existingUsers] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username sudah digunakan' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (username, password, nama_lengkap, email, role, jenis_kelamin, no_hp, akses_menu) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, nama_lengkap, email, role, jenis_kelamin, no_hp, JSON.stringify(menuAccess)]
        );

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Tambah user baru', 'users', `User: ${nama_lengkap}`]
        );

        res.status(201).json({
            success: true,
            message: 'User berhasil ditambahkan',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Update user (hanya admin)
router.put('/:id', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const { nama_lengkap, email, role, jenis_kelamin, no_hp, status, akses_menu } = req.body;

        // Cek user exists
        const [users] = await db.query('SELECT id, role, akses_menu FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        if (akses_menu !== undefined && !Array.isArray(akses_menu)) {
            return res.status(400).json({ success: false, message: 'Format akses menu tidak valid' });
        }

        const menuAccess = normalizeMenuAccess(
            akses_menu === undefined ? users[0].akses_menu : akses_menu,
            role || users[0].role
        );
        if (menuAccess.length === 0) {
            return res.status(400).json({ success: false, message: 'Pilih minimal satu menu untuk user' });
        }

        // Update user
        await db.query(
            'UPDATE users SET nama_lengkap = ?, email = ?, role = ?, jenis_kelamin = ?, no_hp = ?, status = ?, akses_menu = ? WHERE id = ?',
            [nama_lengkap, email, role, jenis_kelamin, no_hp, status, JSON.stringify(menuAccess), req.params.id]
        );

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Update user', 'users', `User ID: ${req.params.id}`]
        );

        res.json({
            success: true,
            message: 'User berhasil diupdate'
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Delete user (hanya admin)
router.delete('/:id', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        // Cek user exists
        const [users] = await db.query('SELECT id, nama_lengkap FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        // Tidak bisa hapus diri sendiri
        if (req.params.id == req.user.id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tidak dapat menghapus akun sendiri' 
            });
        }

        // Delete user
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Hapus user', 'users', `User: ${users[0].nama_lengkap}`]
        );

        res.json({
            success: true,
            message: 'User berhasil dihapus'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Reset password user (hanya admin)
router.post('/:id/reset-password', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const { new_password } = req.body;

        if (!new_password || new_password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password minimal 6 karakter' 
            });
        }

        // Cek user exists
        const [users] = await db.query('SELECT id, nama_lengkap FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.params.id]);

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul, keterangan) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Reset password user', 'users', `User: ${users[0].nama_lengkap}`]
        );

        res.json({
            success: true,
            message: 'Password berhasil direset'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

module.exports = router;
