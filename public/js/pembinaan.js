requireMenuAccess('pembinaan');

let allPembinaan = [];

// Load Pembinaan
const loadPembinaan = async () => {
    try {
        const params = new URLSearchParams({
            status: document.getElementById('filterStatus').value || '',
            jenis_pembinaan: document.getElementById('filterJenis').value || ''
        });
        const data = await apiRequest(`${API_ENDPOINTS.PEMBINAAN}?${params}`);
        
        if (data.success) {
            allPembinaan = data.data;
            renderTable(allPembinaan);
            updateStats(allPembinaan);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Load pembinaan error:', error);
        document.getElementById('tablePembinaan').innerHTML = `
            <tr><td colspan="7" class="text-center text-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>${error.message}
            </td></tr>
        `;
    }
};

// Update Stats
const updateStats = (data) => {
    const proses = data.filter(i => i.status === 'proses').length;
    const selesai = data.filter(i => i.status === 'selesai').length;
    
    document.getElementById('statProses').textContent = proses;
    document.getElementById('statSelesai').textContent = selesai;
};

// Render Table
const renderTable = (data) => {
    const tbody = document.getElementById('tablePembinaan');
    const user = getUser();
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Tidak ada data pembinaan</td></tr>';
        return;
    }
    
    const jenisPembinaanLabel = {
        'teguran_lisan': 'Teguran Lisan',
        'teguran_tertulis': 'Teguran Tertulis',
        'konseling': 'Konseling',
        'sanksi_ringan': 'Sanksi Ringan',
        'sanksi_berat': 'Sanksi Berat',
        'pemanggilan_wali': 'Pemanggilan Wali'
    };
    
    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${formatDateShort(item.tanggal_pembinaan)}</td>
            <td>
                <strong>${item.nama_santri}</strong><br>
                <small class="text-muted">${item.nis}</small>
            </td>
            <td>
                ${item.nama_pelanggaran}<br>
                <small class="text-muted"><span class="badge ${getKategoriBadgeClass(item.kategori)}">${item.kategori}</span></small>
            </td>
            <td>${jenisPembinaanLabel[item.jenis_pembinaan]}</td>
            <td><small>${item.pembina_nama}</small></td>
            <td><span class="badge ${getStatusBadgeClass(item.status)}">${STATUS_LABELS[item.status]}</span></td>
            <td>
                ${item.status === 'proses' ? `
                    <button class="btn btn-sm btn-warning" onclick="editPembinaan(${item.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletePembinaan(${item.id})" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-info" onclick="viewPembinaan(${item.id})" title="Detail">
                    <i class="fas fa-eye"></i>
                </button>
                ${item.status === 'proses' && ['admin', 'ustadz', 'ustadzah', 'pengasuh'].includes(user.role) ? `
                    <button class="btn btn-sm btn-success" onclick="selesaikanPembinaan(${item.id})" title="Selesaikan">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
};

// Load Santri List
const loadSantriList = async () => {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.SANTRI}?status=aktif`);
        if (data.success) {
            const select = document.getElementById('santri_id');
            select.innerHTML = '<option value="">Pilih Santri</option>' + 
                data.data.map(s => `<option value="${s.id}">${s.nama_lengkap} (${s.nis})</option>`).join('');
            
            // Check if there's santri_id in URL params
            const params = getQueryParams();
            if (params.santri_id) {
                select.value = params.santri_id;
                loadPelanggaranBySantri(params.santri_id, params.pelanggaran_id);
            }
        }
    } catch (error) {
        console.error('Load santri error:', error);
    }
};

// Load Pelanggaran by Santri
const loadPelanggaranBySantri = async (santriId, selectedId = null) => {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.PELANGGARAN}?santri_id=${santriId}&status=tercatat`);
        if (data.success) {
            const select = document.getElementById('pelanggaran_id');
            if (data.data.length === 0) {
                select.innerHTML = '<option value="">Tidak ada pelanggaran untuk santri ini</option>';
            } else {
                select.innerHTML = '<option value="">Pilih Pelanggaran</option>' + 
                    data.data.map(p => `<option value="${p.id}">${p.nama_pelanggaran} - ${formatDateShort(p.tanggal_pelanggaran)}</option>`).join('');
                
                if (selectedId) {
                    select.value = selectedId;
                }
            }
        }
    } catch (error) {
        console.error('Load pelanggaran error:', error);
    }
};

