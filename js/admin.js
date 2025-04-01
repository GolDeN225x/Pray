// Admin page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let currentUserId = null;
    
    // Get DOM elements
    const userTableBody = document.getElementById('user-table-body');
    const totalUsersElement = document.getElementById('total-users');
    const activeUsersElement = document.getElementById('active-users');
    const deleteAccountModal = document.getElementById('delete-account-modal');
    const clearDataModal = document.getElementById('clear-data-modal');
    const deleteUsername = document.getElementById('delete-username');
    const clearUsername = document.getElementById('clear-username');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const confirmClearBtn = document.getElementById('confirm-clear');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const searchInput = document.getElementById('search-users');
    const searchBtn = document.getElementById('search-btn');
    
    // Load user data
    loadUserData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Function to load user data
    function loadUserData() {
        console.log('Loading user data...');
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        console.log('Found users:', users);
        
        // Update stats
        updateStats(users);
        
        // Clear existing table rows
        userTableBody.innerHTML = '';
        
        // Add users to table
        users.forEach(user => {
            addUserToTable(user);
        });
    }
    
    // Function to update stats
    function updateStats(users) {
        // Total users
        totalUsersElement.textContent = users.length;
        
        // Active users (users who have logged in within the last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Get login history from localStorage
        const loginHistory = JSON.parse(localStorage.getItem('login_history')) || {};
        
        // Count active users
        let activeUsers = 0;
        users.forEach(user => {
            const lastLogin = loginHistory[user.id] ? new Date(loginHistory[user.id]) : null;
            if (lastLogin && lastLogin > thirtyDaysAgo) {
                activeUsers++;
            }
        });
        
        activeUsersElement.textContent = activeUsers;
    }
    
    // Function to add user to table
    function addUserToTable(user) {
        // Create row
        const row = document.createElement('tr');
        
        // Get user prayer data
        const prayerData = getUserPrayerData(user.id);
        const adhkarData = getUserAdhkarData(user.id);
        
        // Calculate prayer stats
        const prayerStats = calculatePrayerStats(prayerData);
        
        // Calculate adhkar stats
        const adhkarStats = calculateAdhkarStats(adhkarData);
        
        // Format date
        const createdAt = new Date(user.createdAt);
        const formattedDate = `${createdAt.getDate()}/${createdAt.getMonth() + 1}/${createdAt.getFullYear()}`;
        
        // Set row HTML
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${formattedDate}</td>
            <td>${prayerStats.total}</td>
            <td>${prayerStats.onTime}</td>
            <td>${adhkarStats.total}</td>
            <td>
                <button class="btn small-btn warning-btn clear-data-btn" data-id="${user.id}" data-username="${user.username}">
                    <i class="fas fa-eraser"></i> مسح البيانات
                </button>
                <button class="btn small-btn danger-btn delete-account-btn" data-id="${user.id}" data-username="${user.username}">
                    <i class="fas fa-trash"></i> حذف الحساب
                </button>
            </td>
        `;
        
        // Add row to table
        userTableBody.appendChild(row);
        
        // Add event listeners to buttons
        const clearDataBtn = row.querySelector('.clear-data-btn');
        const deleteAccountBtn = row.querySelector('.delete-account-btn');
        
        clearDataBtn.addEventListener('click', handleClearData);
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    }
    
    // Function to get user prayer data
    function getUserPrayerData(userId) {
        // Get all prayer data from localStorage
        const prayerData = {};
        
        // Check for different prayer tracking formats
        // Format 1: tracked_prayers array
        const trackedPrayers = JSON.parse(localStorage.getItem('tracked_prayers') || '[]');
        const userPrayers = trackedPrayers.filter(item => item.userId === userId);
        
        // Format 2: prayers_data object with user-specific entries
        const allPrayersData = JSON.parse(localStorage.getItem('prayers_data') || '{}');
        const userPrayersData = allPrayersData[userId] || {};
        
        // Combine data from both sources
        return {
            trackedPrayers: userPrayers,
            prayersData: userPrayersData
        };
    }
    
    // Function to calculate prayer stats
    function calculatePrayerStats(prayerData) {
        let total = 0;
        let onTime = 0;
        
        // Count from tracked prayers array
        if (prayerData.trackedPrayers && Array.isArray(prayerData.trackedPrayers)) {
            total += prayerData.trackedPrayers.length;
            onTime += prayerData.trackedPrayers.filter(item => item.status === 'on_time').length;
        }
        
        // Count from prayers data object
        if (prayerData.prayersData) {
            // Loop through dates
            for (const date in prayerData.prayersData) {
                const dayData = prayerData.prayersData[date];
                // Loop through prayers for each date
                for (const prayer in dayData) {
                    if (dayData[prayer] && typeof dayData[prayer] === 'object') {
                        total++;
                        if (dayData[prayer].status === 'on_time') {
                            onTime++;
                        }
                    }
                }
            }
        }
        
        return {
            total,
            onTime
        };
    }
    
    // Function to get user adhkar data
    function getUserAdhkarData(userId) {
        // Get all adhkar data from localStorage
        const adhkarData = {};
        
        // Format 1: tracked_adhkar array
        const trackedAdhkar = JSON.parse(localStorage.getItem('tracked_adhkar') || '[]');
        const userAdhkar = trackedAdhkar.filter(item => item.userId === userId);
        
        // Format 2: adhkar_data object with user-specific entries
        const allAdhkarData = JSON.parse(localStorage.getItem('adhkar_data') || '{}');
        const userAdhkarData = allAdhkarData[userId] || {};
        
        return {
            trackedAdhkar: userAdhkar,
            adhkarData: userAdhkarData
        };
    }
    
    // Function to calculate adhkar stats
    function calculateAdhkarStats(adhkarData) {
        let total = 0;
        
        // Count from tracked adhkar array
        if (adhkarData.trackedAdhkar && Array.isArray(adhkarData.trackedAdhkar)) {
            total += adhkarData.trackedAdhkar.length;
        }
        
        // Count from adhkar data object
        if (adhkarData.adhkarData) {
            // Loop through dates
            for (const date in adhkarData.adhkarData) {
                const dayData = adhkarData.adhkarData[date];
                // Count adhkar for each date
                if (Array.isArray(dayData)) {
                    total += dayData.length;
                } else {
                    // If it's an object with adhkar types
                    for (const adhkarType in dayData) {
                        if (Array.isArray(dayData[adhkarType])) {
                            total += dayData[adhkarType].length;
                        } else if (typeof dayData[adhkarType] === 'number') {
                            total += dayData[adhkarType];
                        }
                    }
                }
            }
        }
        
        return {
            total
        };
    }
    
    // Function to handle delete account button click
    function handleDeleteAccount(e) {
        const userId = e.currentTarget.getAttribute('data-id');
        const username = e.currentTarget.getAttribute('data-username');
        
        currentUserId = userId;
        deleteUsername.textContent = username;
        deleteAccountModal.style.display = 'block';
    }
    
    // Function to handle clear data button click
    function handleClearData(e) {
        const userId = e.currentTarget.getAttribute('data-id');
        const username = e.currentTarget.getAttribute('data-username');
        
        currentUserId = userId;
        clearUsername.textContent = username;
        clearDataModal.style.display = 'block';
    }
    
    // Function to delete user account
    function deleteUserAccount(userId) {
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find user index
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex !== -1) {
            // Remove user from array
            users.splice(userIndex, 1);
            
            // Save updated users array
            localStorage.setItem('users', JSON.stringify(users));
            
            // Delete user data
            clearUserData(userId);
            
            // Reload user data
            loadUserData();
        }
    }
    
    // Function to clear user data
    // تحسين وظيفة مسح البيانات في admin.js
    function clearUserData(userId) {
        console.log('Clearing data for user ID:', userId);
        
        try {
            // 1. مسح سجلات الصلوات
            const allPrayers = JSON.parse(localStorage.getItem('tracked_prayers') || '[]');
            const filteredPrayers = allPrayers.filter(item => item.userId !== userId);
            localStorage.setItem('tracked_prayers', JSON.stringify(filteredPrayers));
            
            // 2. مسح سجلات الأذكار
            const allAdhkar = JSON.parse(localStorage.getItem('tracked_adhkar') || '[]');
            const filteredAdhkar = allAdhkar.filter(item => item.userId !== userId);
            localStorage.setItem('tracked_adhkar', JSON.stringify(filteredAdhkar));
            
            // 3. مسح بيانات الصلوات من كائن prayers_data
            const prayersData = JSON.parse(localStorage.getItem('prayers_data') || '{}');
            if (prayersData[userId]) {
                delete prayersData[userId];
                localStorage.setItem('prayers_data', JSON.stringify(prayersData));
            }
            
            // 4. مسح بيانات الأذكار من كائن adhkar_data
            const adhkarData = JSON.parse(localStorage.getItem('adhkar_data') || '{}');
            if (adhkarData[userId]) {
                delete adhkarData[userId];
                localStorage.setItem('adhkar_data', JSON.stringify(adhkarData));
            }
            
            // 5. مسح أوقات الصلاة المخصصة للمستخدم
            localStorage.removeItem(`prayer_times_${userId}`);
            
            // 6. مسح إحصائيات المستخدم
            localStorage.removeItem(`stats_${userId}`);
            
            // 7. مسح إعدادات المستخدم
            localStorage.removeItem(`settings_${userId}`);
            
            // 8. مسح بيانات التتابع (streak)
            const streakData = JSON.parse(localStorage.getItem('streak_data') || '{}');
            if (streakData[userId]) {
                delete streakData[userId];
                localStorage.setItem('streak_data', JSON.stringify(streakData));
            }
            
            // 9. مسح سجل تسجيل الدخول
            const loginHistory = JSON.parse(localStorage.getItem('login_history') || '{}');
            if (loginHistory[userId]) {
                delete loginHistory[userId];
                localStorage.setItem('login_history', JSON.stringify(loginHistory));
            }
            
            // 10. مسح أي بيانات أخرى مرتبطة بالمستخدم
            const userKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.includes(userId)) {
                    userKeys.push(key);
                }
            }
            
            // مسح جميع المفاتيح المرتبطة بالمستخدم
            userKeys.forEach(key => localStorage.removeItem(key));
            
            console.log('User data cleared successfully');
            
            // إظهار رسالة نجاح
            showSuccessMessage('تم مسح بيانات المستخدم بنجاح');
            
            // تحديث البيانات في الجدول
            loadUserData();
            
            return true;
        } catch (error) {
            console.error('Error clearing user data:', error);
            showErrorMessage('حدث خطأ أثناء مسح بيانات المستخدم');
            return false;
        }
    }
    
    // دالة لعرض رسائل النجاح
    function showSuccessMessage(message) {
        // يمكن تنفيذ هذه الدالة لعرض رسائل النجاح
        alert(message);
    }
    
    // دالة لعرض رسائل الخطأ
    function showErrorMessage(message) {
        // يمكن تنفيذ هذه الدالة لعرض رسائل الخطأ
        alert(message);
    }
    
    // Function to setup event listeners
    function setupEventListeners() {
        // Confirm delete button
        confirmDeleteBtn.addEventListener('click', function() {
            if (currentUserId) {
                deleteUserAccount(currentUserId);
                deleteAccountModal.style.display = 'none';
                currentUserId = null;
            }
        });
        
        // Confirm clear button
        confirmClearBtn.addEventListener('click', function() {
            if (currentUserId) {
                clearUserData(currentUserId);
                clearDataModal.style.display = 'none';
                currentUserId = null;
                
                // Reload user data to update stats
                loadUserData();
            }
        });
        
        // Close modal buttons
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                deleteAccountModal.style.display = 'none';
                clearDataModal.style.display = 'none';
                currentUserId = null;
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === deleteAccountModal) {
                deleteAccountModal.style.display = 'none';
                currentUserId = null;
            }
            
            if (e.target === clearDataModal) {
                clearDataModal.style.display = 'none';
                currentUserId = null;
            }
        });
        
        // Search functionality
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', function() {
                searchUsers(searchInput.value);
            });
            
            searchInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    searchUsers(searchInput.value);
                }
            });
        }
    }
    
    // Function to search users
    function searchUsers(query) {
        query = query.toLowerCase().trim();
        
        // Get all users
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // If query is empty, show all users
        if (!query) {
            loadUserData();
            document.getElementById('no-users-message').style.display = 'none';
            return;
        }
        
        // Filter users based on query
        const filteredUsers = users.filter(user => 
            user.username.toLowerCase().includes(query) || 
            user.email.toLowerCase().includes(query)
        );
        
        // Clear existing table rows
        userTableBody.innerHTML = '';
        
        // Show message if no users found
        if (filteredUsers.length === 0) {
            document.getElementById('no-users-message').style.display = 'block';
        } else {
            document.getElementById('no-users-message').style.display = 'none';
            
            // Add filtered users to table
            filteredUsers.forEach(user => {
                addUserToTable(user);
            });
        }
    }
});