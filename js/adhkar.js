// Adhkar functionality

// Default adhkar data
const defaultAdhkar = {
    morning: [
        {
            id: 'morning-1',
            arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
            translation: 'We have reached the morning and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without any partner.',
            count: 1
        },
        {
            id: 'morning-2',
            arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
            translation: 'O Allah, I ask You for knowledge that is beneficial, provision that is good, and deeds that are acceptable.',
            count: 1
        },
        {
            id: 'morning-3',
            arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
            translation: 'Glory and praise is to Allah, as many times as the number of His creation, as much as pleases Him, as much as the weight of His Throne, and as much as the ink of His words.',
            count: 3
        }
    ],
    evening: [
        {
            id: 'evening-1',
            arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
            translation: 'We have reached the evening and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without any partner.',
            count: 1
        },
        {
            id: 'evening-2',
            arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ مَا عَمِلْتُ، وَمِنْ شَرِّ مَا لَمْ أَعْمَلْ',
            translation: 'O Allah, I seek refuge in You from the evil of what I have done and from the evil of what I have not done.',
            count: 1
        }
    ],
    after_prayer: [
        {
            id: 'after-prayer-1',
            arabic: 'أَسْتَغْفِرُ اللَّهَ (ثَلاثًا) اللَّهُمَّ أَنْتَ السَّلامُ، وَمِنْكَ السَّلامُ، تَبَارَكْتَ يَا ذَا الْجَلالِ وَالإِكْرَامِ',
            translation: 'I ask Allah for forgiveness (three times). O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honor.',
            count: 1
        },
        {
            id: 'after-prayer-2',
            arabic: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
            translation: 'None has the right to be worshipped except Allah, alone, without any partner. To Him belongs all sovereignty and praise, and He is over all things omnipotent.',
            count: 1
        }
    ],
    sleep: [
        {
            id: 'sleep-1',
            arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
            translation: 'In Your name, O Allah, I die and I live.',
            count: 1
        },
        {
            id: 'sleep-2',
            arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
            translation: 'O Allah, protect me from Your punishment on the day when You resurrect Your servants.',
            count: 1
        }
    ],
    general: [
        {
            id: 'general-1',
            arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
            translation: 'Glory and praise is to Allah. Glory is to Allah, the Magnificent.',
            count: 10
        },
        {
            id: 'general-2',
            arabic: 'لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ',
            translation: 'There is no might nor power except with Allah.',
            count: 10
        }
    ]
};

// Get adhkar for a specific category
function getAdhkar(category) {
    // Initialize adhkar in storage if not exists
    if (!localStorage.getItem('adhkar')) {
        localStorage.setItem('adhkar', JSON.stringify(defaultAdhkar));
    }
    
    const allAdhkar = JSON.parse(localStorage.getItem('adhkar'));
    return allAdhkar[category] || [];
}

// Get tracked adhkar for current user
function getTrackedAdhkar() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return {};
    
    const today = new Date().toISOString().split('T')[0];
    
    // Get all tracked adhkar from storage
    const allTracked = JSON.parse(localStorage.getItem('tracked_adhkar') || '[]');
    
    // Filter for current user and today
    const todayTracked = allTracked.filter(item => 
        item.userId === currentUser.id && 
        item.date === today
    );
    
    // Create a lookup object
    const trackedLookup = {};
    todayTracked.forEach(item => {
        trackedLookup[item.dhikrId] = item;
    });
    
    return trackedLookup;
}

// Render adhkar list
function renderAdhkar() {
    const adhkarContainer = document.getElementById('adhkar-container');
    if (!adhkarContainer) return;
    
    // Get active category
    const activeTab = document.querySelector('.category-tab.active');
    const category = activeTab ? activeTab.dataset.category : 'morning';
    
    // Get adhkar for this category
    const adhkarList = getAdhkar(category);
    
    // Get tracked adhkar
    const trackedAdhkar = getTrackedAdhkar();
    
    // Clear container
    adhkarContainer.innerHTML = '';
    
    // Render each dhikr
    adhkarList.forEach(dhikr => {
        const tracked = trackedAdhkar[dhikr.id] || { count: 0 };
        const isCompleted = tracked.count >= dhikr.count;
        
        const dhikrCard = document.createElement('div');
        dhikrCard.className = `dhikr-card ${isCompleted ? 'completed' : ''}`;
        dhikrCard.dataset.dhikrId = dhikr.id;
        
        dhikrCard.innerHTML = `
            <div class="dhikr-arabic">${dhikr.arabic}</div>
            <div class="dhikr-translation">${dhikr.translation}</div>
            <div class="dhikr-recommended">
                <span>العدد المستحب: ${dhikr.count}</span>
            </div>
            <div class="dhikr-counter">
                <span class="counter-display">${tracked.count || 0}</span>
                <div class="counter-buttons">
                    <button class="btn icon-btn increment-btn"><i class="fas fa-plus"></i></button>
                    <button class="btn icon-btn reset-btn"><i class="fas fa-redo"></i></button>
                </div>
            </div>
        `;
        
        adhkarContainer.appendChild(dhikrCard);
    });
    
    // Add event listeners
    setupAdhkarButtons();
}

