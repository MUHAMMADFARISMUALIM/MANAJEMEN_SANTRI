const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');
const { verifyToken } = require('../middleware/auth');
const { normalizeMenuAccess } = require('../middleware/menu-access');

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username dan password harus diisi' 
            });
        }

        // Cari user berdasarkan username
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ? AND status = ?',
            [username, 'aktif']
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Username atau password salah' 
            });
        }

        const user = users[0];

        // Verifikasi password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Username atau password salah' 
            });
        }

        const aksesMenu = normalizeMenuAccess(user.akses_menu, user.role);

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role,
                nama_lengkap: user.nama_lengkap,
                akses_menu: aksesMenu
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul) VALUES (?, ?, ?)',
            [user.id, 'Login berhasil', 'auth']
        );

        // Hapus password dari response
        delete user.password;
        user.akses_menu = aksesMenu;

        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                token,
                user
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Get profile user yang sedang login
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, nama_lengkap, email, role, jenis_kelamin, no_hp, foto, status, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Logout (opsional - di sisi client hapus token)
router.post('/logout', verifyToken, async (req, res) => {
    try {
        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul) VALUES (?, ?, ?)',
            [req.user.id, 'Logout', 'auth']
        );

        res.json({
            success: true,
            message: 'Logout berhasil'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

// Change password
router.post('/change-password', verifyToken, async (req, res) => {
    try {
        const { old_password, new_password, confirm_password } = req.body;

        if (!old_password || !new_password || !confirm_password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Semua field password harus diisi' 
            });
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password baru dan konfirmasi password tidak cocok' 
            });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password baru minimal 6 karakter' 
            });
        }

        // Get user
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        // Verifikasi password lama
        const isValidPassword = await bcrypt.compare(old_password, users[0].password);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Password lama tidak sesuai' 
            });
        }

        // Hash password baru
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password
        await db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        // Log aktivitas
        await db.query(
            'INSERT INTO activity_log (user_id, aktivitas, modul) VALUES (?, ?, ?)',
            [req.user.id, 'Ganti password', 'auth']
        );

        res.json({
            success: true,
            message: 'Password berhasil diubah'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server' 
        });
    }
});

module.exports = router;
