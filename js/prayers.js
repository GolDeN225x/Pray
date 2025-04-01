// Prayer tracking functionality

// Prayer types and their Arabic names
const prayerTypes = {
    'fajr': 'الفجر',
    'dhuhr': 'الظهر',
    'asr': 'العصر',
    'maghrib': 'المغرب',
    'isha': 'العشاء'
};

// Get today's prayers for the current user
function getTodayPrayers() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return [];
    
    const today = new Date().toISOString().split('T')[0];
    
    // Get all prayers from storage
    const allPrayers = JSON.parse(localStorage.getItem('prayers') || '[]');
    
    // Filter prayers for current user and today
    let todayPrayers = allPrayers.filter(prayer => 
        prayer.userId === currentUser.id && 
        prayer.date === today
    );
    
    // If no prayers for today, create them
    if (todayPrayers.length === 0) {
        todayPrayers = Object.keys(prayerTypes).map(type => ({
            id: `${currentUser.id}-${type}-${today}`,
            userId: currentUser.id,
            type: type,
            arabicName: prayerTypes[type],
            date: today,
            status: 'pending',
            note: '',
            time: null
        }));
        
        // Save new prayers
        allPrayers.push(...todayPrayers);
        localStorage.setItem('prayers', JSON.stringify(allPrayers));
    }
    
    return todayPrayers;
}

// Render prayers in the dashboard
function renderPrayers() {
    const prayersContainer = document.getElementById('prayers-container');
    if (!prayersContainer) return;
    
    const prayers = getTodayPrayers();
    
    prayersContainer.innerHTML = '';
    
    prayers.forEach(prayer => {
        const prayerCard = document.createElement('div');
        prayerCard.className = 'prayer-card';
        prayerCard.dataset.prayerId = prayer.id;
        
        prayerCard.innerHTML = `
            <div class="prayer-header">
                <h4>${prayer.arabicName}</h4>
                <span class="prayer-status ${prayer.status}">${getStatusInArabic(prayer.status)}</span>
            </div>
            <div class="prayer-actions">
                <button class="btn prayer-btn primary-btn" data-status="completed">أديت الصلاة</button>
                <button class="btn prayer-btn secondary-btn" data-status="missed">فاتتني الصلاة</button>
            </div>
            <div class="prayer-note">
                <textarea placeholder="إضافة ملاحظة...">${prayer.note || ''}</textarea>
                <button class="btn small-btn save-note">حفظ</button>
            </div>
        `;
        
        prayersContainer.appendChild(prayerCard);
    });
    
    // Add event listeners to buttons
    setupPrayerButtons();
}

// Convert status to Arabic
function getStatusInArabic(status) {
    const statusMap = {
        'completed': 'تم الأداء',
        'missed': 'فائتة',
        'pending': 'في الانتظار'
    };
    
    return statusMap[status] || status;
}

// Set up prayer action buttons
function setupPrayerButtons() {
    // Prayer status buttons
    document.querySelectorAll('.prayer-btn').forEach(button => {
        button.addEventListener('click', function() {
            const prayerCard = this.closest('.prayer-card');
            const prayerId = prayerCard.dataset.prayerId;
            const status = this.dataset.status;
            const note = prayerCard.querySelector('textarea').value;
            
            updatePrayer(prayerId, status, note);
            
            // Update UI
            prayerCard.querySelector('.prayer-status').className = `prayer-status ${status}`;
            prayerCard.querySelector('.prayer-status').textContent = getStatusInArabic(status);
        });
    });
    
    // Save note buttons
    document.querySelectorAll('.save-note').forEach(button => {
        button.addEventListener('click', function() {
            const prayerCard = this.closest('.prayer-card');
            const prayerId = prayerCard.dataset.prayerId;
            const status = prayerCard.querySelector('.prayer-status').className.split(' ')[1];
            const note = prayerCard.querySelector('textarea').value;
            
            updatePrayer(prayerId, status, note);
            
            // Show feedback
            alert('تم حفظ الملاحظة بنجاح');
        });
    });
}

// Update prayer in storage
function updatePrayer(prayerId, status, note) {
    const allPrayers = JSON.parse(localStorage.getItem('prayers') || '[]');
    
    const prayerIndex = allPrayers.findIndex(p => p.id === prayerId);
    if (prayerIndex !== -1) {
        allPrayers[prayerIndex].status = status;
        allPrayers[prayerIndex].note = note;
        
        if (status === 'completed') {
            allPrayers[prayerIndex].time = new Date().toISOString();
        }
        
        localStorage.setItem('prayers', JSON.stringify(allPrayers));
        
        // Update streak
        updateStreak();
    }
}

// Initialize prayers
function initPrayers() {
    renderPrayers();
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initPrayers);