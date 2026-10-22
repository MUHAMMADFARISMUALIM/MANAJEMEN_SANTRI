const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { verifyToken } = require('./middleware/auth');
const { requireMenuAccess } = require('./middleware/menu-access');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files untuk uploads dan public folder
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', verifyToken, requireMenuAccess('users'), require('./routes/users'));
app.use('/api/santri', verifyToken, requireMenuAccess('santri'), require('./routes/santri'));
app.use('/api/perizinan', verifyToken, requireMenuAccess('perizinan'), require('./routes/perizinan'));
app.use('/api/pelanggaran', verifyToken, requireMenuAccess('pelanggaran'), require('./routes/pelanggaran'));
app.use('/api/pembinaan', verifyToken, requireMenuAccess('pembinaan'), require('./routes/pembinaan'));
app.use('/api/dashboard', verifyToken, requireMenuAccess('dashboard'), require('./routes/dashboard'));

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'API Sistem Manajemen Asrama Pesantren',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            santri: '/api/santri',
            perizinan: '/api/perizinan',
            pelanggaran: '/api/pelanggaran',
            pembinaan: '/api/pembinaan',
            dashboard: '/api/dashboard'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Terjadi kesalahan pada server'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Server berjalan pada port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📚 Dokumentasi API: http://localhost:${PORT}\n`);
});
