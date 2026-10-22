// Script untuk inisialisasi data kamar di localStorage
// Jalankan sekali untuk setup data default

const defaultKamar = [
    { id: 1, nama: 'Umar', asrama_id: 1, jenis: 'putra', status: 'aktif' },
    { id: 2, nama: 'Usman', asrama_id: 1, jenis: 'putra', status: 'aktif' },
    { id: 3, nama: 'Abu Bakar', asrama_id: 2, jenis: 'putra', status: 'aktif' },
    { id: 4, nama: 'Ali', asrama_id: 2, jenis: 'putra', status: 'aktif' },
    { id: 5, nama: 'Aisyah', asrama_id: 3, jenis: 'putri', status: 'aktif' },
    { id: 6, nama: 'Khadijah', asrama_id: 3, jenis: 'putri', status: 'aktif' },
    { id: 7, nama: 'Fatimah', asrama_id: 4, jenis: 'putri', status: 'aktif' },
    { id: 8, nama: 'Hafshah', asrama_id: 4, jenis: 'putri', status: 'aktif' }
];

const defaultAsrama = [
    { id: 1, nama: 'Asrama Putra 1', jenis: 'putra', kapasitas: 50, alamat: 'Gedung A', status: 'aktif' },
    { id: 2, nama: 'Asrama Putra 2', jenis: 'putra', kapasitas: 50, alamat: 'Gedung B', status: 'aktif' },
    { id: 3, nama: 'Asrama Putri 1', jenis: 'putri', kapasitas: 50, alamat: 'Gedung C', status: 'aktif' },
    { id: 4, nama: 'Asrama Putri 2', jenis: 'putri', kapasitas: 50, alamat: 'Gedung D', status: 'aktif' }
];

console.log('Inisialisasi data kamar dan asrama...');

// Set ke localStorage
localStorage.setItem('dataKamar', JSON.stringify(defaultKamar));
localStorage.setItem('dataAsrama', JSON.stringify(defaultAsrama));

console.log('✅ Data berhasil diinisialisasi!');
console.log('Data Kamar:', defaultKamar);
console.log('Data Asrama:', defaultAsrama);
