requireMenuAccess('santri');

// Santri page variables
var santriCurrentPage = 1;
var allSantri = [];

// Load Data Santri
const loadSantri = async () => {
    try {
        const params = new URLSearchParams({
            search: document.getElementById('searchInput').value || '',
            status: document.getElementById('filterStatus').value || '',
            jenis_kelamin: document.getElementById('filterJK').value || '',
            asrama_id: document.getElementById('filterAsrama').value || ''
        });
        
        const data = await apiRequest(`${API_ENDPOINTS.SANTRI}?${params}`);
        
        if (data.success) {
            allSantri = data.data;
            
            // Client-side filter untuk kamar (exact match)
            const kamarFilter = document.getElementById('filterKamar').value;
            let filteredData = allSantri;
            
            if (kamarFilter) {
                filteredData = allSantri.filter(s => s.nama_kamar === kamarFilter);
            }
            
            renderTable(filteredData);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Load santri error:', error);
        document.getElementById('tableSantri').innerHTML = `
            <tr><td colspan="7" class="text-center text-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>${error.message}
            </td></tr>
        `;
    }
};

// Render Table
const renderTable = (data) => {
    const tbody = document.getElementById('tableSantri');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Tidak ada data santri</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.nis}</td>
            <td><strong>${item.nama_lengkap}</strong></td>
            <td>${item.jenis_kelamin === 'L' ? 'L' : 'P'}</td>
            <td>${item.nama_asrama || '-'}</td>
            <td>${item.nama_kamar || '-'}</td>
            <td><span class="badge ${getStatusBadgeClass(item.status)}">${STATUS_LABELS[item.status]}</span></td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewSantri(${item.id})" title="Lihat Detail">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="editSantri(${item.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteSantri(${item.id}, '${item.nama_lengkap}')" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
};

// Add/Edit Santri
document.getElementById('btnSave').addEventListener('click', async () => {
    const santriId = document.getElementById('santriId').value;
    const formData = {
        nis: document.getElementById('nis').value,
        nama_lengkap: document.getElementById('nama_lengkap').value,
        jenis_kelamin: document.getElementById('jenis_kelamin').value,
        tempat_lahir: document.getElementById('tempat_lahir').value,
        tanggal_lahir: document.getElementById('tanggal_lahir').value,
        alamat: document.getElementById('alamat').value,
        asrama_id: document.getElementById('asrama_id').value,
        kamar: document.getElementById('kamar').value,  // tambah field kamar
        nama_wali: document.getElementById('nama_wali').value,
        no_hp_wali: document.getElementById('no_hp_wali').value,
        alamat_wali: document.getElementById('alamat_wali').value,
        tanggal_masuk: document.getElementById('tanggal_masuk').value,
        status: document.getElementById('status').value
    };
    
    // Validasi
    if (!formData.nis || !formData.nama_lengkap || !formData.jenis_kelamin) {
        showAlert('Data tidak lengkap! NIS, Nama, dan Jenis Kelamin wajib diisi.', 'danger', 'alertContainer');
        return;
    }
    
    try {
        const btn = document.getElementById('btnSave');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Menyimpan...';
        
        const url = santriId ? `${API_ENDPOINTS.SANTRI}/${santriId}` : API_ENDPOINTS.SANTRI;
        const method = santriId ? 'PUT' : 'POST';
        
        const result = await apiRequest(url, {
            method: method,
            body: JSON.stringify(formData)
        });
        
        if (result.success) {
            showAlert(result.message, 'success', 'alertContainer');
            bootstrap.Modal.getInstance(document.getElementById('modalSantri')).hide();
            loadSantri();
            resetForm('formSantri');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showAlert(error.message, 'danger', 'alertContainer');
    } finally {
        const btn = document.getElementById('btnSave');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save me-2"></i>Simpan';
    }
});

// Edit Santri
const editSantri = async (id) => {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.SANTRI}/${id}`);
        
        if (data.success) {
            const santri = data.data;
            
            document.getElementById('modalTitle').textContent = 'Edit Santri';
            document.getElementById('santriId').value = santri.id;
            document.getElementById('nis').value = santri.nis;
            document.getElementById('nis').readOnly = true;
            document.getElementById('nama_lengkap').value = santri.nama_lengkap;
            document.getElementById('jenis_kelamin').value = santri.jenis_kelamin;
            document.getElementById('tempat_lahir').value = santri.tempat_lahir || '';
            document.getElementById('tanggal_lahir').value = formatDateForInput(santri.tanggal_lahir) || '';
            document.getElementById('alamat').value = santri.alamat || '';
            
            // Set asrama dan trigger change supaya kamar options terisi dulu
            const asramaSelect = document.getElementById('asrama_id');
            asramaSelect.value = santri.asrama_id || '';
            asramaSelect.dispatchEvent(new Event('change'));
            
            // Set kamar setelah options terisi
            document.getElementById('kamar').value = santri.nama_kamar || '';
            
            document.getElementById('nama_wali').value = santri.nama_wali || '';
            document.getElementById('no_hp_wali').value = santri.no_hp_wali || '';
            document.getElementById('alamat_wali').value = santri.alamat_wali || '';
            document.getElementById('tanggal_masuk').value = formatDateForInput(santri.tanggal_masuk) || '';
            document.getElementById('status').value = santri.status;
            
            new bootstrap.Modal(document.getElementById('modalSantri')).show();
        }
    } catch (error) {
        showAlert('Gagal memuat data santri: ' + error.message, 'danger', 'alertContainer');
    }
};

// Delete Santri
const deleteSantri = async (id, nama) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus santri "${nama}"?\nData yang terhapus tidak dapat dikembalikan.`)) {
        return;
    }
    
    try {
        const result = await apiRequest(`${API_ENDPOINTS.SANTRI}/${id}`, {
            method: 'DELETE'
        });
        
        if (result.success) {
            showAlert(result.message, 'success', 'alertContainer');
            loadSantri();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showAlert('Gagal menghapus santri: ' + error.message, 'danger', 'alertContainer');
    }
};

// View Santri Detail
const viewSantri = async (id) => {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.SANTRI}/${id}`);
        
        if (data.success) {
            const santri = data.data;
            
            // Set data
            document.getElementById('detailNisSantri').textContent = santri.nis || '-';
            document.getElementById('detailNamaSantriDetail').textContent = santri.nama_lengkap || '-';
            document.getElementById('detailJKSantri').textContent = santri.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan';
            document.getElementById('detailTempatLahir').textContent = santri.tempat_lahir || '-';
            document.getElementById('detailTanggalLahir').textContent = formatDate(santri.tanggal_lahir) || '-';
            document.getElementById('detailStatusSantriDetail').textContent = STATUS_LABELS[santri.status] || santri.status || '-';
            document.getElementById('detailAlamat').textContent = santri.alamat || '-';
            
            document.getElementById('detailAsamaDetail').textContent = santri.nama_asrama || '-';
            document.getElementById('detailKamarDetail').textContent = santri.nama_kamar || '-';
            document.getElementById('detailTanggalMasuk').textContent = formatDate(santri.tanggal_masuk) || '-';
            
            document.getElementById('detailNamaWali').textContent = santri.nama_wali || '-';
            document.getElementById('detailNoHPWali').textContent = santri.no_hp_wali || '-';
            document.getElementById('detailAlamatWali').textContent = santri.alamat_wali || '-';
            
            // Show modal
            new bootstrap.Modal(document.getElementById('modalDetailSantri')).show();
        }
    } catch (error) {
        showAlert('Gagal memuat detail santri: ' + error.message, 'danger', 'alertContainer');
    }
};

// Reset modal on close
document.getElementById('modalSantri').addEventListener('hidden.bs.modal', function () {
    document.getElementById('modalTitle').textContent = 'Tambah Santri';
    document.getElementById('santriId').value = '';
    document.getElementById('nis').readOnly = false;
    resetForm('formSantri');
});

// When modal is shown, trigger asrama change to populate kamar if editing
document.getElementById('modalSantri').addEventListener('show.bs.modal', function () {
    // Only trigger asrama change in ADD mode
    // In edit mode, asrama change is triggered inside editSantri() before modal opens
    const santriId = document.getElementById('santriId').value;
    if (!santriId) {
        const asramaId = document.getElementById('asrama_id').value;
        if (asramaId) {
            document.getElementById('asrama_id').dispatchEvent(new Event('change'));
        }
    }
});

// Dynamic Kamar based on Asrama
document.getElementById('asrama_id').addEventListener('change', function() {
    const asramaId = parseInt(this.value);
    const kamarSelect = document.getElementById('kamar');
    
    // Clear kamar options
    kamarSelect.innerHTML = '<option value="">Pilih Kamar</option>';
    
    if (!asramaId) return;
    
    // Get kamar from localStorage or use default
    const savedKamar = localStorage.getItem('dataKamar');
    let kamarData = [];
    
    if (savedKamar) {
        kamarData = JSON.parse(savedKamar);
    } else {
        // Default kamar dengan asrama_id
        kamarData = [
            { id: 1, nama: 'Umar', asrama_id: 1, jenis: 'putra', status: 'aktif' },
            { id: 2, nama: 'Usman', asrama_id: 1, jenis: 'putra', status: 'aktif' },
            { id: 3, nama: 'Abu Bakar', asrama_id: 2, jenis: 'putra', status: 'aktif' },
            { id: 4, nama: 'Ali', asrama_id: 2, jenis: 'putra', status: 'aktif' },
            { id: 5, nama: 'Aisyah', asrama_id: 3, jenis: 'putri', status: 'aktif' },
            { id: 6, nama: 'Khadijah', asrama_id: 3, jenis: 'putri', status: 'aktif' },
            { id: 7, nama: 'Fatimah', asrama_id: 4, jenis: 'putri', status: 'aktif' },
            { id: 8, nama: 'Hafshah', asrama_id: 4, jenis: 'putri', status: 'aktif' }
        ];
    }
    
    // Filter kamar berdasarkan asrama_id dan status aktif
    const filteredKamar = kamarData.filter(k => k.asrama_id === asramaId && k.status === 'aktif');
    
    if (filteredKamar.length === 0) {
        kamarSelect.innerHTML = '<option value="">Tidak ada kamar tersedia</option>';
        return;
    }
    
    // Add kamar options
    filteredKamar.forEach(kamar => {
        const option = document.createElement('option');
        option.value = kamar.nama;
        option.textContent = kamar.nama;
        kamarSelect.appendChild(option);
    });
});

// Filters
document.getElementById('searchInput').addEventListener('input', debounce(loadSantri, 500));
document.getElementById('filterAsrama').addEventListener('change', loadSantri);
document.getElementById('filterKamar').addEventListener('change', loadSantri);
document.getElementById('filterStatus').addEventListener('change', loadSantri);
document.getElementById('filterJK').addEventListener('change', loadSantri);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSantri();
});
