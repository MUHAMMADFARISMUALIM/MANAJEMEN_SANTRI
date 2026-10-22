// Show Alert
const showAlert = (message, type = 'info', containerId = 'alertContainer') => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const iconMap = {
        success: 'fa-check-circle',
        danger: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const alert = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas ${iconMap[type]} me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    container.innerHTML = alert;
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        const alertElement = container.querySelector('.alert');
        if (alertElement) {
            alertElement.classList.remove('show');
            setTimeout(() => {
                container.innerHTML = '';
            }, 150);
        }
    }, 5000);
};

// Show Loading
const showLoading = (elementId, message = 'Loading...') => {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-spinner fa-spin fa-2x mb-2"></i>
                <p>${message}</p>
            </div>
        `;
    }
};

// Show Empty State
const showEmptyState = (elementId, message = 'Tidak ada data') => {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-inbox fa-3x mb-2"></i>
                <p>${message}</p>
            </div>
        `;
    }
};

// Confirm Dialog
const confirmDialog = (message) => {
    return confirm(message);
};

// Format Number
const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num);
};

// Debounce Function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Get Query Params
const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
};

// Set Query Params
const setQueryParams = (params) => {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
        if (params[key]) {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.pushState({}, '', url);
};

// Download CSV
const downloadCSV = (data, filename = 'export.csv') => {
    const csv = data.map(row => Object.values(row).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
};

// Print Page
const printPage = () => {
    window.print();
};

// Copy to Clipboard
const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('Berhasil disalin ke clipboard!', 'success');
    }).catch(err => {
        console.error('Copy failed:', err);
        showAlert('Gagal menyalin ke clipboard', 'danger');
    });
};

// Validate Form
const validateForm = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return false;
    }
    
    return true;
};

// Reset Form
const resetForm = (formId) => {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        form.classList.remove('was-validated');
    }
};

// Format Date Functions
// Menerima: YYYY-MM-DD string (dari DB dengan dateStrings:true)
// Mengembalikan: DD/MM/YYYY untuk ditampilkan di halaman
const formatDate = (dateString) => {
    if (!dateString) return '-';

    // Handle string "YYYY-MM-DD" atau "YYYY-MM-DDTHH:mm:ss.sssZ"
    let str = String(dateString).trim();

    // Ambil hanya bagian tanggal jika ada komponen waktu (ISO format)
    if (str.includes('T')) {
        str = str.split('T')[0];
    }

    // Jika format YYYY-MM-DD → split langsung (tidak lewat new Date untuk hindari timezone shift)
    const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
    }

    // Jika sudah format DD/MM/YYYY, kembalikan apa adanya
    if (str.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return str;
    }

    // Fallback: parse lewat Date object (mungkin format lain)
    const date = new Date(str);
    if (isNaN(date.getTime())) return '-';
    const day   = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year  = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
};

const formatDateShort = (dateString) => {
    return formatDate(dateString);
};

// Mengubah nilai tanggal dari API / user input menjadi YYYY-MM-DD (untuk value input[type=date])
const formatDateForInput = (dateString) => {
    if (!dateString) return '';

    let str = String(dateString).trim();

    // Hapus komponen waktu jika ada (ISO "YYYY-MM-DDTHH:mm:ss.sssZ")
    if (str.includes('T')) {
        str = str.split('T')[0];
    }

    // Sudah dalam format YYYY-MM-DD → langsung return
    if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return str;
    }

    // Format DD/MM/YYYY → ubah ke YYYY-MM-DD
    const dmyMatch = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dmyMatch) {
        return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
    }

    // Fallback: parse lewat Date object
    const date = new Date(str);
    if (isNaN(date.getTime())) return '';
    const day   = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year  = date.getUTCFullYear();
    return `${year}-${month}-${day}`;
};

// Get displayed date value in dd/mm/yyyy format
const getDisplayDate = (inputElement) => {
    if (!inputElement || !inputElement.value) return '';
    
    // input.value is always in yyyy-mm-dd format when user sets it via date picker
    const [year, month, day] = inputElement.value.split('-');
    if (!year || !month || !day) return '';
    
    return `${day}/${month}/${year}`;
};

// Get Form Data as Object
const getFormData = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return {};
    
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
};

// Set Form Data from Object
const setFormData = (formId, data) => {
    const form = document.getElementById(formId);
    if (!form) return;
    
    Object.keys(data).forEach(key => {
        const input = form.elements[key];
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = data[key];
            } else {
                input.value = data[key] || '';
            }
        }
    });
};

// Initialize Tooltips (Bootstrap 5)
const initTooltips = () => {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
};

// Call init on page load
document.addEventListener('DOMContentLoaded', () => {
    initTooltips();
});
