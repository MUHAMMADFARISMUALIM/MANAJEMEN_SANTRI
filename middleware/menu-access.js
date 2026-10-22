const MENU_ACCESS_BY_ROLE = {
    admin: ['dashboard', 'santri', 'perizinan', 'pelanggaran', 'pembinaan', 'manajemen-asrama', 'users'],
    pengasuh: ['dashboard', 'santri', 'perizinan', 'pelanggaran', 'pembinaan'],
    ustadz: ['dashboard', 'perizinan', 'pelanggaran', 'pembinaan'],
    ustadzah: ['dashboard', 'perizinan', 'pelanggaran', 'pembinaan']
};

const ALL_MENUS = [...new Set(Object.values(MENU_ACCESS_BY_ROLE).flat())];

const normalizeMenuAccess = (value, role) => {
    let selectedMenus = value;

    if (typeof selectedMenus === 'string') {
        try {
            selectedMenus = JSON.parse(selectedMenus);
        } catch (error) {
            selectedMenus = null;
        }
    }

    if (!Array.isArray(selectedMenus)) {
        return [...(MENU_ACCESS_BY_ROLE[role] || [])];
    }

    return [...new Set(selectedMenus.filter(menu => ALL_MENUS.includes(menu)))];
};

const requireMenuAccess = (menu) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'User tidak terautentikasi'
        });
    }

    if (!normalizeMenuAccess(req.user.akses_menu, req.user.role).includes(menu)) {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Menu ini tidak diberikan kepada akun Anda'
        });
    }

    next();
};

module.exports = { ALL_MENUS, MENU_ACCESS_BY_ROLE, normalizeMenuAccess, requireMenuAccess };