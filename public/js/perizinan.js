requireMenuAccess('perizinan');

let allPerizinan = [];

// Load Perizinan
const loadPerizinan = async () => {
    try {
        const params = new URLSearchParams({
            status: document.getElementById('filterStatus').value || '',
            tanggal_dari: document.getElementById('filterTanggalDari').value || '',
            tanggal_sampai: document.getElementById('filterTanggalSampai').value || ''
        });
        
        const data = await apiRequest(`${API_ENDPOINTS.PERIZINAN}?${params}`);
        
        if (data.success) {
            allPerizinan = data.data;
            renderTable(allPerizinan);
            updateStats(allPerizinan);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Load perizinan error:', error);
        document.getElementById('tablePerizinan').innerHTML = `
            <tr><td colspan="8" class="text-center text-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>${error.message}
            </td></tr>
        `;
    }
};

// Update Stats
const updateStats = (data) => {
    const pending = data.filter(i => i.status === 'pending').length;
    const disetujui = data.filter(i => i.status === 'disetujui').length;
    const ditolak = data.filter(i => i.status === 'ditolak').length;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statDisetujui').textContent = disetujui;
    document.getElementById('statDitolak').textContent = ditolak;
};

// Render Table
const renderTable = (data) => {
    const tbody = document.getElementById('tablePerizinan');
    const user = getUser();
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Tidak ada data perizinan</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => `
        <tr>
            <td><strong>${item.nama_santri}</strong></td>
            <td>${item.nama_izin}</td>
            <td>${item.nomor_surat || '-'}</td>
            <td>${item.tujuan || '-'}</td>
            <td>${formatDateShort(item.tanggal_izin)}</td>
            <td>${item.tanggal_kembali ? formatDateShort(item.tanggal_kembali) : '-'}</td>
            <td><span class="badge ${getStatusBadgeClass(item.status)}">${STATUS_LABELS[item.status]}</span></td>
            <td>
                ${item.status === 'pending' ? `
                    <button class="btn btn-sm btn-warning" onclick="editPerizinan(${item.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${user.role === 'admin' ? `
                        <button class="btn btn-sm btn-danger" onclick="deletePerizinan(${item.id})" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                ` : ''}
                ${item.status === 'ditolak' && user.role === 'admin' ? `
                    <button class="btn btn-sm btn-danger" onclick="deletePerizinan(${item.id})" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
                ${item.status === 'pending' && ['admin', 'pengasuh', 'ustadz', 'ustadzah'].includes(user.role) ? `
                    <button class="btn btn-sm btn-success" onclick="approvePerizinan(${item.id}, 'disetujui')" title="Setujui">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="approvePerizinan(${item.id}, 'ditolak')" title="Tolak">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
                ${item.status === 'disetujui' && item.nomor_surat ? `
                    <button class="btn btn-sm btn-outline-primary" onclick="printSuratIzin(${item.id})" title="Cetak surat PDF">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-info" onclick="viewPerizinan(${item.id})" title="Detail">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
};

// Load Santri for dropdown
const loadSantriList = async () => {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.SANTRI}?status=aktif`);
        
        if (data.success) {
            const select = document.getElementById('santri_id');
            select.innerHTML = '<option value="">Pilih Santri</option>' + 
                data.data.map(s => `<option value="${s.id}">${s.nama_lengkap} (${s.nis})</option>`).join('');
        }
    } catch (error) {
        console.error('Load santri list error:', error);
    }
};

// Add/Update Perizinan
const savePerizinan = async () => {
    const perizinanId = document.getElementById('perizinanId').value;
    const formData = {
        santri_id: document.getElementById('santri_id').value,
        jenis_izin_id: document.getElementById('jenis_izin_id').value,
        tujuan: document.getElementById('tujuan').value,
        tanggal_izin: document.getElementById('tanggal_izin').value,
        tanggal_kembali: document.getElementById('tanggal_kembali').value,
        alasan: document.getElementById('tujuan').value  // Alasan = Tujuan
    };
    
    if (!formData.santri_id || !formData.jenis_izin_id || !formData.tujuan || !formData.tanggal_izin || !formData.tanggal_kembali) {
        showAlert('Semua field wajib diisi!', 'danger', 'alertContainer');
        return;
    }
    
    try {
        const btn = document.getElementById('btnSave');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Menyimpan...';
        
        const url = perizinanId ? `${API_ENDPOINTS.PERIZINAN}/${perizinanId}` : API_ENDPOINTS.PERIZINAN;
        const method = perizinanId ? 'PUT' : 'POST';
        
        const result = await apiRequest(url, {
            method: method,
            body: JSON.stringify(formData)
        });
        
        if (result.success) {
            showAlert(result.message, 'success', 'alertContainer');
            bootstrap.Modal.getInstance(document.getElementById('modalPerizinan')).hide();
            loadPerizinan();
            resetForm('formPerizinan');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showAlert(error.message, 'danger', 'alertContainer');
    } finally {
        const btn = document.getElementById('btnSave');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Ajukan';
    }
};

document.getElementById('btnSave').addEventListener('click', savePerizinan);

// Approve/Reject Perizinan
const approvePerizinan = async (id, status) => {
    let catatan = '';
    
    // Jika approve (disetujui), langsung lakukan tanpa prompt
    if (status === 'disetujui') {
        if (!confirm(`Yakin untuk menyetujui perizinan ini?`)) return;
    } else {
        // Jika reject, minta catatan alasan
        catatan = prompt(`Catatan untuk menolak perizinan ini (opsional):`);
        if (catatan === null) return; // User cancelled
    }
    
    try {
        const result = await apiRequest(API_ENDPOINTS.PERIZINAN_APPROVAL(id), {
            method: 'PUT',
            body: JSON.stringify({ status, catatan_persetujuan: catatan || '' })
        });
        
        if (result.success) {
            showAlert(result.message, 'success', 'alertContainer');
            loadPerizinan();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showAlert(error.message, 'danger', 'alertContainer');
    }
};

// Delete Perizinan
const deletePerizinan = async (id) => {
    if (!confirm('Hapus perizinan ini? Data tidak dapat dikembalikan.')) return;
    
    try {
        const result = await apiRequest(`${API_ENDPOINTS.PERIZINAN}/${id}`, {
            method: 'DELETE'
        });
        
        if (result.success) {
            showAlert(result.message, 'success', 'alertContainer');
            loadPerizinan();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showAlert(error.message, 'danger', 'alertContainer');
    }
};

// Edit Perizinan
const editPerizinan = async (id) => {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.PERIZINAN}/${id}`);
        
        if (data.success) {
            const p = data.data;
            
            // Set modal title and show
            document.querySelector('#modalPerizinan .modal-title').textContent = 'Edit Perizinan';
            document.getElementById('perizinanId').value = id;
            document.getElementById('santri_id').value = p.santri_id;
            document.getElementById('jenis_izin_id').value = p.jenis_izin_id;
            document.getElementById('tujuan').value = p.tujuan || '';
            document.getElementById('tanggal_izin').value = formatDateForInput(p.tanggal_izin) || '';
            document.getElementById('tanggal_kembali').value = formatDateForInput(p.tanggal_kembali) || '';
            
            // Disable santri and jenis_izin when editing
            document.getElementById('santri_id').disabled = true;
            document.getElementById('jenis_izin_id').disabled = true;
            
            new bootstrap.Modal(document.getElementById('modalPerizinan')).show();
        }
    } catch (error) {
        showAlert('Gagal memuat data: ' + error.message, 'danger', 'alertContainer');
    }
};

