// Script untuk fix password di database
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixPasswords() {
    try {
        // Connect ke database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sistem_santri'
        });

        console.log('✓ Terhubung ke database');

        // Hash password yang benar
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('✓ Password ter-hash:', hashedPassword);

        // Update semua user dengan password yang sama
        const users = [
            { username: 'admin', nama: 'Administrator', email: 'admin@pesantren.com', role: 'admin', jk: 'L' },
            { username: 'pengasuh', nama: 'KH. Ahmad Dahlan', email: 'pengasuh@pesantren.com', role: 'pengasuh', jk: 'L' },
            { username: 'ustadz1', nama: 'Ustadz Muhammad', email: 'ustadz@pesantren.com', role: 'ustadz', jk: 'L' },
            { username: 'ustadzah1', nama: 'Ustadzah Fatimah', email: 'ustadzah@pesantren.com', role: 'ustadzah', jk: 'P' }
        ];

        // Cek apakah user sudah ada
        const [existingUsers] = await connection.query('SELECT username FROM users');
        
        if (existingUsers.length === 0) {
            // Insert user baru
            console.log('\n📝 Insert user baru...');
            for (const user of users) {
                await connection.query(
                    `INSERT INTO users (username, password, nama_lengkap, email, role, jenis_kelamin, status) 
                     VALUES (?, ?, ?, ?, ?, ?, 'aktif')`,
                    [user.username, hashedPassword, user.nama, user.email, user.role, user.jk]
                );
                console.log(`✓ User ${user.username} berhasil ditambahkan`);
            }
        } else {
            // Update password existing users
            console.log('\n🔄 Update password existing users...');
            await connection.query('UPDATE users SET password = ?', [hashedPassword]);
            console.log('✓ Password semua user berhasil diupdate');
        }

        console.log('\n✅ SELESAI! Sekarang coba login dengan:');
        console.log('   Username: admin (atau pengasuh/ustadz1/ustadzah1)');
        console.log('   Password: password123');

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixPasswords();
