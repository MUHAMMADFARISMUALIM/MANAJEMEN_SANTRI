// Check if admin with menu access
const currentUser = getUser();
if (!hasMenuAccess('users')) {
    alert('Akses ditolak. Menu ini tidak diberikan kepada akun Anda.');
    window.location.replace(getFirstAccessiblePage());
}

let allUsers = [];

const syncMenuAccessOptions = (useRoleDefaults = false) => {
    const role = document.getElementById('role').value;
    const availableMenus = Array.from(document.querySelectorAll('[data-menu-option]'))
        .map(option => option.dataset.menuOption);
    const selectedMenus = useRoleDefaults
        ? (MENU_ACCESS_BY_ROLE[role] || [])
        : Array.from(document.querySelectorAll('input[name="akses_menu"]:checked')).map(input => input.value);

    document.querySelectorAll('[data-menu-option]').forEach(option => {
        const checkbox = option.querySelector('input[name="akses_menu"]');
        const isAvailable = availableMenus.includes(checkbox.value);
        option.hidden = false;
        checkbox.disabled = !isAvailable;
        checkbox.checked = isAvailable && selectedMenus.includes(checkbox.value);
    });
};

// Load Users
const loadUsers = async () => {
    try {
        const params = new URLSearchParams({
            role: document.getElementById('filterRole').value || '',
            status: document.getElementById('filterStatus').value || ''
        });
        
        const data = await apiRequest(`${API_ENDPOINTS.USERS}?${params}`);
        
        if (data.success) {
            allUsers = data.data;
            renderTable(allUsers);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Load users error:', error);
        document.getElementById('tableUsers').innerHTML = `
            <tr><td colspan="8" class="text-center text-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>${error.message}
            </td></tr>
        `;
    }
};

// Render Table
const renderTable = (data) => {
    const tbody = document.getElementById('tableUsers');
    const currentUser = getUser();
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Tidak ada data user</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => `
        <tr>
            <td>
                <i class="fas ${getRoleIcon(item.role)} me-2"></i>
                <strong>${item.username}</strong>
            </td>
            <td>${item.nama_lengkap}</td>
            <td>${item.email || '-'}</td>
            <td><span class="badge bg-info">${ROLE_LABELS[item.role]}</span></td>
            <td>${item.jenis_kelamin}</td>
            <td>${item.no_hp || '-'}</td>
            <td><span class="badge ${getStatusBadgeClass(item.status)}">${STATUS_LABELS[item.status]}</span></td>
            <td>
                ${currentUser.role === 'admin' ? `
                <button class="btn btn-sm btn-warning" onclick="editUser(${item.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-info" onclick="resetPassword(${item.id}, '${item.nama_lengkap}')" title="Reset Password">
                    <i class="fas fa-key"></i>
                </button>
                ${item.id !== currentUser.id ? `
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${item.id}, '${item.nama_lengkap}')" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
                ` : ''}
            </td>
        </tr>
    `).join('');
};

// Add/Edit User
document.getElementById('btnSave').addEventListener('click', async () => {
    const userId = document.getElementById('userId').value;
    const formData = {
        username: document.getElementById('username').value,
        nama_lengkap: document.getElementById('nama_lengkap').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
        jenis_kelamin: document.getElementById('jenis_kelamin').value,
        no_hp: document.getElementById('no_hp').value,
        status: document.getElementById('status').value,
        akses_menu: Array.from(document.querySelectorAll('input[name="akses_menu"]:checked')).map(input => input.value)
    };
    
    // Add password for new user
    if (!userId) {
        formData.password = document.getElementById('password').value;
        if (!formData.password || formData.password.length < 6) {
            showAlert('Password minimal 6 karakter!', 'danger', 'alertContainer');
            return;
        }
    }
    
    // Validasi
    if (!formData.username || !formData.nama_lengkap || !formData.role || !formData.jenis_kelamin) {
        showAlert('Data tidak lengkap!', 'danger', 'alertContainer');
        return;
    }

    if (formData.akses_menu.length === 0) {
        showAlert('Pilih minimal satu menu untuk user!', 'danger', 'alertContainer');
        return;
    }
    
    try {
        const btn = document.getElementById('btnSave');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Menyimpan...';
        
        const url = userId ? `${API_ENDPOINTS.USERS}/${userId}` : API_ENDPOINTS.USERS;
        const method = userId ? 'PUT' : 'POST';
        
        const result = await apiRequest(url, {
            method: method,
            body: JSON.stringify(formData)
        });
        
        if (result.success) {
            showAlert(result.message, 'success', 'alertContainer');
            bootstrap.Modal.getInstance(document.getElementById('modalUser')).hide();
            loadUsers();
            resetForm('formUser');
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

// Edit User
const editUser = async (id) => {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.USERS}/${id}`);
        
        if (data.success) {
            const user = data.data;
            
            document.getElementById('modalTitle').textContent = 'Edit User';
            document.getElementById('userId').value = user.id;
            document.getElementById('username').value = user.username;
            document.getElementById('username').readOnly = true;
            document.getElementById('nama_lengkap').value = user.nama_lengkap;
            document.getElementById('email').value = user.email || '';
            document.getElementById('role').value = user.role;
            document.getElementById('jenis_kelamin').value = user.jenis_kelamin;
            document.getElementById('no_hp').value = user.no_hp || '';
            document.getElementById('status').value = user.status;
            document.querySelectorAll('input[name="akses_menu"]').forEach(input => {
                input.checked = user.akses_menu.includes(input.value);
            });
            syncMenuAccessOptions();
            
            // Hide password field for edit
            document.getElementById('passwordField').style.display = 'none';
            document.getElementById('password').required = false;
            
            new bootstrap.Modal(document.getElementById('modalUser')).show();
        }
    } catch (error) {
        showAlert('Gagal memuat data user: ' + error.message, 'danger', 'alertContainer');
    }
};

