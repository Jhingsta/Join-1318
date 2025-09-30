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
    if (!greetingElement) return;

    const greeting = getGreetingByTime();
    const userName = getCurrentUserName();

    if (userName === 'Guest') {
        greetingElement.className = 'greeting-time-guest';
        greetingElement.innerHTML = greeting;
    } else {
        greetingElement.className = 'greeting-time-user';
        greetingElement.innerHTML = `${greeting}, <span class="greeting-name-user">${userName}</span>`;
    }
}

// ---------------------------
// Tasks & Summary Helper-Funktionen
// ---------------------------

// Gibt eine Kopie des Task-Arrays zurück
function getTasksCopy(tasks) {
    return tasks.slice();
}

// ---------------------------
// Datum
// ---------------------------


// Zählt Tasks nach Status und Priorität
function getTaskStatistics(tasks) {
    return {
        total: tasks.length,
        urgent: tasks.filter(t => t.priority === "urgent").length,
        todo: tasks.filter(t => t.status === "todo").length,
        inProgress: tasks.filter(t => t.status === "inProgress").length,
        awaitFeedback: tasks.filter(t => t.status === "awaitFeedback").length,
        done: tasks.filter(t => t.status === "done").length,
    };
}

// Gibt die nächste URGENT Deadline zurück (oder null)
function getUpcomingUrgentDeadline(tasks) {
    const urgentWithDueDate = tasks
        .filter(t => t.priority === "urgent" && t.dueDate)  // Nur urgent Tasks mit Datum
        .map(t => ({ ...t, dueTime: new Date(t.dueDate).getTime() }))  // + Timestamp
        .filter(t => !isNaN(t.dueTime))  // Nur gültige Daten
        .sort((a, b) => a.dueTime - b.dueTime);  // Nach Datum sortieren
    return urgentWithDueDate[0] || null; // Erste = nächste Deadline
}

// Update der Summary-Counter im HTML
function updateSummaryCounters({ total, todo, inProgress, awaitFeedback, done, urgent }) {
    const urgentEl = document.querySelector(".summary-urgent");
    const totalEl = document.querySelector(".summary-total");
    const todoEl = document.querySelector(".summary-todo");
    const inProgressEl = document.querySelector(".summary-inprogress");
    const awaitingEl = document.querySelector(".summary-feedback");
    const doneEl = document.querySelector(".summary-done");

    if (urgentEl) urgentEl.textContent = urgent;
    if (totalEl) totalEl.textContent = total;
    if (todoEl) todoEl.textContent = todo;
    if (inProgressEl) inProgressEl.textContent = inProgress;
    if (awaitingEl) awaitingEl.textContent = awaitFeedback;
    if (doneEl) doneEl.textContent = done;
}

function initDate(deadlineDate = null, label = "Today") {
    const deadlineDateEl = document.getElementById("deadline-date");
    const deadlineLabelEl = document.getElementById("deadline-label");

    if (!deadlineDateEl || !deadlineLabelEl) return;

    const dateToShow = deadlineDate || new Date();
    deadlineDateEl.textContent = dateToShow.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    deadlineLabelEl.textContent = label;
}

// ---------------------------
// Tasks Summary Initialisierung
// ---------------------------

async function initTasksSummary() {
    try {
        const tasks = await loadTasks();
        const tasksCopy = getTasksCopy(tasks);
        
        // Statistiken berechnen und anzeigen
        const stats = getTaskStatistics(tasksCopy);
        updateSummaryCounters(stats);
        
        // Nächste URGENT Deadline bestimmen
        const nextUrgentDeadlineTask = getUpcomingUrgentDeadline(tasksCopy);
        
        const deadlineDateEl = document.getElementById("deadline-date");
        const deadlineLabelEl = document.getElementById("deadline-label");
        
        if (!deadlineDateEl || !deadlineLabelEl) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // heutiges Datum ohne Zeitanteil
        
        if (!nextUrgentDeadlineTask) {
            // Kein urgent Task mit Deadline vorhanden
            deadlineDateEl.textContent = today.toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
            deadlineLabelEl.textContent = "Today";
        } else {
            const dueDate = new Date(nextUrgentDeadlineTask.dueDate);
            deadlineDateEl.textContent = dueDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
            
            if (dueDate < today) {
                // Deadline liegt in der Vergangenheit
                deadlineLabelEl.textContent = "Expired Deadline";
            } else {
                // Deadline heute oder in der Zukunft
                deadlineLabelEl.textContent = "Upcoming Deadline";
            }
        }
    } catch (err) {
        console.error("Error loading tasks:", err);
    }
}

// ---------------------------
// Initialisierung nach HTML Include
// ---------------------------

w3.includeHTML(async () => {
    updateGreeting();
    await initTasksSummary();
});