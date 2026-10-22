// API Configuration
const getApiBaseUrl = () => {
    if (typeof window === 'undefined') {
        return 'http://localhost:3000/api';
    }

    if (window.location.protocol.startsWith('http')) {
        return `${window.location.origin}/api`;
    }

    return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

const API_ENDPOINTS = {
    // Auth
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    
    // Users
    USERS: `${API_BASE_URL}/users`,
    
    // Santri
    SANTRI: `${API_BASE_URL}/santri`,
    
    // Perizinan
    PERIZINAN: `${API_BASE_URL}/perizinan`,
    PERIZINAN_APPROVAL: (id) => `${API_BASE_URL}/perizinan/${id}/approval`,
    
    // Pelanggaran
    PELANGGARAN: `${API_BASE_URL}/pelanggaran`,
    PELANGGARAN_STATUS: (id) => `${API_BASE_URL}/pelanggaran/${id}/status`,
    PELANGGARAN_REKAP: (santriId) => `${API_BASE_URL}/pelanggaran/rekap/santri/${santriId}`,
    
    // Pembinaan
    PEMBINAAN: `${API_BASE_URL}/pembinaan`,
    PEMBINAAN_SELESAI: (id) => `${API_BASE_URL}/pembinaan/${id}/selesai`,
    
    // Dashboard
    DASHBOARD_STATS: `${API_BASE_URL}/dashboard/stats`
};

// Storage Keys
const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'user_data'
};

// Helper Functions
const getToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN);
const getUser = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
const setToken = (token) => localStorage.setItem(STORAGE_KEYS.TOKEN, token);
const setUser = (user) => localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
const clearAuth = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
};

// Check if user is authenticated
const isAuthenticated = () => {
    const token = getToken();
    return token !== null && token !== '';
};

// Redirect to login if not authenticated
const requireAuth = () => {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
};

// API Request Helper
const apiRequest = async (url, options = {}) => {
    const token = getToken();
    
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        // Handle unauthorized
        if (response.status === 401) {
            clearAuth();
            window.location.href = 'index.html';
            throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
        }

        if (response.status === 403) {
            window.location.replace(getFirstAccessiblePage());
            throw new Error(data.message || 'Akses ditolak');
        }
        
        if (!response.ok) {
            throw new Error(data.message || 'Terjadi kesalahan pada server');
        }
        
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

// Format Time
const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5); // HH:MM
};

// Get Status Badge Class
const getStatusBadgeClass = (status) => {
    const statusMap = {
        'pending': 'badge-pending',
        'disetujui': 'badge-disetujui',
        'ditolak': 'badge-ditolak',
        'selesai': 'badge-selesai',
        'tercatat': 'badge-tercatat',
        'dalam_pembinaan': 'badge-dalam_pembinaan',
        'proses': 'badge-proses',
        'aktif': 'badge-disetujui',
        'nonaktif': 'badge-ditolak'
    };
    return statusMap[status] || 'bg-secondary';
};

// Get Kategori Badge Class
const getKategoriBadgeClass = (kategori) => {
    const kategoriMap = {
        'ringan': 'badge-ringan',
        'sedang': 'badge-sedang',
        'berat': 'badge-berat'
    };
    return kategoriMap[kategori] || 'bg-secondary';
};

// Status Labels (Indonesian)
const STATUS_LABELS = {
    'pending': 'Pending',
    'disetujui': 'Disetujui',
    'ditolak': 'Ditolak',
    'selesai': 'Selesai',
    'tercatat': 'Tercatat',
    'dalam_pembinaan': 'Dalam Pembinaan',
    'proses': 'Proses',
    'aktif': 'Aktif',
    'nonaktif': 'Non-aktif'
};

// Role Labels
const ROLE_LABELS = {
    'admin': 'Administrator',
    'pengasuh': 'Pengasuh Pesantren',
    'ustadz': 'Ustadz',
    'ustadzah': 'Ustadzah'
};

const MENU_ACCESS_BY_ROLE = {
    admin: ['dashboard', 'santri', 'perizinan', 'pelanggaran', 'pembinaan', 'manajemen-asrama', 'users'],
    pengasuh: ['dashboard', 'santri', 'perizinan', 'pelanggaran', 'pembinaan'],
    ustadz: ['dashboard', 'perizinan', 'pelanggaran', 'pembinaan'],
    ustadzah: ['dashboard', 'perizinan', 'pelanggaran', 'pembinaan']
};

const getMenuAccess = () => {
    const user = getUser();
    return Array.isArray(user.akses_menu) ? user.akses_menu : (MENU_ACCESS_BY_ROLE[user.role] || []);
};

const hasMenuAccess = (menu) => getMenuAccess().includes(menu);

const MENU_PAGE_PATHS = {
    dashboard: 'dashboard.html',
    santri: 'santri.html',
    perizinan: 'perizinan.html',
    pelanggaran: 'pelanggaran.html',
    pembinaan: 'pembinaan.html',
    'manajemen-asrama': 'manajemen-asrama.html',
    users: 'users.html'
};

const getFirstAccessiblePage = () => Object.entries(MENU_PAGE_PATHS)
    .find(([menu]) => hasMenuAccess(menu))?.[1] || 'index.html';

const requireMenuAccess = (menu) => {
    if (hasMenuAccess(menu)) return true;

    window.location.replace(getFirstAccessiblePage());
    return false;
};

// Role Icon
const getRoleIcon = (role) => {
    const iconMap = {
        'admin': 'fa-user-shield',
        'pengasuh': 'fa-user-tie',
        'ustadz': 'fa-user-graduate',
        'ustadzah': 'fa-user-graduate'
    };
    return iconMap[role] || 'fa-user';
};