// Santri change event
document.getElementById('santri_id').addEventListener('change', function() {
    if (this.value) {
        loadPelanggaranBySantri(this.value);
    } else {
        document.getElementById('pelanggaran_id').innerHTML = '<option value="">Pilih Pelanggaran</option>';
    }
});

// Add/Update Pembinaan
const savePembinaan = async () => {
    const pembinaaanId = document.getElementById('pembinaaanId').value;
    const formData = {
        santri_id: document.getElementById('santri_id').value,
        pelanggaran_id: document.getElementById('pelanggaran_id').value,
        tanggal_pembinaan: document.getElementById('tanggal_pembinaan').value,
        jenis_pembinaan: document.getElementById('jenis_pembinaan').value,
        materi_pembinaan: '',  // Default empty
        hasil_pembinaan: document.getElementById('hasil_pembinaan').value,
        tindak_lanjut: '',  // Default empty
        catatan: ''  // Default empty
    };
    
    if (!formData.santri_id || !formData.pelanggaran_id || !formData.tanggal_pembinaan || !formData.jenis_pembinaan) {
        showAlert('Data tidak lengkap! Santri, Pelanggaran, Tanggal, dan Jenis Pembinaan wajib diisi.', 'danger', 'alertContainer');
        return;
    }
    
    try {
        const btn = document.getElementById('btnSave');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Menyimpan...';
        
        const url = pembinaaanId ? `${API_ENDPOINTS.PEMBINAAN}/${pembinaaanId}` : API_ENDPOINTS.PEMBINAAN;
        const method = pembinaaanId ? 'PUT' : 'POST';
        
        const result = await apiRequest(url, {
            method: method,
            body: JSON.stringify(formData)
        });
        
        if (result.success) {
            showAlert(result.message, 'success', 'alertContainer');
            bootstrap.Modal.getInstance(document.getElementById('modalPembinaan')).hide();
            loadPembinaan();
            resetForm('formPembinaan');
            
            // Redirect back if came from pelanggaran page
            const params = getQueryParams();
            if (params.add === 'true') {
                setTimeout(() => {
                    window.location.href = 'pelanggaran.html';
                }, 1500);
            }
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
};

document.getElementById('btnSave').addEventListener('click', savePembinaan);

// Delete Pembinaan
const deletePembinaan = async (id) => {
    if (!confirm('Hapus pembinaan ini? Data tidak dapat dikembalikan.')) return;
    
    try {
        const result = await apiRequest(`${API_ENDPOINTS.PEMBINAAN}/${id}`, {
            method: 'DELETE'
        });
        
        if (result.success) {
            showAlert(result.message, 'success', 'alertContainer');
            loadPembinaan();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showAlert(error.message, 'danger', 'alertContainer');
    }
};

// Edit Pembinaan
const editPembinaan = async (id) => {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.PEMBINAAN}/${id}`);
        if (data.success) {
            const p = data.data;
            
            document.getElementById('pembinaaanId').value = id;
            document.getElementById('santri_id').value = p.santri_id;
            document.getElementById('pelanggaran_id').value = p.pelanggaran_id;
            document.getElementById('tanggal_pembinaan').value = formatDateForInput(p.tanggal_pembinaan);
            document.getElementById('jenis_pembinaan').value = p.jenis_pembinaan;
            document.getElementById('hasil_pembinaan').value = p.hasil_pembinaan || '';
            
            document.querySelector('#modalPembinaan .modal-title').textContent = 'Edit Pembinaan';
            document.getElementById('santri_id').disabled = true;
            document.getElementById('pelanggaran_id').disabled = true;
            
            new bootstrap.Modal(document.getElementById('modalPembinaan')).show();
        }
    } catch (error) {
        showAlert('Gagal memuat data: ' + error.message, 'danger', 'alertContainer');
    }
};

// View Pembinaan
const viewPembinaan = async (id) => {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.PEMBINAAN}/${id}`);
        if (data.success) {
            const p = data.data;
            
            // Set data
            document.getElementById('detailNisPemb').textContent = p.nis || '-';
            document.getElementById('detailNamaSantriPemb').textContent = p.nama_santri || '-';
            document.getElementById('detailJKPemb').textContent = p.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan';
            document.getElementById('detailAsramaPemb').textContent = p.nama_asrama || '-';
            document.getElementById('detailKamarPemb').textContent = p.nama_kamar || '-';
            document.getElementById('detailStatusSantriPemb').textContent = STATUS_LABELS[p.status_santri] || p.status_santri || '-';
            
            document.getElementById('detailNamaPelanggaranPemb').textContent = p.nama_pelanggaran || '-';
            document.getElementById('detailKategoriPemb').textContent = p.kategori || '-';
            
            const jenisPembinaanLabel = {
                'teguran_lisan': 'Teguran Lisan',
                'teguran_tertulis': 'Teguran Tertulis',
                'konseling': 'Konseling',
                'sanksi_ringan': 'Sanksi Ringan',
                'sanksi_berat': 'Sanksi Berat',
                'pemanggilan_wali': 'Pemanggilan Wali'
            };
            document.getElementById('detailJenisPembinaan').textContent = jenisPembinaanLabel[p.jenis_pembinaan] || p.jenis_pembinaan || '-';
            document.getElementById('detailTanggalPembinaan').textContent = formatDate(p.tanggal_pembinaan) || '-';
            document.getElementById('detailPembina').textContent = p.pembina_nama || '-';
            document.getElementById('detailStatusPembinaan').textContent = STATUS_LABELS[p.status] || '-';
            document.getElementById('detailHasilPembinaan').textContent = p.hasil_pembinaan || '-';
            
            // Show modal
            new bootstrap.Modal(document.getElementById('modalDetailPembinaan')).show();
        }
    } catch (error) {
        showAlert('Gagal memuat detail: ' + error.message, 'danger', 'alertContainer');
    }
};

