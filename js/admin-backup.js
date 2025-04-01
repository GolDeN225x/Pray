// وظائف النسخ الاحتياطي واستعادة البيانات
document.addEventListener('DOMContentLoaded', function() {
    // أزرار النسخ الاحتياطي والاستعادة
    const backupBtn = document.getElementById('backup-btn');
    const restoreBtn = document.getElementById('restore-btn');
    const restoreFileInput = document.getElementById('restore-file');
    const cleanStorageBtn = document.getElementById('clean-storage-btn');
    
    // نوافذ التأكيد
    const restoreConfirmModal = document.getElementById('restore-confirm-modal');
    const confirmRestoreBtn = document.getElementById('confirm-restore');
    
    // إضافة مستمعي الأحداث
    if (backupBtn) {
        backupBtn.addEventListener('click', createBackup);
    }
    
    if (restoreBtn && restoreFileInput) {
        restoreBtn.addEventListener('click', function() {
            restoreFileInput.click();
        });
        
        restoreFileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                // عرض نافذة التأكيد
                restoreConfirmModal.style.display = 'block';
            }
        });
    }
    
    if (confirmRestoreBtn) {
        confirmRestoreBtn.addEventListener('click', function() {
            restoreBackup(restoreFileInput.files[0]);
            restoreConfirmModal.style.display = 'none';
        });
    }
    
    if (cleanStorageBtn) {
        cleanStorageBtn.addEventListener('click', cleanStorage);
    }
    
    // إغلاق النوافذ المنبثقة
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            restoreConfirmModal.style.display = 'none';
            // إعادة تعيين حقل الملف
            if (restoreFileInput) {
                restoreFileInput.value = '';
            }
        });
    });
    
    // إغلاق النافذة المنبثقة عند النقر خارجها
    window.addEventListener('click', function(e) {
        if (e.target === restoreConfirmModal) {
            restoreConfirmModal.style.display = 'none';
            // إعادة تعيين حقل الملف
            if (restoreFileInput) {
                restoreFileInput.value = '';
            }
        }
    });
});

// دالة إنشاء نسخة احتياطية
function createBackup() {
    try {
        // جمع جميع بيانات localStorage
        const backupData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                try {
                    // محاولة تحليل البيانات كـ JSON
                    backupData[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    // إذا لم تكن JSON، احفظها كنص عادي
                    backupData[key] = localStorage.getItem(key);
                }
            }
        }
        
        // إضافة معلومات النسخة الاحتياطية
        backupData._meta = {
            timestamp: Date.now(),
            version: '1.0',
            appName: 'تطبيق تتبع الصلوات'
        };
        
        // تحويل البيانات إلى JSON
        const jsonData = JSON.stringify(backupData, null, 2);
        
        // إنشاء ملف للتنزيل
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // إنشاء رابط التنزيل
        const a = document.createElement('a');
        const date = new Date();
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        a.href = url;
        a.download = `prayer-app-backup-${formattedDate}.json`;
        
        // إضافة الرابط للصفحة والنقر عليه
        document.body.appendChild(a);
        a.click();
        
        // تنظيف
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        showSuccessMessage('تم إنشاء النسخة الاحتياطية بنجاح');
    } catch (error) {
        console.error('Error creating backup:', error);
        showErrorMessage('حدث خطأ أثناء إنشاء النسخة الاحتياطية');
    }
}

// دالة استعادة النسخة الاحتياطية
function restoreBackup(file) {
    if (!file) {
        showErrorMessage('لم يتم اختيار ملف');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            // التحقق من صحة ملف النسخة الاحتياطية
            if (!backupData._meta || backupData._meta.appName !== 'تطبيق تتبع الصلوات') {
                showErrorMessage('ملف النسخة الاحتياطية غير صالح');
                return;
            }
            
            // مسح البيانات الحالية
            localStorage.clear();
            
            // استعادة البيانات
            for (const key in backupData) {
                if (key !== '_meta') {
                    localStorage.setItem(key, JSON.stringify(backupData[key]));
                }
            }
            
            showSuccessMessage('تم استعادة البيانات بنجاح');
            
            // إعادة تحميل البيانات في الصفحة
            if (typeof loadUserData === 'function') {
                loadUserData();
            }
        } catch (error) {
            console.error('Error restoring backup:', error);
            showErrorMessage('حدث خطأ أثناء استعادة النسخة الاحتياطية');
        }
    };
    
    reader.onerror = function() {
        showErrorMessage('حدث خطأ أثناء قراءة الملف');
    };
    
    reader.readAsText(file);
}

