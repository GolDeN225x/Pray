// Admin access functionality for index page
document.addEventListener('DOMContentLoaded', function() {
    const adminAccessBtn = document.getElementById('admin-access-btn');
    
    if (adminAccessBtn) {
        adminAccessBtn.addEventListener('click', function() {
            const secretCode = prompt('أدخل رمز الدخول للإدارة:');
            
            if (secretCode === '2025') {
                // Set admin access flag
                sessionStorage.setItem('adminAccess', 'granted');
                // Set admin bypass flag
                sessionStorage.setItem('adminBypass', 'true');
                // Navigate to admin page
                console.log('Admin access granted, redirecting...');
                window.location.href = 'admin.html';
            } else if (secretCode !== null) {
                alert('رمز الدخول غير صحيح!');
            }
        });
    }
});