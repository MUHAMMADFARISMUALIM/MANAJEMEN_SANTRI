// Script untuk insert data asrama
const mysql = require('mysql2/promise');
require('dotenv').config();

async function insertAsrama() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sistem_santri'
        });

        console.log('✓ Terhubung ke database');

        // Insert data asrama
        const asramaData = [
            { id: 1, nama: 'Asrama Putra 1', jenis: 'putra', kapasitas: 50, alamat: 'Gedung A' },
            { id: 2, nama: 'Asrama Putra 2', jenis: 'putra', kapasitas: 50, alamat: 'Gedung B' },
            { id: 3, nama: 'Asrama Putri 1', jenis: 'putri', kapasitas: 50, alamat: 'Gedung C' },
            { id: 4, nama: 'Asrama Putri 2', jenis: 'putri', kapasitas: 50, alamat: 'Gedung D' }
        ];

        for (const asrama of asramaData) {
            // Cek apakah sudah ada
            const [existing] = await connection.query('SELECT id FROM asrama WHERE id = ?', [asrama.id]);
            
            if (existing.length === 0) {
                await connection.query(
                    'INSERT INTO asrama (id, nama_asrama, jenis, kapasitas, alamat, status) VALUES (?, ?, ?, ?, ?, ?)',
                    [asrama.id, asrama.nama, asrama.jenis, asrama.kapasitas, asrama.alamat, 'aktif']
                );
                console.log(`✓ ${asrama.nama} berhasil ditambahkan`);
            } else {
                console.log(`⚠ ${asrama.nama} sudah ada, skip`);
            }
        }

        console.log('\n✅ SELESAI! Data asrama berhasil ditambahkan.');
        console.log('Sekarang coba edit santri lagi!');

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

insertAsrama();
