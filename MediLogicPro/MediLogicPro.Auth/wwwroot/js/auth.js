// ============================================
// MediLogicPro Auth — Client-Side Interactivity
// ============================================

// --- Password Toggle ---
function togglePassword() {
    const input = document.getElementById('passwordInput');
    const icon = document.getElementById('eyeIcon');

    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    } else {
        input.type = 'password';
        icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    }
}

// --- Form Submit Loading State ---
document.addEventListener('DOMContentLoaded', function () {
    const forms = document.querySelectorAll('.auth-form');

    forms.forEach(function (form) {
        form.addEventListener('submit', function () {
            const btn = form.querySelector('.btn-primary');
            if (btn) {
                btn.classList.add('loading');
            }
        });
    });

    // --- Input Focus Animation ---
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(function (input) {
        input.addEventListener('focus', function () {
            this.closest('.input-wrapper').classList.add('focused');
        });
        input.addEventListener('blur', function () {
            this.closest('.input-wrapper').classList.remove('focused');
        });
    });

    // --- Auto-dismiss alerts after 5 seconds ---
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function (alert) {
        setTimeout(function () {
            alert.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-8px)';
            setTimeout(function () { alert.remove(); }, 400);
        }, 5000);
    });
});
