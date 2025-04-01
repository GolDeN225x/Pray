// Goals functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // DOM elements
    const editGoalBtns = document.querySelectorAll('.edit-goal-btn');
    const editGoalModal = document.getElementById('edit-goal-modal');
    const editGoalForm = document.getElementById('edit-goal-form');
    const goalTypeInput = document.getElementById('goal-type');
    const goalValueInput = document.getElementById('goal-value');
    const goalPeriodInput = document.getElementById('goal-period');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    // Progress elements
    const prayersProgressFill = document.getElementById('prayers-progress-fill');
    const prayersProgressText = document.getElementById('prayers-progress-text');
    const prayersProgressPercent = document.getElementById('prayers-progress-percent');
    const adhkarProgressFill = document.getElementById('adhkar-progress-fill');
    const adhkarProgressText = document.getElementById('adhkar-progress-text');
    const adhkarProgressPercent = document.getElementById('adhkar-progress-percent');
    
    // Load and display goals
    loadGoals();
    
    // Event listeners
    editGoalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const goalType = this.getAttribute('data-type');
            openEditGoalModal(goalType);
        });
    });
    
    editGoalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveGoal();
    });
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            editGoalModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === editGoalModal) {
            editGoalModal.style.display = 'none';
        }
    });
    
    // Function to load goals
    function loadGoals() {
        // Get user goals from localStorage
        const userGoals = JSON.parse(localStorage.getItem(`goals_${currentUser.id}`)) || {
            prayers: { value: 5, period: 'daily' },
            adhkar: { value: 3, period: 'daily' }
        };
        
        // Update progress for prayers
        updatePrayersProgress(userGoals.prayers);
        
        // Update progress for adhkar
        updateAdhkarProgress(userGoals.adhkar);
    }
    
    // Function to open edit goal modal
    function openEditGoalModal(goalType) {
        // Get user goals
        const userGoals = JSON.parse(localStorage.getItem(`goals_${currentUser.id}`)) || {
            prayers: { value: 5, period: 'daily' },
            adhkar: { value: 3, period: 'daily' }
        };
        
        // Set form values
        goalTypeInput.value = goalType;
        goalValueInput.value = userGoals[goalType].value;
        goalPeriodInput.value = userGoals[goalType].period;
        
        // Show modal
        editGoalModal.style.display = 'block';
    }
    
    // Function to save goal
    function saveGoal() {
        const goalType = goalTypeInput.value;
        const goalValue = parseInt(goalValueInput.value);
        const goalPeriod = goalPeriodInput.value;
        
        // Validate input
        if (isNaN(goalValue) || goalValue < 1) {
            alert('الرجاء إدخال قيمة صحيحة للهدف');
            return;
        }
        
        // Get user goals
        const userGoals = JSON.parse(localStorage.getItem(`goals_${currentUser.id}`)) || {
            prayers: { value: 5, period: 'daily' },
            adhkar: { value: 3, period: 'daily' }
        };
        
        // Update goal
        userGoals[goalType] = {
            value: goalValue,
            period: goalPeriod
        };
        
        // Save to localStorage
        localStorage.setItem(`goals_${currentUser.id}`, JSON.stringify(userGoals));
        
        // Update progress
        if (goalType === 'prayers') {
            updatePrayersProgress(userGoals.prayers);
        } else if (goalType === 'adhkar') {
            updateAdhkarProgress(userGoals.adhkar);
        }
        
        // Close modal
        editGoalModal.style.display = 'none';
    }
    
    // Function to update prayers progress
    function updatePrayersProgress(goal) {
        // Get prayer data
        const prayerData = getUserPrayerData(currentUser.id, goal.period);
        const total = prayerData.total;
        const target = goal.value;
        
        // Calculate percentage
        const percentage = Math.min(Math.round((total / target) * 100), 100);
        
        // Update UI
        prayersProgressFill.style.width = `${percentage}%`;
        prayersProgressText.textContent = `${total}/${target}`;
        prayersProgressPercent.textContent = `${percentage}%`;
    }
    
    // Function to update adhkar progress
    function updateAdhkarProgress(goal) {
        // Get adhkar data
        const adhkarData = getUserAdhkarData(currentUser.id, goal.period);
        const total = adhkarData.total;
        const target = goal.value;
        
        // Calculate percentage
        const percentage = Math.min(Math.round((total / target) * 100), 100);
        
        // Update UI
        adhkarProgressFill.style.width = `${percentage}%`;
        adhkarProgressText.textContent = `${total}/${target}`;
        adhkarProgressPercent.textContent = `${percentage}%`;
    }
    
    // Function to get user prayer data for a specific period
    function getUserPrayerData(userId, period) {
        // Get current date
        const now = new Date();
        let startDate;
        
        // Determine start date based on period
        if (period === 'daily') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (period === 'weekly') {
            const day = now.getDay() || 7; // Convert Sunday (0) to 7
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
        } else if (period === 'monthly') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        
        // Get all tracked prayers
        const trackedPrayers = JSON.parse(localStorage.getItem('tracked_prayers') || '[]');
        
        // Filter prayers by user and period
        const userPrayers = trackedPrayers.filter(prayer => {
            const prayerDate = new Date(prayer.timestamp);
            return prayer.userId === userId && prayerDate >= startDate;
        });
        
        // Get prayers data object
        const prayersData = JSON.parse(localStorage.getItem('prayers_data') || '{}');
        const userPrayersData = prayersData[userId] || {};
        
        // Count prayers from prayers data
        let dataCount = 0;
        for (const dateKey in userPrayersData) {
            const date = new Date(dateKey);
            if (date >= startDate) {
                const dayData = userPrayersData[dateKey];
                for (const prayer in dayData) {
                    if (dayData[prayer] && typeof dayData[prayer] === 'object') {
                        dataCount++;
                    }
                }
            }
        }
        
        return {
            total: userPrayers.length + dataCount
        };
    }
    
    // Function to get user adhkar data for a specific period
    function getUserAdhkarData(userId, period) {
        // Get current date
        const now = new Date();
        let startDate;
        
        // Determine start date based on period
        if (period === 'daily') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (period === 'weekly') {
            const day = now.getDay() || 7; // Convert Sunday (0) to 7
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
        } else if (period === 'monthly') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        
        // Get all tracked adhkar
        const trackedAdhkar = JSON.parse(localStorage.getItem('tracked_adhkar') || '[]');
        
        // Filter adhkar by user and period
        const userAdhkar = trackedAdhkar.filter(adhkar => {
            const adhkarDate = new Date(adhkar.timestamp);
            return adhkar.userId === userId && adhkarDate >= startDate;
        });
        
        // Get adhkar data object
        const adhkarData = JSON.parse(localStorage.getItem('adhkar_data') || '{}');
        const userAdhkarData = adhkarData[userId] || {};
        
        // Count adhkar from adhkar data
        let dataCount = 0;
        for (const dateKey in userAdhkarData) {
            const date = new Date(dateKey);
            if (date >= startDate) {
                const dayData = userAdhkarData[dateKey];
                if (Array.isArray(dayData)) {
                    dataCount += dayData.length;
                } else {
                    for (const adhkarType in dayData) {
                        if (Array.isArray(dayData[adhkarType])) {
                            dataCount += dayData[adhkarType].length;
                        } else if (typeof dayData[adhkarType] === 'number') {
                            dataCount += dayData[adhkarType];
                        }
                    }
                }
            }
        }
        
        return {
            total: userAdhkar.length + dataCount
        };
    }
});