// Reset Password
const resetPassword = async (id, nama) => {
    const newPassword = prompt(`Reset password untuk ${nama}.\n\nMasukkan password baru (minimal 6 karakter):`);
    
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
        showAlert('Password minimal 6 karakter!', 'danger', 'alertContainer');
        return;
    }
    
    try {
        const result = await apiRequest(`${API_ENDPOINTS.USERS}/${id}/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ new_password: newPassword })
        });
        
        if (result.success) {
            showAlert(`Password ${nama} berhasil direset!`, 'success', 'alertContainer');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showAlert('Gagal reset password: ' + error.message, 'danger', 'alertContainer');
    }
};

// Delete User
const deleteUser = async (id, nama) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${nama}"?\n\nUser yang dihapus tidak dapat dikembalikan.`)) {
        return;
    }
    
    try {
        const result = await apiRequest(`${API_ENDPOINTS.USERS}/${id}`, {
            method: 'DELETE'
        });
        
        if (result.success) {
            showAlert(result.message, 'success', 'alertContainer');
            loadUsers();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showAlert('Gagal menghapus user: ' + error.message, 'danger', 'alertContainer');
    }
};

// Reset modal on close
document.getElementById('modalUser').addEventListener('hidden.bs.modal', function () {
    document.getElementById('modalTitle').textContent = 'Tambah User';
    document.getElementById('userId').value = '';
    document.getElementById('username').readOnly = false;
    document.getElementById('passwordField').style.display = 'block';
    document.getElementById('password').required = true;
    resetForm('formUser');
    syncMenuAccessOptions();
});

// Filters
document.getElementById('filterRole').addEventListener('change', loadUsers);
document.getElementById('filterStatus').addEventListener('change', loadUsers);
document.getElementById('role').addEventListener('change', () => {
    syncMenuAccessOptions(!document.getElementById('userId').value);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addUserButton').hidden = currentUser.role !== 'admin';
    loadUsers();
});
