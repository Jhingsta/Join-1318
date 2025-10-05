/**
 * Initializes the summary welcome animation for mobile devices.
 * 
 * Displays the welcome animation only after a fresh login
 * and only on mobile screens (≤768px width). If the animation
 * has already been shown or the user is on desktop, the main
 * content is shown immediately.
 */
function initSummaryAnimation() {
    let shouldAnimate = sessionStorage.getItem('showSummaryAnimation');
    let isMobile = window.innerWidth <= 768;
    
    if (!shouldAnimate || !isMobile) {
        showContentDirectly();
        return;
    }
    
    startWelcomeAnimation();
    sessionStorage.removeItem('showSummaryAnimation');
}

/**
 * Displays the main content immediately, bypassing any animation.
 */
function showContentDirectly() {
    let contentWrapper = document.querySelector('.main-content-wrapper');
    if (contentWrapper) {
        contentWrapper.style.opacity = '1';
        contentWrapper.style.transform = 'translateY(0)';
    }
}

/**
 * Initializes and starts the welcome animation sequence.
 *
 * Checks if all required elements exist in the DOM. If not, 
 * the content is displayed directly. Otherwise, the greeting 
 * is updated and the animation sequence begins.
 */
function startWelcomeAnimation() {
    const overlay = document.getElementById('animation-overlay');
    const greetingText = document.getElementById('greeting-animation-text');
    const contentWrapper = document.querySelector('.main-content-wrapper');
    
    if (!overlay || !greetingText || !contentWrapper) {
        console.warn('Animation elements not found, showing content directly');
        showContentDirectly();
        return;
    }
    
    updateAnimationGreeting(greetingText);
    overlay.classList.add('show');
    runAnimationSequence(overlay, contentWrapper);
}

/**
 * Handles the timed animation sequence for the welcome overlay.
 *
 * Fades out the overlay after 1.5 seconds, slides in the main content,
 * and completely hides the overlay after the fade-out transition ends.
 *
 * @param {HTMLElement} overlay
 * @param {HTMLElement} contentWrapper
 */
function runAnimationSequence(overlay, contentWrapper) {
    setTimeout(() => {
        overlay.classList.add('fade-out');
        contentWrapper.classList.add('slide-in');
        
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }, 1500);
}

/**
 * Updates the greeting text displayed during the welcome animation.
 *
 * Chooses the greeting message based on the current time and user name.
 * If the user is a guest, only a generic greeting is shown.
 *
 * @param {HTMLElement} greetingElement - The DOM element where the greeting will be displayed.
 */
function updateAnimationGreeting(greetingElement) {
    let greeting = getGreetingByTime();
    let userName = getCurrentUserName();
    
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

// Execute immediately after page load
initSummaryAnimation();