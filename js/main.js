// Main JavaScript file for the Prayer Tracking App

// Check if user is logged in
function checkAuth() {
    // Check if this is an admin page or admin login page
    const isAdminPage = window.location.href.includes('admin.html');
    const isAdminLoginPage = window.location.href.includes('admin-login.html');
    
    // If it's an admin page, check for admin access instead of regular login
    if (isAdminPage) {
        const adminAccess = sessionStorage.getItem('adminAccess');
        if (adminAccess !== 'granted') {
            window.location.href = 'admin-login.html';
            return;
        }
        // Admin is authenticated, no need to check for regular user login
        return;
    }
    
    // Skip authentication for admin login page
    if (isAdminLoginPage) {
        return;
    }
    
    const currentUser = localStorage.getItem('currentUser');
    // List of pages that don't require authentication
    const publicPages = ['login.html', 'register.html', 'index.html', 'admin-login.html', 'admin.html'];
    
    // Check if current page is public
    const isPublicPage = publicPages.some(page => window.location.href.includes(page));
    
    if (!currentUser && !isPublicPage) {
        window.location.href = 'login.html';
    } else if (currentUser && (window.location.href.includes('login.html') || window.location.href.includes('register.html'))) {
        window.location.href = 'dashboard.html';
    }
    
    // Update username display if logged in
    if (currentUser) {
        const user = JSON.parse(currentUser);
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = user.username;
        }
        
        const welcomeUsername = document.getElementById('welcome-username');
        if (welcomeUsername) {
            welcomeUsername.textContent = user.username;
        }
    }
}

// Initialize database
function initDatabase() {
    // Check if users array exists in localStorage
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    
    // Check if prayers data exists in localStorage
    if (!localStorage.getItem('prayers_data')) {
        localStorage.setItem('prayers_data', JSON.stringify({}));
    }
    
    // Check if adhkar data exists in localStorage
    if (!localStorage.getItem('adhkar_data')) {
        localStorage.setItem('adhkar_data', JSON.stringify({}));
    }
}

// Logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
}

// Admin access check
function checkAdminAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const adminCode = urlParams.get('adminCode');
    
    if (adminCode === '2025') {
        // Set admin access in session storage
        sessionStorage.setItem('adminAccess', 'granted');
        window.location.href = 'admin.html';
    }
}

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    initDatabase();
    checkAuth();
    setupLogout();
    checkAdminAccess();
});

// تحديث دالة تسجيل الدخول للتعامل مع قاعدة البيانات
async function login(username, password) {
    try {
        // استعلام للتحقق من بيانات المستخدم
        const query = "SELECT * FROM users WHERE username = ? AND password = ?";
        const result = await window.dbConnection.executeQuery(query, [username, password]);
        
        if (result.length > 0) {
            const user = result[0];
            
            // تخزين بيانات المستخدم الحالي في الجلسة
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            
            // تسجيل وقت تسجيل الدخول
            const loginTime = new Date().toISOString();
            const loginQuery = "INSERT INTO login_history (user_id, login_time, user_agent) VALUES (?, ?, ?)";
            await window.dbConnection.executeQuery(loginQuery, [user.id, loginTime, navigator.userAgent]);
            
            return { success: true, user };
        } else {
            return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
        }
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
    }
}

// تحديث دالة تسجيل المستخدم للتعامل مع قاعدة البيانات
async function register(username, email, password) {
    try {
        // التحقق من وجود المستخدم
        const checkQuery = "SELECT * FROM users WHERE username = ? OR email = ?";
        const existingUsers = await window.dbConnection.executeQuery(checkQuery, [username, email]);
        
        if (existingUsers.length > 0) {
            return { success: false, message: 'اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل' };
        }
        
        // إنشاء المستخدم الجديد
        const registerQuery = "INSERT INTO users (username, email, password, registration_date) VALUES (?, ?, ?, ?)";
        const registrationDate = new Date().toISOString();
        const result = await window.dbConnection.executeQuery(registerQuery, [username, email, password, registrationDate]);
        
        if (result.insertId) {
            // استرجاع بيانات المستخدم الجديد
            const newUserQuery = "SELECT * FROM users WHERE id = ?";
            const newUser = await window.dbConnection.executeQuery(newUserQuery, [result.insertId]);
            
            if (newUser.length > 0) {
                // تخزين بيانات المستخدم الحالي في الجلسة
                sessionStorage.setItem('currentUser', JSON.stringify(newUser[0]));
                return { success: true, user: newUser[0] };
            }
        }
        
        return { success: false, message: 'حدث خطأ أثناء إنشاء الحساب' };
    } catch (error) {
        console.error('خطأ في تسجيل المستخدم:', error);
        return { success: false, message: 'حدث خطأ أثناء إنشاء الحساب' };
    }
}

