requireMenuAccess('pelanggaran');

let allPelanggaran = [];

const populatePelanggaranFilter = (elementId, options, emptyLabel) => {
    const select = document.getElementById(elementId);
    const currentValue = select.value;

    select.replaceChildren(new Option(emptyLabel, ''));
    options.forEach(option => select.add(new Option(option.label, option.value)));
    select.value = options.some(option => String(option.value) === currentValue) ? currentValue : '';
};

const updateKamarFilter = () => {
    const selectedAsrama = document.getElementById('filterPelanggaranAsrama').value;
    const matchingPelanggaran = allPelanggaran.filter(item => !selectedAsrama || item.nama_asrama === selectedAsrama);
    const kamar = [...new Set(matchingPelanggaran.map(item => item.nama_kamar).filter(Boolean))]
        .sort((left, right) => left.localeCompare(right, 'id'));

    populatePelanggaranFilter('filterPelanggaranKamar', kamar.map(nama => ({ value: nama, label: nama })), 'Semua Kamar');
};

const updateSantriFilter = () => {
    const selectedAsrama = document.getElementById('filterPelanggaranAsrama').value;
    const selectedKamar = document.getElementById('filterPelanggaranKamar').value;
    const matchingPelanggaran = allPelanggaran.filter(item =>
        (!selectedAsrama || item.nama_asrama === selectedAsrama) &&
        (!selectedKamar || item.nama_kamar === selectedKamar)
    );
    const santriById = new Map();

    matchingPelanggaran.forEach(item => {
        santriById.set(String(item.santri_id), {
            value: item.santri_id,
            label: `${item.nama_santri} (${item.nis})`
        });
    });

    const santri = [...santriById.values()].sort((left, right) => left.label.localeCompare(right.label, 'id'));
    populatePelanggaranFilter('filterPelanggaranSantri', santri, 'Semua Santri');
};

const getFilteredPelanggaran = () => {
    const santriId = document.getElementById('filterPelanggaranSantri').value;
    const kamar = document.getElementById('filterPelanggaranKamar').value;
    const asrama = document.getElementById('filterPelanggaranAsrama').value;
    return allPelanggaran.filter(item => {
        return (!santriId || String(item.santri_id) === santriId) &&
            (!kamar || item.nama_kamar === kamar) &&
            (!asrama || item.nama_asrama === asrama);
    });
};

const filterPelanggaran = () => {
    const filtered = getFilteredPelanggaran();
    renderTable(filtered);
    updateStats(filtered);
};

const escapePrintHtml = (value) => String(value ?? '-').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[character]));

