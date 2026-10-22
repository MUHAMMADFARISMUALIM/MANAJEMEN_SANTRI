requireMenuAccess('dashboard');

// Load Dashboard Data
const loadDashboardStats = async () => {
    try {
        const data = await apiRequest(API_ENDPOINTS.DASHBOARD_STATS);
        
        if (data.success) {
            const stats = data.data;
            
            // Update stats cards
            document.getElementById('statTotalSantri').textContent = formatNumber(stats.summary.total_santri);
            document.getElementById('statPerizinanPending').textContent = formatNumber(stats.summary.perizinan_pending);
            document.getElementById('statPelanggaranBulanIni').textContent = formatNumber(stats.summary.pelanggaran_bulan_ini);
            document.getElementById('statPembinaanProses').textContent = formatNumber(stats.summary.pembinaan_proses);
            
            // Load tables
            loadPerizinanTerbaru(stats.perizinan_terbaru);
            loadPelanggaranTerbaru(stats.pelanggaran_terbaru);
            // Chart dan Santri Pelanggar dihapus dari dashboard yang disederhanakan
            // loadPelanggaranKategori(stats.pelanggaran_per_kategori);
            // loadSantriPelanggar(stats.santri_pelanggar_terbanyak);
        }
    } catch (error) {
        console.error('Load dashboard error:', error);
        showAlert('Gagal memuat data dashboard: ' + error.message, 'danger', 'alertBox');
    }
};

// Load Perizinan Terbaru
const loadPerizinanTerbaru = (data) => {
    const tbody = document.getElementById('tablePerizinanTerbaru');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Tidak ada data</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => `
        <tr>
            <td>
                <strong>${item.nama_santri}</strong><br>
                <small class="text-muted">${item.nis}</small>
            </td>
            <td>${item.nama_izin}</td>
            <td>${formatDateShort(item.tanggal_izin)}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(item.status)}">
                    ${STATUS_LABELS[item.status]}
                </span>
            </td>
        </tr>
    `).join('');
};

// Load Pelanggaran Terbaru
const loadPelanggaranTerbaru = (data) => {
    const tbody = document.getElementById('tablePelanggaranTerbaru');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Tidak ada data</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => `
        <tr>
            <td>
                <strong>${item.nama_santri}</strong><br>
                <small class="text-muted">${item.nis}</small>
            </td>
            <td>${item.nama_pelanggaran}</td>
            <td>
                <span class="badge ${getKategoriBadgeClass(item.kategori)}">
                    ${item.kategori}
                </span>
            </td>
            <td>${formatDateShort(item.tanggal_pelanggaran)}</td>
        </tr>
    `).join('');
};

// Load Pelanggaran per Kategori (Chart)
const loadPelanggaranKategori = (data) => {
    const container = document.getElementById('chartPelanggaranKategori');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="text-center text-muted">Tidak ada data pelanggaran bulan ini</div>';
        return;
    }
    
    // Calculate total
    const total = data.reduce((sum, item) => sum + item.total, 0);
    
    // Generate chart
    const chartHTML = data.map(item => {
        const percentage = total > 0 ? (item.total / total * 100) : 0;
        return `
            <div class="chart-item">
                <div class="chart-label">
                    <span><strong>${item.kategori}</strong></span>
                    <span>${item.total} (${percentage.toFixed(1)}%)</span>
                </div>
                <div class="chart-bar">
                    <div class="chart-fill ${item.kategori}" style="width: ${percentage}%">
                        ${item.total}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = chartHTML;
};

// Load Santri Pelanggar Terbanyak
const loadSantriPelanggar = (data) => {
    const tbody = document.getElementById('tableSantriPelanggar');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Tidak ada data</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.nis}</td>
            <td><strong>${item.nama_lengkap}</strong></td>
            <td><span class="badge bg-danger">${item.total_pelanggaran}</span></td>
            <td><span class="badge bg-warning text-dark">${item.total_poin}</span></td>
        </tr>
    `).join('');
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    
    // Auto refresh every 60 seconds
    setInterval(loadDashboardStats, 60000);
});
