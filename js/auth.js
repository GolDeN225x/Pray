// Authentication functionality

// Display flash message
function showFlashMessage(message, type = 'error') {
    const flashContainer = document.getElementById('flash-messages');
    if (flashContainer) {
        const messageElement = document.createElement('div');
        messageElement.className = `flash-message flash-${type}`;
        messageElement.textContent = message;
        
        flashContainer.appendChild(messageElement);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }
}

// Handle login form submission
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Get users from local storage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Find user with matching email
            const user = users.find(u => u.email === email);
            
            if (user && user.password === password) {
                // Store current user in local storage (excluding password)
                const { password, ...userWithoutPassword } = user;
                localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                showFlashMessage('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            }
        });
    }
}

// Handle registration form submission
function setupRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validate password match
            if (password !== confirmPassword) {
                showFlashMessage('كلمات المرور غير متطابقة');
                return;
            }
            
            // Get existing users
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check if email already exists
            if (users.some(user => user.email === email)) {
                showFlashMessage('البريد الإلكتروني مسجل بالفعل');
                return;
            }
            
            // Create new user
            const newUser = {
                id: Date.now().toString(),
                username,
                email,
                password,
                createdAt: new Date().toISOString()
            };
            
            // Add user to storage
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Show success message
            showFlashMessage('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.', 'success');
            
            // Redirect to login page after a short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
    }
}

// Initialize authentication
function initAuth() {
    setupLoginForm();
    setupRegisterForm();
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);

// نظام المصادقة للتطبيق
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة قاعدة البيانات
    initDatabase();
    
    // التحقق من وجود جلسة مسؤول نشطة
    const isAdminPage = window.location.pathname.includes('admin.html');
    const adminSessionActive = localStorage.getItem('adminSessionActive') === 'true';
    
    // إذا كانت الصفحة هي صفحة الإدارة وتوجد جلسة مسؤول نشطة، فلا تقم بأي تحقق إضافي
    if (isAdminPage && adminSessionActive) {
        console.log('جلسة المسؤول نشطة، تخطي التحقق من المصادقة');
        return;
    }
    
    // الحصول على المستخدم الحالي من التخزين المحلي
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // التحقق مما إذا كان المستخدم مسجل الدخول
    const isLoggedIn = currentUser !== null;
    
    // الحصول على الصفحة الحالية
    const currentPage = window.location.pathname;
    
    // الصفحات التي لا تتطلب مصادقة
    const publicPages = [
        'index.html', 
        'login.html', 
        'register.html', 
        'admin-login.html'
    ];
    
    // التحقق مما إذا كانت الصفحة الحالية في الصفحات العامة أو هي صفحة الإدارة مع جلسة نشطة
    const isPublicPage = publicPages.some(page => currentPage.includes(page));
    
    // إذا لم يكن المستخدم مسجل الدخول والصفحة تتطلب مصادقة، قم بإعادة التوجيه إلى صفحة تسجيل الدخول
    if (!isLoggedIn && !isPublicPage && !isAdminPage) {
        window.location.href = 'login.html';
        return;
    }
    
    // إذا كان المستخدم مسجل الدخول والصفحة هي تسجيل الدخول أو التسجيل، قم بإعادة التوجيه إلى لوحة التحكم
    if (isLoggedIn && (currentPage.includes('login.html') || currentPage.includes('register.html'))) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // إعداد نموذج تسجيل الدخول
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // الحصول على قائمة المستخدمين
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // البحث عن المستخدم
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // تعيين المستخدم الحالي
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // إعادة التوجيه إلى لوحة التحكم
                window.location.href = 'dashboard.html';
            } else {
                // عرض رسالة خطأ
                const flashMessages = document.getElementById('flash-messages');
                if (flashMessages) {
                    flashMessages.innerHTML = '<div class="flash-message error">البريد الإلكتروني أو كلمة المرور غير صحيحة</div>';
                }
            }
        });
    }
    
    // إعداد نموذج التسجيل
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // التحقق من تطابق كلمات المرور
            if (password !== confirmPassword) {
                const flashMessages = document.getElementById('flash-messages');
                if (flashMessages) {
                    flashMessages.innerHTML = '<div class="flash-message error">كلمات المرور غير متطابقة</div>';
                }
                return;
            }
            
            // الحصول على قائمة المستخدمين
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // التحقق من عدم وجود بريد إلكتروني مكرر
            if (users.some(u => u.email === email)) {
                const flashMessages = document.getElementById('flash-messages');
                if (flashMessages) {
                    flashMessages.innerHTML = '<div class="flash-message error">البريد الإلكتروني مستخدم بالفعل</div>';
                }
                return;
            }
            
            // إنشاء مستخدم جديد
            const newUser = {
                id: Date.now().toString(),
                username,
                email,
                password,
                createdAt: new Date().toISOString()
            };
            
            // إضافة المستخدم إلى قائمة المستخدمين
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // تعيين المستخدم الحالي
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            // إعادة التوجيه إلى لوحة التحكم
            window.location.href = 'dashboard.html';
        });
    }
    
    // إعداد زر تسجيل الخروج
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // إزالة المستخدم الحالي
            localStorage.removeItem('currentUser');
            
            // إعادة التوجيه إلى صفحة تسجيل الدخول
            window.location.href = 'login.html';
        });
    }
    
    // عرض اسم المستخدم
    const usernameDisplay = document.getElementById('username-display');
    const welcomeUsername = document.getElementById('welcome-username');
    
    if (isLoggedIn) {
        if (usernameDisplay) {
            usernameDisplay.textContent = currentUser.username;
        }
        
        if (welcomeUsername) {
            welcomeUsername.textContent = currentUser.username;
        }
    }
});

// Add this to the login form submit handler in auth.js
// After successful login:

// Update login history
const loginHistory = JSON.parse(localStorage.getItem('login_history')) || {};
loginHistory[user.id] = new Date().toISOString();
localStorage.setItem('login_history', JSON.stringify(loginHistory));