const printRekapPelanggaran = () => {
    const data = getFilteredPelanggaran();
    if (data.length === 0) {
        showAlert('Tidak ada data pelanggaran untuk dicetak.', 'warning');
        return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showAlert('Izinkan pop-up untuk mencetak rekap.', 'warning');
        return;
    }

    const asrama = document.getElementById('filterPelanggaranAsrama').selectedOptions[0].text;
    const kamar = document.getElementById('filterPelanggaranKamar').selectedOptions[0].text;
    const santri = document.getElementById('filterPelanggaranSantri').selectedOptions[0].text;
    const datePrinted = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date());
    const logoUrl = new URL('logo-aziziyyah.png', window.location.href).href;
    const rows = data.map(item => `
        <tr>
            <td>${escapePrintHtml(formatDateShort(item.tanggal_pelanggaran))}</td>
            <td>${escapePrintHtml(item.nama_santri)}<small>${escapePrintHtml(item.nis)}</small></td>
            <td>${escapePrintHtml(item.nama_pelanggaran)}<small>${escapePrintHtml(item.kode_pelanggaran)}</small></td>
            <td>${escapePrintHtml(item.kategori)}</td>
            <td>${escapePrintHtml(item.dilaporkan_oleh_nama)}</td>
            <td>${escapePrintHtml(STATUS_LABELS[item.status] || item.status)}</td>
        </tr>
    `).join('');

    const html = `<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Rekap Pelanggaran Santri</title>
    <style>
        @page { size: A4 landscape; margin: 12mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #222; font: 10pt/1.4 Arial, sans-serif; }
        .report-header { display: flex; align-items: center; gap: 12px; padding-bottom: 12px; border-bottom: 2px solid #333; }
        .report-header img { width: 56px; height: 56px; object-fit: contain; }
        .report-header h1 { margin: 0 0 3px; font-size: 17pt; }
        .report-header p { margin: 0; color: #555; }
        .report-meta { display: flex; justify-content: space-between; gap: 16px; margin: 14px 0; }
        .filters { display: flex; flex-wrap: wrap; gap: 6px 18px; }
        .filters span { white-space: nowrap; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        thead { display: table-header-group; }
        tr { break-inside: avoid; }
        th, td { padding: 7px 8px; border: 1px solid #b9b9b9; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
        th { background: #f0f2f1; font-size: 9pt; text-transform: uppercase; }
        tbody tr:nth-child(even) { background: #f8f9f8; }
        small { display: block; margin-top: 2px; color: #666; font-size: 8.5pt; }
        @media screen { body { max-width: 1100px; margin: 18px auto; padding: 18px; box-shadow: 0 1px 14px #aaa; } }
    </style>
</head>
<body>
    <header class="report-header">
        <img src="${escapePrintHtml(logoUrl)}" alt="Logo Aziziyyah">
        <div><h1>REKAP PELANGGARAN SANTRI</h1><p>Madrasah Aliyah Aziziyyah</p></div>
    </header>
    <section class="report-meta">
        <div class="filters">
            <span><strong>Asrama:</strong> ${escapePrintHtml(asrama)}</span>
            <span><strong>Kamar:</strong> ${escapePrintHtml(kamar)}</span>
            <span><strong>Nama Santri:</strong> ${escapePrintHtml(santri)}</span>
        </div>
        <span><strong>Tanggal cetak:</strong> ${escapePrintHtml(datePrinted)}<br><strong>Jumlah data:</strong> ${data.length}</span>
    </section>
    <table>
        <thead><tr><th>Tanggal</th><th>Santri</th><th>Pelanggaran</th><th>Kategori</th><th>Dilaporkan Oleh</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
    </table>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.addEventListener('load', () => {
        printWindow.focus();
        printWindow.print();
    }, { once: true });
};

// Load Pelanggaran
const loadPelanggaran = async () => {
    try {
        const data = await apiRequest(API_ENDPOINTS.PELANGGARAN);
        
        if (data.success) {
            allPelanggaran = data.data;
            const asrama = [...new Set(allPelanggaran.map(item => item.nama_asrama).filter(Boolean))]
                .sort((left, right) => left.localeCompare(right, 'id'));
            populatePelanggaranFilter('filterPelanggaranAsrama', asrama.map(nama => ({ value: nama, label: nama })), 'Semua Asrama');
            updateKamarFilter();
            updateSantriFilter();
            filterPelanggaran();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Load pelanggaran error:', error);
        document.getElementById('tablePelanggaran').innerHTML = `
            <tr><td colspan="7" class="text-center text-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>${error.message}
            </td></tr>
        `;
    }
};

// Update Stats
const updateStats = (data) => {
    const ringan = data.filter(i => i.kategori === 'ringan').length;
    const sedang = data.filter(i => i.kategori === 'sedang').length;
    const berat = data.filter(i => i.kategori === 'berat').length;
    
    document.getElementById('statRingan').textContent = ringan;
    document.getElementById('statSedang').textContent = sedang;
    document.getElementById('statBerat').textContent = berat;
};

// Render Table
const renderTable = (data) => {
    const tbody = document.getElementById('tablePelanggaran');
    const user = getUser();
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Tidak ada data pelanggaran</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${formatDateShort(item.tanggal_pelanggaran)}</td>
            <td>
                <strong>${item.nama_santri}</strong><br>
                <small class="text-muted">${item.nis}</small>
            </td>
            <td>
                ${item.nama_pelanggaran}<br>
                <small class="text-muted">${item.kode_pelanggaran}</small>
            </td>
            <td><span class="badge ${getKategoriBadgeClass(item.kategori)}">${item.kategori}</span></td>
            <td><small>${item.dilaporkan_oleh_nama}</small></td>
            <td><span class="badge ${getStatusBadgeClass(item.status)}">${STATUS_LABELS[item.status]}</span></td>
            <td>
                ${item.status === 'tercatat' ? `
                    <button class="btn btn-sm btn-warning" onclick="editPelanggaran(${item.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletePelanggaran(${item.id})" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-info" onclick="viewPelanggaran(${item.id})" title="Detail">
                    <i class="fas fa-eye"></i>
                </button>
                ${item.status === 'tercatat' && ['admin', 'ustadz', 'ustadzah', 'pengasuh'].includes(user.role) ? `
                    <button class="btn btn-sm btn-primary" onclick="createPembinaan(${item.id}, ${item.santri_id})" title="Buat Pembinaan">
                        <i class="fas fa-user-check"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
};

// Load Santri
const loadSantriList = async () => {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.SANTRI}?status=aktif`);
        if (data.success) {
            const select = document.getElementById('santri_id');
            select.innerHTML = '<option value="">Pilih Santri</option>' + 
                data.data.map(s => `<option value="${s.id}">${s.nama_lengkap} (${s.nis})</option>`).join('');
        }
    } catch (error) {
        console.error('Load santri error:', error);
    }
};