// Selesaikan Pembinaan
const selesaikanPembinaan = async (id) => {
    if (!confirm('Tandai pembinaan ini sebagai selesai?')) return;
    
    try {
        // Langsung selesaikan tanpa input tambahan
        const today = new Date().toISOString().split('T')[0];
        
        const result = await apiRequest(API_ENDPOINTS.PEMBINAAN_SELESAI(id), {
            method: 'PUT',
            body: JSON.stringify({ 
                tanggal_selesai: today, 
                hasil_pembinaan: 'Pembinaan selesai' 
            })
        });
        
        if (result.success) {
            showAlert(result.message, 'success', 'alertContainer');
            loadPembinaan();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showAlert(error.message, 'danger', 'alertContainer');
    }
};

// Filters
document.getElementById('filterStatus').addEventListener('change', loadPembinaan);
document.getElementById('filterJenis').addEventListener('change', loadPembinaan);

// Add button click handler to reset ID
document.querySelector('[data-bs-target="#modalPembinaan"]').addEventListener('click', function() {
    document.getElementById('pembinaaanId').value = '';
});

// Reset modal on show
document.getElementById('modalPembinaan').addEventListener('show.bs.modal', function () {
    const params = getQueryParams();
    const pembinaaanId = document.getElementById('pembinaaanId').value;
    
    if (pembinaaanId) {
        // Edit mode
        document.querySelector('#modalPembinaan .modal-title').textContent = 'Edit Pembinaan';
        document.getElementById('btnSaveText').textContent = 'Simpan';
    } else if (params.add !== 'true') {
        // Add mode (not from pelanggaran page)
        document.querySelector('#modalPembinaan .modal-title').textContent = 'Tambah Pembinaan';
        document.getElementById('btnSaveText').textContent = 'Simpan';
        document.getElementById('santri_id').disabled = false;
        document.getElementById('pelanggaran_id').disabled = false;
        resetForm('formPembinaan');
    }
    // If from pelanggaran page (params.add === 'true'), don't reset
    loadSantriList();
    document.getElementById('tanggal_pembinaan').valueAsDate = new Date();
});

// Reset ID when modal is hidden
document.getElementById('modalPembinaan').addEventListener('hidden.bs.modal', function () {
    document.getElementById('pembinaaanId').value = '';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPembinaan();
    
    // Check if should open modal (from pelanggaran page)
    const params = getQueryParams();
    if (params.add === 'true') {
        setTimeout(() => {
            new bootstrap.Modal(document.getElementById('modalPembinaan')).show();
        }, 500);
    }
});
