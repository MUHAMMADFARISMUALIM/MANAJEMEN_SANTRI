const currentUser = getUser();
requireMenuAccess('manajemen-asrama');

// Data asrama dan kamar (disimpan di localStorage untuk sementara)
let dataAsrama = [];
let dataKamar = [];

// Load dari localStorage atau gunakan data default
const loadFromStorage = () => {
    const savedAsrama = localStorage.getItem('dataAsrama');
    const savedKamar = localStorage.getItem('dataKamar');
    
    if (savedAsrama) {
        dataAsrama = JSON.parse(savedAsrama);
    } else {
        // Data default
        dataAsrama = [
            { id: 1, nama: 'Asrama Putra 1', jenis: 'putra', kapasitas: 50, alamat: 'Gedung A', status: 'aktif' },
            { id: 2, nama: 'Asrama Putra 2', jenis: 'putra', kapasitas: 50, alamat: 'Gedung B', status: 'aktif' },
            { id: 3, nama: 'Asrama Putri 1', jenis: 'putri', kapasitas: 50, alamat: 'Gedung C', status: 'aktif' },
            { id: 4, nama: 'Asrama Putri 2', jenis: 'putri', kapasitas: 50, alamat: 'Gedung D', status: 'aktif' }
        ];
    }
    
    if (savedKamar) {
        dataKamar = JSON.parse(savedKamar);
    } else {
        // Data default kamar dengan asrama_id
        dataKamar = [
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
};

// Save ke localStorage
const saveToStorage = () => {
    localStorage.setItem('dataAsrama', JSON.stringify(dataAsrama));
    localStorage.setItem('dataKamar', JSON.stringify(dataKamar));
};

// Load Asrama
const loadAsrama = () => {
    const container = document.getElementById('asramaCards');
    
    if (dataAsrama.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">Belum ada data asrama</div>';
        return;
    }
    
    container.innerHTML = dataAsrama.map(asrama => `
        <div class="col-md-6 col-lg-4">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="mb-0">${asrama.nama}</h6>
                        <span class="badge ${asrama.jenis === 'putra' ? 'bg-primary' : 'bg-danger'}">${asrama.jenis}</span>
                    </div>
                    <p class="text-muted mb-2"><i class="fas fa-map-marker-alt me-2"></i>${asrama.alamat || '-'}</p>
                    <p class="mb-2"><i class="fas fa-users me-2"></i>Kapasitas: ${asrama.kapasitas || '-'}</p>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" onclick="editAsrama(${asrama.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAsrama(${asrama.id}, '${asrama.nama}')">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
};

// Load Kamar
const loadKamar = () => {
    const tbody = document.getElementById('tableKamar');
    
    if (dataKamar.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Belum ada data kamar</td></tr>';
        return;
    }
    
    tbody.innerHTML = dataKamar.map(kamar => {
        const asrama = dataAsrama.find(a => a.id === kamar.asrama_id);
        return `
        <tr>
            <td><strong>${kamar.nama}</strong></td>
            <td>${asrama ? asrama.nama : '-'}</td>
            <td><span class="badge ${kamar.jenis === 'putra' ? 'bg-primary' : 'bg-danger'}">${kamar.jenis}</span></td>
            <td><span class="badge ${kamar.status === 'aktif' ? 'bg-success' : 'bg-secondary'}">${kamar.status}</span></td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editKamar(${kamar.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteKamar(${kamar.id}, '${kamar.nama}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
    }).join('');
};

// Save Asrama
document.getElementById('btnSaveAsrama').addEventListener('click', () => {
    const id = document.getElementById('asrama_id').value;
    const formData = {
        nama: document.getElementById('nama_asrama').value,
        jenis: document.getElementById('jenis').value,
        kapasitas: document.getElementById('kapasitas').value || 0,
        alamat: document.getElementById('alamat').value,
        status: 'aktif'
    };
    
    if (!formData.nama || !formData.jenis) {
        showAlert('Nama asrama dan jenis wajib diisi!', 'danger', 'alertContainer');
        return;
    }
    
    if (id) {
        // Update
        const index = dataAsrama.findIndex(a => a.id == id);
        if (index !== -1) {
            dataAsrama[index] = { ...dataAsrama[index], ...formData };
            showAlert('Asrama berhasil diupdate', 'success', 'alertContainer');
        }
    } else {
        // Create
        const newId = dataAsrama.length > 0 ? Math.max(...dataAsrama.map(a => a.id)) + 1 : 1;
        dataAsrama.push({ id: newId, ...formData });
        showAlert('Asrama berhasil ditambahkan', 'success', 'alertContainer');
    }
    
    saveToStorage();
    loadAsrama();
    bootstrap.Modal.getInstance(document.getElementById('modalAsrama')).hide();
    resetForm('formAsrama');
});

// Edit Asrama
const editAsrama = (id) => {
    const asrama = dataAsrama.find(a => a.id === id);
    if (!asrama) return;
    
    document.getElementById('modalAsramaTitle').textContent = 'Edit Unit Asrama';
    document.getElementById('asrama_id').value = asrama.id;
    document.getElementById('nama_asrama').value = asrama.nama;
    document.getElementById('jenis').value = asrama.jenis;
    document.getElementById('kapasitas').value = asrama.kapasitas;
    document.getElementById('alamat').value = asrama.alamat || '';
    
    new bootstrap.Modal(document.getElementById('modalAsrama')).show();
};

// Delete Asrama
const deleteAsrama = (id, nama) => {
    if (!confirm(`Yakin hapus asrama "${nama}"?`)) return;
    
    dataAsrama = dataAsrama.filter(a => a.id !== id);
    saveToStorage();
    loadAsrama();
    showAlert('Asrama berhasil dihapus', 'success', 'alertContainer');
};

// Save Kamar
document.getElementById('btnSaveKamar').addEventListener('click', () => {
    const id = document.getElementById('kamar_id').value;
    const asrama_id = parseInt(document.getElementById('asrama_kamar').value);
    const asrama = dataAsrama.find(a => a.id === asrama_id);
    
    const formData = {
        nama: document.getElementById('nama_kamar').value,
        asrama_id: asrama_id,
        jenis: asrama ? asrama.jenis : '',
        status: document.getElementById('status_kamar').value
    };
    
    if (!formData.nama || !formData.asrama_id) {
        showAlert('Nama kamar dan asrama wajib diisi!', 'danger', 'alertContainer');
        return;
    }
    
    if (id) {
        // Update
        const index = dataKamar.findIndex(k => k.id == id);
        if (index !== -1) {
            dataKamar[index] = { ...dataKamar[index], ...formData };
            showAlert('Kamar berhasil diupdate', 'success', 'alertContainer');
        }
    } else {
        // Create
        const newId = dataKamar.length > 0 ? Math.max(...dataKamar.map(k => k.id)) + 1 : 1;
        dataKamar.push({ id: newId, ...formData });
        showAlert('Kamar berhasil ditambahkan', 'success', 'alertContainer');
    }
    
    saveToStorage();
    loadKamar();
    bootstrap.Modal.getInstance(document.getElementById('modalKamar')).hide();
    resetForm('formKamar');
});

// Edit Kamar
const editKamar = (id) => {
    const kamar = dataKamar.find(k => k.id === id);
    if (!kamar) return;
    
    // Load asrama options first
    loadAsramaOptions();
    
    document.getElementById('modalKamarTitle').textContent = 'Edit Kamar';
    document.getElementById('kamar_id').value = kamar.id;
    document.getElementById('nama_kamar').value = kamar.nama;
    document.getElementById('asrama_kamar').value = kamar.asrama_id || '';
    document.getElementById('jenis_kamar').value = kamar.jenis;
    document.getElementById('status_kamar').value = kamar.status;
    
    new bootstrap.Modal(document.getElementById('modalKamar')).show();
};

// Delete Kamar
const deleteKamar = (id, nama) => {
    if (!confirm(`Yakin hapus kamar "${nama}"?`)) return;
    
    dataKamar = dataKamar.filter(k => k.id !== id);
    saveToStorage();
    loadKamar();
    showAlert('Kamar berhasil dihapus', 'success', 'alertContainer');
};

// Reset modal on close
document.getElementById('modalAsrama').addEventListener('hidden.bs.modal', function () {
    document.getElementById('modalAsramaTitle').textContent = 'Tambah Unit Asrama';
    document.getElementById('asrama_id').value = '';
    resetForm('formAsrama');
});

document.getElementById('modalKamar').addEventListener('hidden.bs.modal', function () {
    document.getElementById('modalKamarTitle').textContent = 'Tambah Kamar';
    document.getElementById('kamar_id').value = '';
    resetForm('formKamar');
});

// Load Asrama Options for Kamar Form
const loadAsramaOptions = () => {
    const select = document.getElementById('asrama_kamar');
    select.innerHTML = '<option value="">Pilih Asrama</option>' + 
        dataAsrama.filter(a => a.status === 'aktif').map(a => 
            `<option value="${a.id}">${a.nama}</option>`
        ).join('');
};

// Auto set jenis when asrama selected
document.getElementById('asrama_kamar').addEventListener('change', function() {
    const asramaId = parseInt(this.value);
    const asrama = dataAsrama.find(a => a.id === asramaId);
    
    if (asrama) {
        document.getElementById('jenis_kamar').value = asrama.jenis;
    } else {
        document.getElementById('jenis_kamar').value = '';
    }
});

// Load asrama options when modal kamar is shown
document.getElementById('modalKamar').addEventListener('show.bs.modal', function () {
    loadAsramaOptions();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    loadAsrama();
    loadKamar();
});