// Set up adhkar buttons
function setupAdhkarButtons() {
    // Category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.category-tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Render adhkar for selected category
            renderAdhkar();
        });
    });
    
    // Increment buttons
    document.querySelectorAll('.increment-btn').forEach(button => {
        button.addEventListener('click', function() {
            const dhikrCard = this.closest('.dhikr-card');
            const dhikrId = dhikrCard.dataset.dhikrId;
            const counterDisplay = dhikrCard.querySelector('.counter-display');
            
            let count = parseInt(counterDisplay.textContent) || 0;
            count += 1;
            
            counterDisplay.textContent = count;
            
            // Update tracked adhkar
            updateTrackedAdhkar(dhikrId, count);
            
            // Check if completed
            const category = document.querySelector('.category-tab.active').dataset.category;
            const adhkar = getAdhkar(category);
            const dhikr = adhkar.find(d => d.id === dhikrId);
            
            if (dhikr && count >= dhikr.count) {
                dhikrCard.classList.add('completed');
            }
        });
    });
    
    // Reset buttons
    document.querySelectorAll('.reset-btn').forEach(button => {
        button.addEventListener('click', function() {
            const dhikrCard = this.closest('.dhikr-card');
            const dhikrId = dhikrCard.dataset.dhikrId;
            const counterDisplay = dhikrCard.querySelector('.counter-display');
            
            counterDisplay.textContent = '0';
            dhikrCard.classList.remove('completed');
            
            // Update tracked adhkar
            updateTrackedAdhkar(dhikrId, 0);
        });
    });
}

// Update tracked adhkar in storage
function updateTrackedAdhkar(dhikrId, count) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Get all tracked adhkar
    const allTracked = JSON.parse(localStorage.getItem('tracked_adhkar') || '[]');
    
    // Find existing tracked item
    const trackedIndex = allTracked.findIndex(item => 
        item.userId === currentUser.id && 
        item.dhikrId === dhikrId &&
        item.date === today
    );
    
    if (trackedIndex !== -1) {
        // Update existing
        allTracked[trackedIndex].count = count;
    } else {
        // Create new
        allTracked.push({
            userId: currentUser.id,
            dhikrId: dhikrId,
            date: today,
            count: count
        });
    }
    
    // Save to storage
    localStorage.setItem('tracked_adhkar', JSON.stringify(allTracked));
}

// Initialize adhkar
function initAdhkar() {
    // Check URL for category parameter
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
        // Activate the corresponding tab
        const tab = document.querySelector(`.category-tab[data-category="${category}"]`);
        if (tab) {
            document.querySelectorAll('.category-tab').forEach(t => {
                t.classList.remove('active');
            });
            tab.classList.add('active');
        }
    }
    
    renderAdhkar();
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdhkar);
هذه

// تحديث دالة تحميل الأذكار
async function loadAdhkar(category) {
    try {
        // استعلام لجلب الأذكار حسب الفئة
        const query = "SELECT * FROM adhkar_types WHERE category = ?";
        const adhkarList = await window.dbConnection.executeQuery(query, [category]);
        
        // عرض الأذكار
        displayAdhkar(adhkarList, category);
        
        // تحديث تقدم الأذكار
        updateAdhkarProgress(category);
    } catch (error) {
        console.error('خطأ في تحميل الأذكار:', error);
        showErrorMessage('حدث خطأ أثناء تحميل الأذكار');
    }
}

