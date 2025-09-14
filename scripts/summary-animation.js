// ===== POST-LOGIN ANIMATION + GREETING =====

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Animation Trigger
    if (sessionStorage.getItem('showSummaryAnimation') === 'true') {
        document.body.setAttribute('data-summary-animate', 'true');
        sessionStorage.removeItem('showSummaryAnimation');
        
        // Cleanup nach Animation
        setTimeout(() => {
            document.body.removeAttribute('data-summary-animate');
        }, 4100);
    }
    
    // 2. Greeting setzen (immer)
    updateGreeting();
});

// Greeting Funktionen (immer verfügbar, auch außerhalb DOMContentLoaded)
function getGreetingByTime() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    if (hour >= 18 && hour < 22) return 'Good evening';
    return 'Good night';
}

function getCurrentUserName() {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const userData = JSON.parse(currentUser);
            return userData.name || 'Guest';
        }
        return 'Guest';
    } catch (error) {
        console.error('Error getting user name:', error);
        return 'Guest';
    }
}

function updateGreeting() {
    const greetingElement = document.getElementById('greeting-time');
    if (greetingElement) {
        const greeting = getGreetingByTime();
        const userName = getCurrentUserName();
        greetingElement.innerHTML = `${greeting}, <span class="greeting-name">${userName}</span>`;
    }
}