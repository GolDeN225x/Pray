// Statistics and reporting functionality

// Get prayer statistics for a date range
function getPrayerStats(startDate, endDate) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return null;
    
    // Get all prayers from storage
    const allPrayers = JSON.parse(localStorage.getItem('prayers') || '[]');
    
    // Filter prayers for current user and date range
    const filteredPrayers = allPrayers.filter(prayer => {
        return prayer.userId === currentUser.id && 
               prayer.date >= startDate && 
               prayer.date <= endDate;
    });
    
    // Calculate statistics
    const totalPrayers = filteredPrayers.length;
    const completedPrayers = filteredPrayers.filter(p => p.status === 'completed').length;
    const missedPrayers = filteredPrayers.filter(p => p.status === 'missed').length;
    const pendingPrayers = filteredPrayers.filter(p => p.status === 'pending').length;
    
    // Calculate completion rate
    const completionRate = totalPrayers > 0 ? (completedPrayers / totalPrayers) * 100 : 0;
    
    // Group by prayer type
    const byType = {};
    Object.keys(prayerTypes).forEach(type => {
        const typePrayers = filteredPrayers.filter(p => p.type === type);
        const typeCompleted = typePrayers.filter(p => p.status === 'completed').length;
        const typeMissed = typePrayers.filter(p => p.status === 'missed').length;
        const typePending = typePrayers.filter(p => p.status === 'pending').length;
        
        byType[type] = {
            total: typePrayers.length,
            completed: typeCompleted,
            missed: typeMissed,
            pending: typePending,
            completionRate: typePrayers.length > 0 ? (typeCompleted / typePrayers.length) * 100 : 0
        };
    });
    
    return {
        totalPrayers,
        completedPrayers,
        missedPrayers,
        pendingPrayers,
        completionRate,
        byType
    };
}

// Get adhkar statistics for a date range
function getAdhkarStats(startDate, endDate) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return null;
    
    // Get all tracked adhkar from storage
    const allTracked = JSON.parse(localStorage.getItem('tracked_adhkar') || '[]');
    
    // Filter for current user and date range
    const filteredTracked = allTracked.filter(item => {
        return item.userId === currentUser.id && 
               item.date >= startDate && 
               item.date <= endDate;
    });
    
    // Get all adhkar categories
    const adhkarData = JSON.parse(localStorage.getItem('adhkar'));
    
    // Calculate statistics by category
    const byCategory = {};
    
    Object.keys(adhkarData).forEach(category => {
        const categoryAdhkar = adhkarData[category];
        
        const trackedInCategory = filteredTracked.filter(item => {
            const dhikrId = item.dhikrId;
            return categoryAdhkar.some(d => d.id === dhikrId);
        });
        
        const totalDhikr = categoryAdhkar.length * getDaysInRange(startDate, endDate);
        const completedDhikr = trackedInCategory.filter(item => {
            const dhikr = categoryAdhkar.find(d => d.id === item.dhikrId);
            return dhikr && item.count >= dhikr.count;
        }).length;
        
        byCategory[category] = {
            total: totalDhikr,
            completed: completedDhikr,
            completionRate: totalDhikr > 0 ? (completedDhikr / totalDhikr) * 100 : 0
        };
    });
    
    return {
        byCategory
    };
}

// Helper function to get number of days in a date range
function getDaysInRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
}

// Render statistics
function renderStatistics() {
    // Get date range elements
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    if (!startDateInput || !endDateInput) return;
    
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
    endDateInput.value = today.toISOString().split('T')[0];
    
    // Get statistics for default range
    updateStatistics();
}

// Update statistics based on selected date range
function updateStatistics() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    // Get statistics
    const prayerStats = getPrayerStats(startDate, endDate);
    const adhkarStats = getAdhkarStats(startDate, endDate);
    
    // Render prayer statistics
    renderPrayerStats(prayerStats);
    
    // Render adhkar statistics
    renderAdhkarStats(adhkarStats);
}