// تحديث دالة تسجيل الذكر
async function trackAdhkar(adhkarId, category, count = 1) {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }
        
        // الحصول على معلومات الذكر
        const adhkarQuery = "SELECT * FROM adhkar_types WHERE id = ?";
        const adhkarInfo = await window.dbConnection.executeQuery(adhkarQuery, [adhkarId]);
        
        if (adhkarInfo.length === 0) {
            console.error('لم يتم العثور على الذكر');
            return;
        }
        
        // تسجيل الذكر في قاعدة البيانات
        const now = new Date();
        const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const time = now.toTimeString().split(' ')[0]; // HH:MM:SS
        
        const trackQuery = `
            INSERT INTO adhkar (user_id, adhkar_type, adhkar_date, adhkar_time, count)
            VALUES (?, ?, ?, ?, ?)
        `;
        await window.dbConnection.executeQuery(trackQuery, [
            currentUser.id,
            category,
            date,
            time,
            count
        ]);
        
        // تحديث تقدم الأذكار
        updateAdhkarProgress(category);
        
        // عرض رسالة نجاح
        showSuccessMessage('تم تسجيل الذكر بنجاح');
    } catch (error) {
        console.error('خطأ في تسجيل الذكر:', error);
        showErrorMessage('حدث خطأ أثناء تسجيل الذكر');
    }
}

