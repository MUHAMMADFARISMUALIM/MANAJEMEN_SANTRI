// Check authentication
requireAuth();

// Get current page
const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';

// Get user data
const user = getUser();

// Generate sidebar HTML
const sidebarHTML = `
<div class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <img src="logo-aziziyyah.png" alt="Logo MA Aziziyyah" class="sidebar-logo">
        <h4>Manajemen Asrama</h4>
        <p class="mb-0"><small>MA Aziziyyah</small></p>
        <p class="mb-0"><small>${ROLE_LABELS[user.role] || user.role}</small></p>
    </div>
    <div class="sidebar-menu">
        ${hasMenuAccess('dashboard') ? `
        <a href="dashboard.html" class="menu-item ${currentPage === 'dashboard.html' ? 'active' : ''}">
            <i class="fas fa-home"></i>Dashboard
        </a>
        ` : ''}
        ${hasMenuAccess('santri') ? `
        <a href="santri.html" class="menu-item ${currentPage === 'santri.html' ? 'active' : ''}">
            <i class="fas fa-users"></i>Data Santri
        </a>
        ` : ''}
        ${hasMenuAccess('perizinan') ? `<a href="perizinan.html" class="menu-item ${currentPage === 'perizinan.html' ? 'active' : ''}">
            <i class="fas fa-file-alt"></i>Perizinan
        </a>` : ''}
        ${hasMenuAccess('pelanggaran') ? `<a href="pelanggaran.html" class="menu-item ${currentPage === 'pelanggaran.html' ? 'active' : ''}">
            <i class="fas fa-exclamation-triangle"></i>Pelanggaran
        </a>` : ''}
        ${hasMenuAccess('pembinaan') ? `<a href="pembinaan.html" class="menu-item ${currentPage === 'pembinaan.html' ? 'active' : ''}">
            <i class="fas fa-user-check"></i>Pembinaan
        </a>` : ''}
        ${hasMenuAccess('manajemen-asrama') ? `
        <a href="manajemen-asrama.html" class="menu-item ${currentPage === 'manajemen-asrama.html' ? 'active' : ''}">
            <i class="fas fa-building"></i>Manajemen Asrama
        </a>
        ` : ''}
        ${hasMenuAccess('users') ? `
        <a href="users.html" class="menu-item ${currentPage === 'users.html' ? 'active' : ''}">
            <i class="fas fa-user-cog"></i>Manajemen User
        </a>
        ` : ''}
    </div>
</div>
`;

// Insert sidebar
document.getElementById('sidebar').outerHTML = sidebarHTML;

// Sidebar toggle
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mainContent = document.querySelector('.main-content');
const mobileViewport = window.matchMedia('(max-width: 768px)');

const closeMobileSidebar = () => {
    sidebar.classList.remove('show');
    document.body.classList.remove('sidebar-open');
    sidebarToggle?.setAttribute('aria-expanded', 'false');
};

sidebarToggle?.setAttribute('aria-label', 'Toggle navigasi');
sidebarToggle?.setAttribute('aria-expanded', 'false');
sidebarToggle?.addEventListener('click', () => {
    if (mobileViewport.matches) {
        const isOpen = sidebar.classList.toggle('show');
        document.body.classList.toggle('sidebar-open', isOpen);
        sidebarToggle.setAttribute('aria-expanded', String(isOpen));
        return;
    }

    const isCollapsed = sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded', isCollapsed);
    sidebarToggle.setAttribute('aria-expanded', String(!isCollapsed));
});

document.addEventListener('click', (event) => {
    if (!mobileViewport.matches || !sidebar.classList.contains('show')) return;
    if (sidebar.contains(event.target) || sidebarToggle?.contains(event.target)) return;
    closeMobileSidebar();
});

window.addEventListener('resize', () => {
    if (!mobileViewport.matches) closeMobileSidebar();
});

// Set user name in navbar
document.getElementById('userNameNav').textContent = user.nama_lengkap || 'User';

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    
    if (confirm('Apakah Anda yakin ingin logout?')) {
        try {
            // Call logout API
            await apiRequest(API_ENDPOINTS.LOGOUT, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear auth data and redirect
            clearAuth();
            window.location.href = 'index.html';
        }
    }
});