// Load Jenis Pelanggaran
const loadJenisPelanggaran = async () => {
    try {
        // Mock data karena endpoint belum ada
        const jenisPelanggaran = [
            { id: 1, kode: 'PR-001', nama: 'Terlambat Sholat Berjamaah', kategori: 'ringan' },
            { id: 2, kode: 'PR-002', nama: 'Tidak Rapi Berpakaian', kategori: 'ringan' },
            { id: 3, kode: 'PS-001', nama: 'Keluar Asrama Tanpa Izin', kategori: 'sedang' },
            { id: 4, kode: 'PS-002', nama: 'Tidak Masuk Pengajian', kategori: 'sedang' },
            { id: 5, kode: 'PB-001', nama: 'Membawa Barang Terlarang', kategori: 'berat' },
            { id: 6, kode: 'PB-002', nama: 'Berkelahi', kategori: 'berat' }
        ];
        
        const select = document.getElementById('jenis_pelanggaran_id');
        select.innerHTML = '<option value="">Pilih Pelanggaran</option>' + 
            jenisPelanggaran.map(j => 
                `<option value="${j.id}">${j.kode} - ${j.nama} (${j.kategori})</option>`
            ).join('');
    } catch (error) {
        console.error('Load jenis pelanggaran error:', error);
    }
};

