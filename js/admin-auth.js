// Admin authentication system
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin auth system loaded');
    
    // Check if we're on the admin page
    if (window.location.pathname.includes('admin.html')) {
        console.log('Admin page detected, checking authentication...');
        
        // Check if admin access was granted
        const adminAccess = sessionStorage.getItem('adminAccess');
        
        if (adminAccess !== 'granted') {
            console.log('Admin access not granted, redirecting to admin login');
            window.location.href = 'admin-login.html';
        } else {
            console.log('Admin access confirmed');
        }
    }
    
    // Setup admin login form
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const adminCode = document.getElementById('admin-code').value;
            
            if (adminCode === '2025') {
                // Set admin access flag
                sessionStorage.setItem('adminAccess', 'granted');
                
                // Navigate to admin page
                window.location.href = 'admin.html';
            } else {
                alert('رمز الدخول غير صحيح!');
            }
        });
    }
    
    // Setup admin logout button
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', function() {
            // Clear admin session
            sessionStorage.removeItem('adminAccess');
            
            // Redirect to home page
            window.location.href = 'index.html';
        });
    }
});

// تحسين نظام المصادقة للمسؤول
document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('admin-login-form');
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            
            // تشفير كلمة المرور باستخدام SHA-256
            const hashedPassword = sha256(password);
            
            // التحقق من بيانات المسؤول
            if (checkAdminCredentials(username, hashedPassword)) {
                // تخزين حالة تسجيل الدخول مع وقت انتهاء الصلاحية
                const expirationTime = Date.now() + (2 * 60 * 60 * 1000); // ساعتين
                sessionStorage.setItem('adminAccess', 'granted');
                sessionStorage.setItem('adminExpiration', expirationTime);
                
                // تسجيل وقت تسجيل الدخول
                logAdminLogin();
                
                window.location.href = 'admin.html';
            } else {
                showError('اسم المستخدم أو كلمة المرور غير صحيحة');
            }
        });
    }
    
    // التحقق من تسجيل خروج المسؤول
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('adminAccess');
            sessionStorage.removeItem('adminExpiration');
            window.location.href = 'admin-login.html';
        });
    }
    
    // التحقق من انتهاء صلاحية الجلسة
    checkSessionExpiration();
});

// دالة للتحقق من انتهاء صلاحية الجلسة
function checkSessionExpiration() {
    const adminAccess = sessionStorage.getItem('adminAccess');
    const expirationTime = sessionStorage.getItem('adminExpiration');
    
    if (adminAccess === 'granted' && expirationTime) {
        if (Date.now() > parseInt(expirationTime)) {
            // انتهت صلاحية الجلسة
            sessionStorage.removeItem('adminAccess');
            sessionStorage.removeItem('adminExpiration');
            
            // إعادة التوجيه إذا كنا في صفحة المسؤول
            if (window.location.href.includes('admin.html')) {
                window.location.href = 'admin-login.html?expired=true';
            }
        } else {
            // تجديد الجلسة كل 30 دقيقة من النشاط
            setTimeout(checkSessionExpiration, 30 * 60 * 1000);
        }
    }
}

// دالة تشفير SHA-256 مبسطة
function sha256(str) {
    // في الإنتاج، استخدم مكتبة تشفير حقيقية
    // هذه نسخة مبسطة للتوضيح فقط
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

// دالة للتحقق من بيانات المسؤول
function checkAdminCredentials(username, hashedPassword) {
    // في الإنتاج، تحقق من قاعدة البيانات
    // هنا نستخدم قيم ثابتة للتوضيح
    const adminUsername = 'admin';
    const adminPasswordHash = sha256('admin123');
    
    return username === adminUsername && hashedPassword === adminPasswordHash;
}

// دالة لتسجيل وقت تسجيل دخول المسؤول
function logAdminLogin() {
    const adminLoginHistory = JSON.parse(localStorage.getItem('admin_login_history') || '[]');
    adminLoginHistory.push({
        timestamp: Date.now(),
        userAgent: navigator.userAgent
    });
    
    // الاحتفاظ بآخر 10 عمليات تسجيل دخول فقط
    if (adminLoginHistory.length > 10) {
        adminLoginHistory.shift();
    }
    
    localStorage.setItem('admin_login_history', JSON.stringify(adminLoginHistory));
}

// دالة لعرض رسائل الخطأ
function showError(message) {
    const flashMessages = document.getElementById('flash-messages');
    if (flashMessages) {
        flashMessages.innerHTML = `<div class="error-message">${message}</div>`;
    }
}