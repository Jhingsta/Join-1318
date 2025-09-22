// ---------------------------
// Greeting-Funktionen
// ---------------------------

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
        
        // NEU: Prüfung ob Guest oder normaler User
        if (userName === 'Guest') {
            // NEU: Für Gäste nur Tageszeit-Gruß ohne Namen und entsprechende CSS-Klasse
            greetingElement.className = 'greeting-time-guest';
            greetingElement.innerHTML = greeting;
        } else {
            // NEU: Für normale User mit Komma, Namen und entsprechende CSS-Klassen
            greetingElement.className = 'greeting-time-user';
            greetingElement.innerHTML = `${greeting}, <span class="greeting-name-user">${userName}</span>`;
        }
    }
}

// ---------------------------
// Tasks & Summary Counter aus Firebase + aktuelles Datum
// ---------------------------

w3.includeHTML(async () => {
    // 1. Greeting setzen
    updateGreeting();

    // 2. Tasks laden
    try {
        const res = await fetch("https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/tasks.json");
        const data = await res.json();
        const tasks = data ? Object.values(data) : [];

        // 3. Zähler initialisieren
        let total = tasks.length;
        let todo = 0, inProgress = 0, awaiting = 0, done = 0, urgent = 0;

        tasks.forEach(task => {
            switch (task.status) {
                case "todo": todo++; break;
                case "inProgress": inProgress++; break;
                case "awaitFeedback": awaiting++; break;
                case "done": done++; break;
            }
            if (task.priority === "urgent") urgent++;
        });

        // 4. Zähler ins HTML setzen
        document.querySelector(".middle-row-left-left-top span").textContent = urgent;
        document.querySelector(".middle-row-right-top span").textContent = total;
        document.querySelector(".bottom-row-type-1-top span").textContent = todo;

        const bottomRow2 = document.querySelectorAll(".bottom-row-type-2-top span");
        bottomRow2[0].textContent = inProgress;
        bottomRow2[1].textContent = awaiting;
        bottomRow2[2].textContent = done;

    } catch (err) {
        console.error("Fehler beim Laden der Tasks:", err);
    }

    // 5. Datum setzen (immer heutiges Datum)
    const deadlineDateEl = document.getElementById("deadline-date");
    const deadlineLabelEl = document.getElementById("deadline-label");

    if (deadlineDateEl && deadlineLabelEl) {
        const today = new Date();
        // Englisches Langformat: "October 16, 2022"
        deadlineDateEl.textContent = today.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
        deadlineLabelEl.textContent = "Today";
    }
});