// Render prayer statistics
function renderPrayerStats(stats) {
    if (!stats) return;
    
    // Update overall completion rate
    const completionRateElement = document.getElementById('prayer-completion-rate');
    if (completionRateElement) {
        completionRateElement.textContent = `${stats.completionRate.toFixed(1)}%`;
        
        // Update progress bar
        const progressBar = document.querySelector('.prayer-progress-bar .progress');
        if (progressBar) {
            progressBar.style.width = `${stats.completionRate}%`;
        }
    }
    
    // Update prayer counts
    const totalElement = document.getElementById('total-prayers');
    const completedElement = document.getElementById('completed-prayers');
    const missedElement = document.getElementById('missed-prayers');
    
    if (totalElement) totalElement.textContent = stats.totalPrayers;
    if (completedElement) completedElement.textContent = stats.completedPrayers;
    if (missedElement) missedElement.textContent = stats.missedPrayers;
    
    // Update by prayer type
    const prayerTypeStats = document.getElementById('prayer-type-stats');
    if (prayerTypeStats) {
        prayerTypeStats.innerHTML = '';
        
        Object.keys(stats.byType).forEach(type => {
            const typeData = stats.byType[type];
            const typeName = prayerTypes[type];
            
            const typeRow = document.createElement('div');
            typeRow.className = 'prayer-type-row';
            
            typeRow.innerHTML = `
                <div class="prayer-type-name">${typeName}</div>
                <div class="prayer-type-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${typeData.completionRate}%"></div>
                    </div>
                    <div class="prayer-type-rate">${typeData.completionRate.toFixed(1)}%</div>
                </div>
                <div class="prayer-type-counts">
                    <span class="completed">${typeData.completed}</span> / ${typeData.total}
                </div>
            `;
            
            prayerTypeStats.appendChild(typeRow);
        });
    }
}

// Render adhkar statistics
function renderAdhkarStats(stats) {
    if (!stats) return;
    
    // Update by category
    const adhkarCategoryStats = document.getElementById('adhkar-category-stats');
    if (adhkarCategoryStats) {
        adhkarCategoryStats.innerHTML = '';
        
        const categoryNames = {
            morning: 'أذكار الصباح',
            evening: 'أذكار المساء',
            after_prayer: 'أذكار بعد الصلاة',
            sleep: 'أذكار النوم',
            general: 'أذكار عامة'
        };
        
        Object.keys(stats.byCategory).forEach(category => {
            const categoryData = stats.byCategory[category];
            const categoryName = categoryNames[category];
            
            const categoryRow = document.createElement('div');
            categoryRow.className = 'adhkar-category-row';
            
            categoryRow.innerHTML = `
                <div class="adhkar-category-name">${categoryName}</div>
                <div class="adhkar-category-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${categoryData.completionRate}%"></div>
                    </div>
                    <div class="adhkar-category-rate">${categoryData.completionRate.toFixed(1)}%</div>
                </div>
                <div class="adhkar-category-counts">
                    <span class="completed">${categoryData.completed}</span> / ${categoryData.total}
                </div>
            `;
            
            adhkarCategoryStats.appendChild(categoryRow);
        });
    }
}

// Set up date range controls
function setupDateControls() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const updateBtn = document.getElementById('update-stats');
    
    if (updateBtn) {
        updateBtn.addEventListener('click', updateStatistics);
    }
    
    // Quick date range buttons
    const weekBtn = document.getElementById('week-range');
    const monthBtn = document.getElementById('month-range');
    const yearBtn = document.getElementById('year-range');
    
    if (weekBtn) {
        weekBtn.addEventListener('click', () => {
            const today = new Date();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(today.getDate() - 7);
            
            startDateInput.value = sevenDaysAgo.toISOString().split('T')[0];
            endDateInput.value = today.toISOString().split('T')[0];
            
            updateStatistics();
        });
    }
    
    if (monthBtn) {
        monthBtn.addEventListener('click', () => {
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);
            
            startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
            endDateInput.value = today.toISOString().split('T')[0];
            
            updateStatistics();
        });
    }
    
    if (yearBtn) {
        yearBtn.addEventListener('click', () => {
            const today = new Date();
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(today.getFullYear() - 1);
            
            startDateInput.value = oneYearAgo.toISOString().split('T')[0];
            endDateInput.value = today.toISOString().split('T')[0];
            
            updateStatistics();
        });
    }
}

// Initialize statistics
function initStatistics() {
    renderStatistics();
    setupDateControls();
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initStatistics);