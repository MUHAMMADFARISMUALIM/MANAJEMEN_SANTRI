// Script untuk modifikasi tabel santri: tambah field nama_kamar dan hapus no_hp
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixKamarNoHP() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sistem_santri'
        });

        console.log('✓ Terhubung ke database');

        // 1. Cek dan tambah kolom nama_kamar jika belum ada
        console.log('\n1. Menambahkan kolom nama_kamar...');
        try {
            await connection.query(`
                ALTER TABLE santri 
                ADD COLUMN nama_kamar VARCHAR(50) NULL AFTER kamar_id
            `);
            console.log('✓ Kolom nama_kamar berhasil ditambahkan');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠ Kolom nama_kamar sudah ada, skip');
            } else {
                throw err;
            }
        }

        // 2. Cek dan hapus kolom no_hp jika ada
        console.log('\n2. Menghapus kolom no_hp santri...');
        try {
            await connection.query(`
                ALTER TABLE santri 
                DROP COLUMN no_hp
            `);
            console.log('✓ Kolom no_hp berhasil dihapus');
        } catch (err) {
            if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log('⚠ Kolom no_hp sudah tidak ada, skip');
            } else {
                throw err;
            }
        }

        console.log('\n✅ SELESAI! Struktur tabel santri berhasil diupdate.');
        console.log('Sekarang kamar bisa diinput manual dan kolom no_hp sudah dihilangkan!');

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixKamarNoHP();
