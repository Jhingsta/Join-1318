// ===== POST-LOGIN ANIMATION + GREETING =====

// 1. Animation Trigger (läuft sofort beim Script-Load)
if (sessionStorage.getItem('showSummaryAnimation') === 'true') {
    // Warten bis Body existiert
    if (document.body) {
        // Body bereits da
        document.body.setAttribute('data-summary-animate', 'true');
    } else {
        // Body noch nicht da - warten
        document.addEventListener('DOMContentLoaded', function() {
            document.body.setAttribute('data-summary-animate', 'true');
        });
    }
    
    sessionStorage.removeItem('showSummaryAnimation');
    
    // Cleanup nach Animation
    setTimeout(() => {
        if (document.body) {
            document.body.removeAttribute('data-summary-animate');
        }
    }, 4100);
}

// 2. Greeting Funktionen (immer verfügbar)
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

// 3. Greeting setzen (für Animation oder normal)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateGreeting);
} else {
    updateGreeting();
}