// View Perizinan
const viewPerizinan = async (id) => {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.PERIZINAN}/${id}`);
        
        if (data.success) {
            const p = data.data;
            
            // Set data
            document.getElementById('detailNis').textContent = p.nis || '-';
            document.getElementById('detailNamaSantri').textContent = p.nama_santri || '-';
            document.getElementById('detailJK').textContent = p.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan';
            document.getElementById('detailAsrama').textContent = p.nama_asrama || '-';
            document.getElementById('detailKamar').textContent = p.nama_kamar || '-';
            document.getElementById('detailStatusSantri').textContent = STATUS_LABELS[p.status_santri] || p.status_santri || '-';
            
            document.getElementById('detailJenisIzin').textContent = p.nama_izin || '-';
            document.getElementById('detailStatusPerizinan').textContent = STATUS_LABELS[p.status] || '-';
            document.getElementById('detailNomorSurat').textContent = p.nomor_surat || '-';
            document.getElementById('detailTujuan').textContent = p.tujuan || '-';
            document.getElementById('detailTanggalIzin').textContent = formatDate(p.tanggal_izin) || '-';
            document.getElementById('detailTanggalKembali').textContent = p.tanggal_kembali ? formatDate(p.tanggal_kembali) : '-';
            
            // Show catatan only if exists
            if (p.catatan_persetujuan) {
                document.getElementById('catatanContainer').style.display = 'block';
                document.getElementById('detailCatatan').textContent = p.catatan_persetujuan;
            } else {
                document.getElementById('catatanContainer').style.display = 'none';
            }
            
            // Show modal
            new bootstrap.Modal(document.getElementById('modalDetailPerizinan')).show();
        }
    } catch (error) {
        showAlert('Gagal memuat detail: ' + error.message, 'danger', 'alertContainer');
    }
};

const escapeHtml = (value) => String(value ?? '-').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[character]));

const printSuratIzin = async (id) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showAlert('Izinkan pop-up untuk mencetak surat.', 'warning');
        return;
    }

    printWindow.document.write('<!doctype html><title>Menyiapkan surat izin</title><p style="font-family:sans-serif;padding:24px">Menyiapkan surat...</p>');
    printWindow.document.close();

    try {
        const response = await apiRequest(`${API_ENDPOINTS.PERIZINAN}/${id}`);
        const permit = response.data;
        if (permit.status !== 'disetujui' || !permit.nomor_surat) {
            printWindow.close();
            showAlert('Surat hanya dapat dicetak setelah perizinan disetujui.', 'warning');
            return;
        }

        const logoUrl = new URL('logo-aziziyyah.png', window.location.href).href;
        const issueDate = formatDate(permit.tanggal_izin) || '-';
        const html = `<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Surat Perizinan - ${escapeHtml(permit.nama_santri)}</title>
    <style>
        @page { size: A4; margin: 14mm 16mm 13mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #111; font: 12pt/1.45 "Times New Roman", serif; }
        .letterhead { display: grid; grid-template-columns: 23mm 1fr; gap: 4mm; align-items: center; padding-bottom: 3mm; border-bottom: 3px double #222; text-align: center; }
        .letterhead img { width: 22mm; height: 22mm; object-fit: contain; }
        .letterhead p { margin: 0; }
        .foundation { font-size: 11pt; font-weight: bold; text-transform: uppercase; }
        .school { margin-top: 1mm !important; color: #735b28; font-size: 15pt; font-weight: bold; }
        .school-meta, .address, .contacts { font-size: 8.5pt; }
        .document-title { margin: 7mm 0 2mm; text-align: center; font-size: 17pt; }
        .document-number { margin: 0 0 12mm; text-align: center; font-size: 12pt; font-weight: bold; }
        .intro { margin: 0 0 2mm; }
        .details { display: grid; grid-template-columns: 42mm 5mm 1fr; row-gap: 1mm; }
        .label { font-weight: bold; }
        .value { overflow-wrap: anywhere; }
        .closing { margin: 2mm 0 0; }
        .signature { width: 68mm; margin: 16mm 0 0 auto; text-align: left; }
        .signature-space { height: 22mm; }
        .signer { font-weight: bold; text-decoration: underline; }
        @media screen { body { max-width: 210mm; min-height: 297mm; margin: 12px auto; padding: 14mm 16mm; box-shadow: 0 1px 14px #999; } }
        @media print { body { width: auto; } }
    </style>
</head>
<body>
    <header class="letterhead">
        <img src="${escapeHtml(logoUrl)}" alt="Logo Aziziyyah">
        <div>
            <p class="foundation">Yayasan Aziziyyah Al-Islamiyah Sudimara Selatan</p>
            <p class="school">Madrasah Aliyah Aziziyyah</p>
            <p class="school-meta">NPSN: 69963562 | Terakreditasi B</p>
            <p class="address">Jl. Raden Fatah Kp. Parung Serab Gg. Masjid II, Kel. Sudimara Selatan, Kec. Ciledug</p>
            <p class="address">Kota Tangerang, Banten - Indonesia 15151</p>
            <p class="contacts">(021) 222 71784 | 0812 9773 2106 | www.pesantrenaziziyyah.com | info@pesantrenaziziyyah.com</p>
        </div>
    </header>
    <h1 class="document-title">SURAT PERIZINAN SANTRI</h1>
    <p class="document-number">Nomor: ${escapeHtml(permit.nomor_surat)}</p>
    <p class="intro">Yang bertanda tangan di bawah ini, kami pengurus Madrasah Aliyah Aziziyah menerangkan bahwa santri:</p>
    <div class="details">
        <span class="label">Nama</span><span>:</span><span class="value">${escapeHtml(permit.nama_santri)}</span>
        <span class="label">Alamat</span><span>:</span><span class="value">${escapeHtml(permit.alamat)}</span>
        <span class="label">Tanggal Izin</span><span>:</span><span class="value">${escapeHtml(issueDate)}</span>
        <span class="label">Tanggal Kembali</span><span>:</span><span class="value">${escapeHtml(formatDate(permit.tanggal_kembali) || '-')}</span>
        <span class="label">Jenis Izin</span><span>:</span><span class="value">${escapeHtml(permit.nama_izin)}</span>
        <span class="label">Tujuan</span><span>:</span><span class="value">${escapeHtml(permit.tujuan)}</span>
    </div>
    <p class="closing">Demikian surat ini kami buat dan dapat digunakan sebagaimana mestinya.</p>
    <div class="signature">
        <p>Tangerang, ${escapeHtml(issueDate)}<br>Kepala Madrasah Aliyah,</p>
        <div class="signature-space"></div>
        <p class="signer">Okki Santoso, S.Th.I., Gr</p>
    </div>
</body>
</html>`;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.addEventListener('load', () => {
            printWindow.focus();
            printWindow.print();
        }, { once: true });
    } catch (error) {
        printWindow.close();
        showAlert('Gagal menyiapkan surat: ' + error.message, 'danger');
    }
};

// Filters
document.getElementById('filterStatus').addEventListener('change', loadPerizinan);
document.getElementById('filterTanggalDari').addEventListener('change', loadPerizinan);
document.getElementById('filterTanggalSampai').addEventListener('change', loadPerizinan);

// Add button click handler to reset ID
document.querySelector('[data-bs-target="#modalPerizinan"]').addEventListener('click', function() {
    document.getElementById('perizinanId').value = '';
});

// Reset modal on show
document.getElementById('modalPerizinan').addEventListener('show.bs.modal', function () {
    const perizinanId = document.getElementById('perizinanId').value;
    
    if (perizinanId) {
        // Edit mode - title dan button sudah di-set di editPerizinan
        document.querySelector('#modalPerizinan .modal-title').textContent = 'Edit Perizinan';
        document.getElementById('btnSaveText').textContent = 'Simpan';
    } else {
        // Add mode
        document.querySelector('#modalPerizinan .modal-title').textContent = 'Ajukan Perizinan';
        document.getElementById('btnSaveText').textContent = 'Ajukan';
        document.getElementById('santri_id').disabled = false;
        document.getElementById('jenis_izin_id').disabled = false;
        resetForm('formPerizinan');
        loadSantriList();
        // Set default date to today
        document.getElementById('tanggal_izin').valueAsDate = new Date();
    }
});

// Reset ID when modal is hidden
document.getElementById('modalPerizinan').addEventListener('hidden.bs.modal', function () {
    document.getElementById('perizinanId').value = '';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPerizinan();
});
