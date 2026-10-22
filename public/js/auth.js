// Check if already logged in
if (isAuthenticated()) {
    window.location.href = getFirstAccessiblePage();
}

// Toggle password visibility
document.getElementById('togglePassword')?.addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const icon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

// Login Form Submit
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const alertBox = document.getElementById('alertBox');
    
    // Disable button and show loading
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
    alertBox.innerHTML = '';
    
    try {
        const response = await fetch(API_ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login gagal');
        }
        
        // Save token and user data
        setToken(data.data.token);
        setUser(data.data.user);
        
        // Show success message
        alertBox.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="fas fa-check-circle me-2"></i>${data.message || 'Login berhasil!'}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        const redirectPage = getFirstAccessiblePage();
        
        setTimeout(() => {
            window.location.href = redirectPage;
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        alertBox.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i>${error.message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // Re-enable button
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Login';
    }
});