// دالة تنظيف التخزين
function cleanStorage() {
    try {
        // الحصول على جميع المستخدمين
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const validUserIds = users.map(user => user.id);
        
        // البحث عن البيانات التي لا تنتمي لأي مستخدم
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                // تخطي المفاتيح الأساسية
                if (['users', 'admin_login_history'].includes(key)) {
                    continue;
                }
                
                // البحث عن معرفات المستخدمين في المفاتيح
                let belongsToValidUser = false;
                
                for (const userId of validUserIds) {
                    if (key.includes(userId)) {
                        belongsToValidUser = true;
                        break;
                    }
                }
                
                // إذا كان المفتاح لا ينتمي لأي مستخدم صالح
                if (!belongsToValidUser) {
                    // التحقق من البيانات المشتركة
                    if (key === 'tracked_prayers' || key === 'tracked_adhkar') {
                        // تنظيف البيانات المشتركة بدلاً من حذفها
                        try {
                            const data = JSON.parse(localStorage.getItem(key) || '[]');
                            const filteredData = data.filter(item => validUserIds.includes(item.userId));
                            localStorage.setItem(key, JSON.stringify(filteredData));
                        } catch (e) {
                            console.error(`Error cleaning shared data for key ${key}:`, e);
                        }
                    } else if (key === 'prayers_data' || key === 'adhkar_data' || key === 'streak_data' || key === 'login_history') {
                        // تنظيف كائنات البيانات
                        try {
                            const data = JSON.parse(localStorage.getItem(key) || '{}');
                            for (const dataKey in data) {
                                if (!validUserIds.includes(dataKey)) {
                                    delete data[dataKey];
                                }
                            }
                            localStorage.setItem(key, JSON.stringify(data));
                        } catch (e) {
                            console.error(`Error cleaning object data for key ${key}:`, e);
                        }
                    } else {
                        // إضافة المفتاح للحذف
                        keysToRemove.push(key);
                    }
                }
            }
        }
        
        // حذف المفاتيح غير المستخدمة
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        showSuccessMessage(`تم تنظيف التخزين بنجاح. تم حذف ${keysToRemove.length} عنصر.`);
    } catch (error) {
        console.error('Error cleaning storage:', error);
        showErrorMessage('حدث خطأ أثناء تنظيف التخزين');
    }
}

// دالة لعرض رسائل النجاح
function showSuccessMessage(message) {
    // إنشاء عنصر الرسالة
    const messageElement = document.createElement('div');
    messageElement.className = 'success-message';
    messageElement.textContent = message;
    
    // إضافة الرسالة للصفحة
    const adminHeader = document.querySelector('.admin-header');
    if (adminHeader) {
        adminHeader.insertAdjacentElement('afterend', messageElement);
        
        // إزالة الرسالة بعد 3 ثوانٍ
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    } else {
        // استخدام التنبيه إذا لم يتم العثور على العنصر
        alert(message);
    }
}

// دالة لعرض رسائل الخطأ
function showErrorMessage(message) {
    // إنشاء عنصر الرسالة
    const messageElement = document.createElement('div');
    messageElement.className = 'error-message';
    messageElement.textContent = message;
    
    // إضافة الرسالة للصفحة
    const adminHeader = document.querySelector('.admin-header');
    if (adminHeader) {
        adminHeader.insertAdjacentElement('afterend', messageElement);
        
        // إزالة الرسالة بعد 3 ثوانٍ
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    } else {
        // استخدام التنبيه إذا لم يتم العثور على العنصر
        alert(message);
    }
}