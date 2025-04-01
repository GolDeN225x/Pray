// Register form handler
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validate form
            if (password !== confirmPassword) {
                showFlashMessage('كلمات المرور غير متطابقة', 'error');
                return;
            }
            
            // Get existing users
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // Check if email already exists
            if (users.some(user => user.email === email)) {
                showFlashMessage('البريد الإلكتروني مستخدم بالفعل', 'error');
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
            
            // Add user to array
            users.push(newUser);
            
            // Save to localStorage
            localStorage.setItem('users', JSON.stringify(users));
            
            // Set current user
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        });
    }
    
    // Function to show flash message
    function showFlashMessage(message, type) {
        const flashMessages = document.getElementById('flash-messages');
        
        if (flashMessages) {
            flashMessages.innerHTML = `<div class="flash-message ${type}">${message}</div>`;
            
            // Clear message after 3 seconds
            setTimeout(() => {
                flashMessages.innerHTML = '';
            }, 3000);
        }
    }
});