// Add/Update Pelanggaran
const savePelanggaran = async () => {
    const pelanggaranId = document.getElementById('pelanggaranId').value;
    const formData = {
        santri_id: document.getElementById('santri_id').value,
        jenis_pelanggaran_id: document.getElementById('jenis_pelanggaran_id').value,
        tanggal_pelanggaran: document.getElementById('tanggal_pelanggaran').value,
        waktu_pelanggaran: document.getElementById('waktu_pelanggaran').value,
        tempat_kejadian: document.getElementById('tempat_kejadian').value,
        kronologi: 'Pelanggaran tercatat',  // Default value
        catatan: document.getElementById('catatan').value
    };
    
    if (!formData.santri_id || !formData.jenis_pelanggaran_id || !formData.tanggal_pelanggaran) {
        showAlert('Data tidak lengkap! Santri, Jenis Pelanggaran, dan Tanggal wajib diisi.', 'danger', 'alertContainer');
        return;
    }
    
    try {
        const btn = document.getElementById('btnSave');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Menyimpan...';
        
        const url = pelanggaranId ? `${API_ENDPOINTS.PELANGGARAN}/${pelanggaranId}` : API_ENDPOINTS.PELANGGARAN;
        const method = pelanggaranId ? 'PUT' : 'POST';
        
        const result = await apiRequest(url, {
            method: method,
            body: JSON.stringify(formData)
        });
        
        if (result.success) {
            showAlert(result.message, 'success', 'alertContainer');
            bootstrap.Modal.getInstance(document.getElementById('modalPelanggaran')).hide();
            loadPelanggaran();
            resetForm('formPelanggaran');
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

document.getElementById('btnSave').addEventListener('click', savePelanggaran);

// Delete Pelanggaran
const deletePelanggaran = async (id) => {
    if (!confirm('Hapus pelanggaran ini? Data tidak dapat dikembalikan.')) return;
    
    try {
        const result = await apiRequest(`${API_ENDPOINTS.PELANGGARAN}/${id}`, {
            method: 'DELETE'
        });
        
        if (result.success) {
            showAlert(result.message, 'success', 'alertContainer');
            loadPelanggaran();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showAlert(error.message, 'danger', 'alertContainer');
    }
};

// Edit Pelanggaran
const editPelanggaran = async (id) => {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.PELANGGARAN}/${id}`);
        if (data.success) {
            const p = data.data;
            
            document.getElementById('pelanggaranId').value = id;
            document.getElementById('santri_id').value = p.santri_id;
            document.getElementById('jenis_pelanggaran_id').value = p.jenis_pelanggaran_id;
            document.getElementById('tanggal_pelanggaran').value = formatDateForInput(p.tanggal_pelanggaran);
            document.getElementById('waktu_pelanggaran').value = p.waktu_pelanggaran || '';
            document.getElementById('tempat_kejadian').value = p.tempat_kejadian || '';
            document.getElementById('catatan').value = p.catatan || '';
            
            document.querySelector('#modalPelanggaran .modal-title').textContent = 'Edit Pelanggaran';
            document.getElementById('santri_id').disabled = true;
            
            new bootstrap.Modal(document.getElementById('modalPelanggaran')).show();
        }
    } catch (error) {
        showAlert('Gagal memuat data: ' + error.message, 'danger', 'alertContainer');
    }
};

// View Pelanggaran
const viewPelanggaran = async (id) => {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.PELANGGARAN}/${id}`);
        if (data.success) {
            const p = data.data;
            
            // Set data
            document.getElementById('detailNisPel').textContent = p.nis || '-';
            document.getElementById('detailNamaSantriPel').textContent = p.nama_santri || '-';
            document.getElementById('detailJKPel').textContent = p.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan';
            document.getElementById('detailAsramaPel').textContent = p.nama_asrama || '-';
            document.getElementById('detailKamarPel').textContent = p.nama_kamar || '-';
            document.getElementById('detailStatusSantriPel').textContent = STATUS_LABELS[p.status_santri] || p.status_santri || '-';
            
            document.getElementById('detailNamaPelanggaran').textContent = p.nama_pelanggaran || '-';
            document.getElementById('detailKategori').textContent = p.kategori || '-';
            document.getElementById('detailStatusPelanggaran').textContent = STATUS_LABELS[p.status] || '-';
            document.getElementById('detailTanggalPelanggaran').textContent = formatDate(p.tanggal_pelanggaran) || '-';
            document.getElementById('detailWaktuPelanggaran').textContent = p.waktu_pelanggaran || '-';
            document.getElementById('detailTempatPelanggaran').textContent = p.tempat_kejadian || '-';
            
            // Show catatan only if exists
            if (p.catatan) {
                document.getElementById('catatanContainerPel').style.display = 'block';
                document.getElementById('detailCatatanPel').textContent = p.catatan;
            } else {
                document.getElementById('catatanContainerPel').style.display = 'none';
            }
            
            // Show modal
            new bootstrap.Modal(document.getElementById('modalDetailPelanggaran')).show();
        }
    } catch (error) {
        showAlert('Gagal memuat detail: ' + error.message, 'danger', 'alertContainer');
    }
};

// Create Pembinaan from Pelanggaran
const createPembinaan = (pelanggaranId, santriId) => {
    // Redirect to pembinaan page with params
    window.location.href = `pembinaan.html?add=true&pelanggaran_id=${pelanggaranId}&santri_id=${santriId}`;
};

// Rekap filters cascade from asrama to kamar and santri.
document.getElementById('btnPrintRekap').addEventListener('click', printRekapPelanggaran);
document.getElementById('filterPelanggaranAsrama').addEventListener('change', () => {
    updateKamarFilter();
    updateSantriFilter();
    filterPelanggaran();
});
document.getElementById('filterPelanggaranKamar').addEventListener('change', () => {
    updateSantriFilter();
    filterPelanggaran();
});
document.getElementById('filterPelanggaranSantri').addEventListener('change', filterPelanggaran);

// Add button click handler to reset ID
document.querySelector('[data-bs-target="#modalPelanggaran"]').addEventListener('click', function() {
    document.getElementById('pelanggaranId').value = '';
});

// Reset modal on show
document.getElementById('modalPelanggaran').addEventListener('show.bs.modal', function () {
    const pelanggaranId = document.getElementById('pelanggaranId').value;
    
    if (pelanggaranId) {
        // Edit mode
        document.querySelector('#modalPelanggaran .modal-title').textContent = 'Edit Pelanggaran';
        document.getElementById('btnSaveText').textContent = 'Simpan';
    } else {
        // Add mode
        document.querySelector('#modalPelanggaran .modal-title').textContent = 'Catat Pelanggaran';
        document.getElementById('btnSaveText').textContent = 'Simpan';
        document.getElementById('santri_id').disabled = false;
        resetForm('formPelanggaran');
        loadSantriList();
        loadJenisPelanggaran();
        document.getElementById('tanggal_pelanggaran').valueAsDate = new Date();
    }
});

// Reset ID when modal is hidden
document.getElementById('modalPelanggaran').addEventListener('hidden.bs.modal', function () {
    document.getElementById('pelanggaranId').value = '';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPelanggaran();
});
