// Streak tracking functionality

// Get streak data for current user
function getStreak() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return null;
    
    // Get all streaks from storage
    const allStreaks = JSON.parse(localStorage.getItem('streaks') || '[]');
    
    // Find streak for current user
    let userStreak = allStreaks.find(streak => streak.userId === currentUser.id);
    
    // If no streak exists, create one
    if (!userStreak) {
        userStreak = {
            userId: currentUser.id,
            currentStreak: 0,
            highestStreak: 0,
            lastCompleteDay: null
        };
        
        allStreaks.push(userStreak);
        localStorage.setItem('streaks', JSON.stringify(allStreaks));
    }
    
    return userStreak;
}

// Update streak based on prayer completion
function updateStreak() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Get all prayers from storage
    const allPrayers = JSON.parse(localStorage.getItem('prayers') || '[]');
    
    // Filter prayers for current user and today
    const todayPrayers = allPrayers.filter(prayer => 
        prayer.userId === currentUser.id && 
        prayer.date === today
    );
    
    // Check if all prayers are completed
    const allCompleted = todayPrayers.length > 0 && 
                         todayPrayers.every(prayer => prayer.status === 'completed');
    
    // Get user streak
    const allStreaks = JSON.parse(localStorage.getItem('streaks') || '[]');
    const streakIndex = allStreaks.findIndex(streak => streak.userId === currentUser.id);
    
    if (streakIndex === -1) return;
    
    const userStreak = allStreaks[streakIndex];
    
    if (allCompleted) {
        // If last complete day was yesterday, increment streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        if (userStreak.lastCompleteDay === yesterdayString) {
            userStreak.currentStreak += 1;
        } 
        // If last complete day is today, do nothing
        else if (userStreak.lastCompleteDay === today) {
            // No change needed
        } 
        // Otherwise, reset streak to 1
        else {
            userStreak.currentStreak = 1;
        }
        
        userStreak.lastCompleteDay = today;
        
        // Update highest streak if needed
        if (userStreak.currentStreak > userStreak.highestStreak) {
            userStreak.highestStreak = userStreak.currentStreak;
        }
        
        // Save updated streak
        allStreaks[streakIndex] = userStreak;
        localStorage.setItem('streaks', JSON.stringify(allStreaks));
        
        // Update UI
        renderStreak();
    }
}

// Render streak in the dashboard
function renderStreak() {
    const currentStreakElement = document.getElementById('current-streak');
    const highestStreakElement = document.getElementById('highest-streak');
    
    if (!currentStreakElement || !highestStreakElement) return;
    
    const streak = getStreak();
    if (streak) {
        currentStreakElement.textContent = streak.currentStreak;
        highestStreakElement.textContent = streak.highestStreak;
    }
}

// Initialize streak
function initStreak() {
    renderStreak();
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initStreak);