// تحديث دالة تحديث تقدم الأذكار
async function updateAdhkarProgress(category) {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const today = new Date().toISOString().split('T')[0];
        
        // استعلام لجلب تقدم الأذكار للمستخدم الحالي في الفئة المحددة
        const query = `
            SELECT adhkar_type, SUM(count) as total_count
            FROM adhkar
            WHERE user_id = ? AND adhkar_type = ? AND adhkar_date = ?
            GROUP BY adhkar_type
        `;
        const result = await window.dbConnection.executeQuery(query, [currentUser.id, category, today]);
        
        // الحصول على إجمالي الأذكار المطلوبة للفئة
        const adhkarTypesQuery = "SELECT SUM(count) as required_count FROM adhkar_types WHERE category = ?";
        const requiredResult = await window.dbConnection.executeQuery(adhkarTypesQuery, [category]);
        
        // حساب النسبة المئوية للإنجاز
        const totalCount = result.length > 0 ? result[0].total_count : 0;
        const requiredCount = requiredResult.length > 0 ? requiredResult[0].required_count : 0;
        
        let percentage = 0;
        if (requiredCount > 0) {
            percentage = Math.min(Math.round((totalCount / requiredCount) * 100), 100);
        }
        
        // تحديث شريط التقدم
        const progressBar = document.getElementById(`${category}-progress`);
        const progressText = document.getElementById(`${category}-progress-text`);
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${totalCount}/${requiredCount} (${percentage}%)`;
        }
    } catch (error) {
        console.error('خطأ في تحديث تقدم الأذكار:', error);
    }
}

// تحديث دالة الحصول على الأذكار
async function getAdhkar(category) {
    try {
        // استعلام لجلب الأذكار حسب الفئة
        const query = "SELECT * FROM adhkar_types WHERE category = ? ORDER BY id";
        const adhkarList = await window.dbConnection.executeQuery(query, [category]);
        
        return adhkarList;
    } catch (error) {
        console.error('خطأ في جلب الأذكار:', error);
        
        // في حالة فشل الاتصال بقاعدة البيانات، استخدم البيانات المحلية كاحتياطي
        if (!localStorage.getItem('adhkar')) {
            localStorage.setItem('adhkar', JSON.stringify(defaultAdhkar));
        }
        
        const allAdhkar = JSON.parse(localStorage.getItem('adhkar'));
        return allAdhkar[category] || [];
    }
}

// تحديث دالة الحصول على الأذكار المسجلة للمستخدم الحالي
async function getTrackedAdhkar(category) {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return {};
        
        const today = new Date().toISOString().split('T')[0];
        
        // استعلام لجلب الأذكار المسجلة للمستخدم الحالي في اليوم الحالي
        const query = `
            SELECT adhkar_id, SUM(count) as total_count
            FROM adhkar
            WHERE user_id = ? AND adhkar_type = ? AND adhkar_date = ?
            GROUP BY adhkar_id
        `;
        const result = await window.dbConnection.executeQuery(query, [currentUser.id, category, today]);
        
        // تحويل النتيجة إلى كائن للبحث السريع
        const trackedLookup = {};
        result.forEach(item => {
            trackedLookup[item.adhkar_id] = {
                count: item.total_count
            };
        });
        
        return trackedLookup;
    } catch (error) {
        console.error('خطأ في جلب الأذكار المسجلة:', error);
        
        // في حالة فشل الاتصال بقاعدة البيانات، استخدم البيانات المحلية كاحتياطي
        const allTracked = JSON.parse(localStorage.getItem('tracked_adhkar') || '[]');
        
        // تصفية للمستخدم الحالي واليوم الحالي
        const today = new Date().toISOString().split('T')[0];
        const todayTracked = allTracked.filter(item => 
            item.userId === currentUser.id && 
            item.date === today &&
            item.category === category
        );
        
        // إنشاء كائن للبحث
        const trackedLookup = {};
        todayTracked.forEach(item => {
            trackedLookup[item.dhikrId] = item;
        });
        
        return trackedLookup;
    }
}

// تحديث دالة عرض الأذكار
async function displayAdhkar(category) {
    try {
        const adhkarContainer = document.getElementById('adhkar-container');
        if (!adhkarContainer) return;
        
        // الحصول على الأذكار للفئة المحددة
        const adhkarList = await getAdhkar(category);
        
        // الحصول على الأذكار المسجلة
        const trackedAdhkar = await getTrackedAdhkar(category);
        
        // مسح المحتوى الحالي
        adhkarContainer.innerHTML = '';
        
        // عرض كل ذكر
        adhkarList.forEach(dhikr => {
            const tracked = trackedAdhkar[dhikr.id] || { count: 0 };
            const isCompleted = tracked.count >= dhikr.count;
            
            const dhikrCard = document.createElement('div');
            dhikrCard.className = `dhikr-card ${isCompleted ? 'completed' : ''}`;
            dhikrCard.dataset.dhikrId = dhikr.id;
            dhikrCard.dataset.category = category;
            
            dhikrCard.innerHTML = `
                <div class="dhikr-arabic">${dhikr.arabic}</div>
                <div class="dhikr-translation">${dhikr.translation}</div>
                <div class="dhikr-recommended">
                    <span>العدد المستحب: ${dhikr.count}</span>
                </div>
                <div class="dhikr-counter">
                    <span class="counter-display">${tracked.count || 0}</span>
                    <div class="counter-buttons">
                        <button class="btn icon-btn increment-btn"><i class="fas fa-plus"></i></button>
                        <button class="btn icon-btn reset-btn"><i class="fas fa-redo"></i></button>
                    </div>
                </div>
            `;
            
            adhkarContainer.appendChild(dhikrCard);
        });
        
        // إضافة مستمعي الأحداث للأزرار
        setupAdhkarButtons();
        
        // تحديث تقدم الأذكار
        updateAdhkarProgress(category);
    } catch (error) {
        console.error('خطأ في عرض الأذكار:', error);
        showErrorMessage('حدث خطأ أثناء عرض الأذكار');
    }
}

// تحديث دالة إعداد أزرار الأذكار
function setupAdhkarButtons() {
    // أزرار الفئات
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            document.querySelectorAll('.category-tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // إضافة الفئة النشطة للزر المضغوط
            this.classList.add('active');
            
            // عرض الأذكار للفئة المحددة
            const category = this.dataset.category;
            displayAdhkar(category);
        });
    });
    
    // أزرار الزيادة
    document.querySelectorAll('.increment-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const dhikrCard = this.closest('.dhikr-card');
            const dhikrId = dhikrCard.dataset.dhikrId;
            const category = dhikrCard.dataset.category;
            const counterDisplay = dhikrCard.querySelector('.counter-display');
            
            let count = parseInt(counterDisplay.textContent) || 0;
            count += 1;
            
            counterDisplay.textContent = count;
            
            // تحديث الأذكار المسجلة في قاعدة البيانات
            await trackAdhkar(dhikrId, category, 1);
            
            // التحقق مما إذا كان مكتملاً
            const adhkarList = await getAdhkar(category);
            const dhikr = adhkarList.find(d => d.id === dhikrId);
            
            if (dhikr && count >= dhikr.count) {
                dhikrCard.classList.add('completed');
            }
        });
    });
    
    // أزرار إعادة الضبط
    document.querySelectorAll('.reset-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const dhikrCard = this.closest('.dhikr-card');
            const dhikrId = dhikrCard.dataset.dhikrId;
            const category = dhikrCard.dataset.category;
            const counterDisplay = dhikrCard.querySelector('.counter-display');
            
            // إعادة ضبط العداد
            counterDisplay.textContent = '0';
            dhikrCard.classList.remove('completed');
            
            // حذف الأذكار المسجلة من قاعدة البيانات
            await resetTrackedAdhkar(dhikrId, category);
        });
    });
}

// دالة لإعادة ضبط الأذكار المسجلة
async function resetTrackedAdhkar(dhikrId, category) {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const today = new Date().toISOString().split('T')[0];
        
        // حذف الأذكار المسجلة من قاعدة البيانات
        const query = `
            DELETE FROM adhkar
            WHERE user_id = ? AND adhkar_id = ? AND adhkar_type = ? AND adhkar_date = ?
        `;
        await window.dbConnection.executeQuery(query, [currentUser.id, dhikrId, category, today]);
        
        // تحديث تقدم الأذكار
        updateAdhkarProgress(category);
    } catch (error) {
        console.error('خطأ في إعادة ضبط الأذكار المسجلة:', error);
        showErrorMessage('حدث خطأ أثناء إعادة ضبط الأذكار');
    }
}

// تحديث دالة تهيئة الأذكار
async function initAdhkar() {
    try {
        // التحقق من معلمة الفئة في عنوان URL
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category') || 'morning';
        
        // تنشيط علامة التبويب المقابلة
        const tab = document.querySelector(`.category-tab[data-category="${category}"]`);
        if (tab) {
            document.querySelectorAll('.category-tab').forEach(t => {
                t.classList.remove('active');
            });
            tab.classList.add('active');
        }
        
        // عرض الأذكار للفئة المحددة
        await displayAdhkar(category);
        
        // إضافة مستمع الحدث للبحث عن الأذكار
        const searchInput = document.getElementById('adhkar-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(async function() {
                await searchAdhkar(this.value, category);
            }, 300));
        }
    } catch (error) {
        console.error('خطأ في تهيئة الأذكار:', error);
        showErrorMessage('حدث خطأ أثناء تهيئة الأذكار');
    }
}

// دالة للبحث عن الأذكار
async function searchAdhkar(searchTerm, category) {
    try {
        if (!searchTerm.trim()) {
            // إذا كان مصطلح البحث فارغًا، عرض جميع الأذكار
            await displayAdhkar(category);
            return;
        }
        
        // استعلام للبحث عن الأذكار
        const query = `
            SELECT * FROM adhkar_types 
            WHERE category = ? AND (arabic LIKE ? OR translation LIKE ?)
            ORDER BY id
        `;
        const searchPattern = `%${searchTerm}%`;
        const result = await window.dbConnection.executeQuery(query, [category, searchPattern, searchPattern]);
        
        // عرض نتائج البحث
        const adhkarContainer = document.getElementById('adhkar-container');
        if (!adhkarContainer) return;
        
        // الحصول على الأذكار المسجلة
        const trackedAdhkar = await getTrackedAdhkar(category);
        
        // مسح المحتوى الحالي
        adhkarContainer.innerHTML = '';
        
        if (result.length === 0) {
            // عرض رسالة عدم وجود نتائج
            adhkarContainer.innerHTML = `
                <div class="no-results">
                    <p>لا توجد نتائج تطابق "${searchTerm}"</p>
                </div>
            `;
            return;
        }
        
        // عرض نتائج البحث
        result.forEach(dhikr => {
            const tracked = trackedAdhkar[dhikr.id] || { count: 0 };
            const isCompleted = tracked.count >= dhikr.count;
            
            const dhikrCard = document.createElement('div');
            dhikrCard.className = `dhikr-card ${isCompleted ? 'completed' : ''}`;
            dhikrCard.dataset.dhikrId = dhikr.id;
            dhikrCard.dataset.category = category;
            
            dhikrCard.innerHTML = `
                <div class="dhikr-arabic">${dhikr.arabic}</div>
                <div class="dhikr-translation">${dhikr.translation}</div>
                <div class="dhikr-recommended">
                    <span>العدد المستحب: ${dhikr.count}</span>
                </div>
                <div class="dhikr-counter">
                    <span class="counter-display">${tracked.count || 0}</span>
                    <div class="counter-buttons">
                        <button class="btn icon-btn increment-btn"><i class="fas fa-plus"></i></button>
                        <button class="btn icon-btn reset-btn"><i class="fas fa-redo"></i></button>
                    </div>
                </div>
            `;
            
            adhkarContainer.appendChild(dhikrCard);
        });
        
        // إضافة مستمعي الأحداث للأزرار
        setupAdhkarButtons();
    } catch (error) {
        console.error('خطأ في البحث عن الأذكار:', error);
        showErrorMessage('حدث خطأ أثناء البحث عن الأذكار');
    }
}

// دالة مساعدة للتأخير (debounce)
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// تشغيل التهيئة عند تحميل DOM
document.addEventListener('DOMContentLoaded', initAdhkar);
