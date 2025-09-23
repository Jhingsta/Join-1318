// Zeigt Welcome Animation nur nach frischem Login (Mobile Only)
function initSummaryAnimation() {
    // Prüfen ob Animation gezeigt werden soll
    const shouldAnimate = sessionStorage.getItem('showSummaryAnimation');
    const isMobile = window.innerWidth <= 768;
    
    if (!shouldAnimate || !isMobile) {
        // Keine Animation - Content normal anzeigen
        showContentDirectly();
        return;
    }
    
    // Animation starten
    startWelcomeAnimation();
    
    // Flag entfernen damit Animation nicht nochmal läuft
    sessionStorage.removeItem('showSummaryAnimation');
}

function showContentDirectly() {
    const contentWrapper = document.querySelector('.main-content-wrapper');
    if (contentWrapper) {
        contentWrapper.style.opacity = '1';
        contentWrapper.style.transform = 'translateY(0)';
    }
}

function startWelcomeAnimation() {
    const overlay = document.getElementById('animation-overlay');
    const greetingText = document.getElementById('greeting-animation-text');
    const contentWrapper = document.querySelector('.main-content-wrapper');
    
    if (!overlay || !greetingText || !contentWrapper) {
        console.warn('Animation elements not found, showing content directly');
        showContentDirectly();
        return;
    }
    
    // Greeting Text setzen (gleiche Logik wie in summary.js)
    updateAnimationGreeting(greetingText);
    
    // Overlay anzeigen
    overlay.classList.add('show');
    
    // Nach 1.5 Sekunden: Overlay ausblenden und Content einblenden
    setTimeout(() => {
        // Overlay fade-out starten
        overlay.classList.add('fade-out');
        
        // Content slide-in starten
        contentWrapper.classList.add('slide-in');
        
        // Nach fade-out Animation: Overlay komplett verstecken
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300); // 0.3s = fadeOut animation duration
        
    }, 1500); // 1.5 Sekunden Greeting anzeigen
}

function updateAnimationGreeting(greetingElement) {
    const greeting = getGreetingByTime();
    const userName = getCurrentUserName();
    
    if (userName === 'Guest') {
        greetingElement.className = 'greeting-time-guest';
        greetingElement.innerHTML = greeting;
    } else {
        greetingElement.className = 'greeting-time-user';
        greetingElement.innerHTML = `
            <div>${greeting}</div>
            <div class="greeting-name-user">${userName}</div>
        `;
    }
}

// Kein EventListener - direkt ausführen
initSummaryAnimation();