// تحديث دالة تسجيل الخروج
function logout() {
    // تسجيل وقت تسجيل الخروج إذا كان هناك مستخدم حالي
    const currentUser = getCurrentUser();
    if (currentUser) {
        const logoutTime = new Date().toISOString();
        const logoutQuery = "UPDATE login_history SET logout_time = ? WHERE user_id = ? AND logout_time IS NULL";
        window.dbConnection.executeQuery(logoutQuery, [logoutTime, currentUser.id])
            .catch(error => console.error('خطأ في تسجيل وقت الخروج:', error));
    }
    
    // مسح بيانات المستخدم من الجلسة
    sessionStorage.removeItem('currentUser');
    
    // إعادة التوجيه إلى صفحة تسجيل الدخول
    window.location.href = 'login.html';
}

// تحديث دالة الحصول على المستخدم الحالي
function getCurrentUser() {
    const userJson = sessionStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

// تحديث دالة تهيئة قاعدة البيانات
async function initDatabase() {
    try {
        // الاتصال بقاعدة البيانات
        const connected = await window.dbConnection.connect();
        
        if (connected) {
            console.log('تم الاتصال بقاعدة البيانات بنجاح');
            
            // التحقق من وجود الجداول الأساسية وإنشائها إذا لم تكن موجودة
            await createTablesIfNotExist();
        } else {
            console.error('فشل الاتصال بقاعدة البيانات');
            // استخدام التخزين المحلي كبديل مؤقت
            initLocalStorage();
        }
    } catch (error) {
        console.error('خطأ في تهيئة قاعدة البيانات:', error);
        // استخدام التخزين المحلي كبديل مؤقت
        initLocalStorage();
    }
}

// دالة لإنشاء الجداول إذا لم تكن موجودة
async function createTablesIfNotExist() {
    try {
        // إنشاء جدول المستخدمين
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                registration_date DATETIME NOT NULL,
                last_login DATETIME
            )
        `;
        await window.dbConnection.executeQuery(createUsersTable);
        
        // إنشاء جدول الصلوات
        const createPrayersTable = `
            CREATE TABLE IF NOT EXISTS prayers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                prayer_name VARCHAR(50) NOT NULL,
                prayer_date DATE NOT NULL,
                prayer_time TIME NOT NULL,
                status VARCHAR(20) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await window.dbConnection.executeQuery(createPrayersTable);
        
        // إنشاء جدول الأذكار
        const createAdhkarTable = `
            CREATE TABLE IF NOT EXISTS adhkar (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                adhkar_type VARCHAR(50) NOT NULL,
                adhkar_date DATE NOT NULL,
                adhkar_time TIME NOT NULL,
                count INT DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await window.dbConnection.executeQuery(createAdhkarTable);
        
        // إنشاء جدول سجل تسجيل الدخول
        const createLoginHistoryTable = `
            CREATE TABLE IF NOT EXISTS login_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                login_time DATETIME NOT NULL,
                logout_time DATETIME,
                user_agent TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await window.dbConnection.executeQuery(createLoginHistoryTable);
        
        // إنشاء جدول الأهداف
        const createGoalsTable = `
            CREATE TABLE IF NOT EXISTS goals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                goal_type VARCHAR(50) NOT NULL,
                goal_value INT NOT NULL,
                goal_period VARCHAR(20) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await window.dbConnection.executeQuery(createGoalsTable);
        
        console.log('تم التحقق من وجود الجداول وإنشائها إذا لزم الأمر');
    } catch (error) {
        console.error('خطأ في إنشاء الجداول:', error);
        throw error;
    }
}

// دالة لتهيئة التخزين المحلي (كبديل مؤقت)
function initLocalStorage() {
    // Check if users array exists in localStorage
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    
    // Check if prayers data exists in localStorage
    if (!localStorage.getItem('prayers_data')) {
        localStorage.setItem('prayers_data', JSON.stringify({}));
    }
    
    // Check if adhkar data exists in localStorage
    if (!localStorage.getItem('adhkar_data')) {
        localStorage.setItem('adhkar_data', JSON.stringify({}));
    }
}