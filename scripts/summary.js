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

// Zählt Tasks nach Status und Priorität
function getTaskStatistics(tasks) {
    return {
        total: tasks.length,
        urgent: tasks.filter(t => t.priority === "urgent").length,
        todo: tasks.filter(t => t.status === "todo").length,
        inProgress: tasks.filter(t => t.status === "inProgress").length,
        awaitingFeedback: tasks.filter(t => t.status === "awaitingFeedback").length,
        done: tasks.filter(t => t.status === "done").length,
    };
}

// Gibt die nächste Deadline zurück (oder null)
function getUpcomingDeadline(tasks) {
    const withDueDate = tasks
        .filter(t => t.dueDate)  // Nur Tasks mit Datum
        .map(t => ({ ...t, dueTime: new Date(t.dueDate).getTime() }))  // + Timestamp
        .filter(t => !isNaN(t.dueTime))  // Nur gültige Daten
        .sort((a, b) => a.dueTime - b.dueTime);  // Nach Datum sortieren
    return withDueDate[0] || null; // Erste = nächste Deadline
}

// Update der Summary-Counter im HTML
function updateSummaryCounters({ total, todo, inProgress, awaitingFeedback, done, urgent }) {
    document.querySelector(".middle-row-left-left-top span").textContent = urgent;
    document.querySelector(".middle-row-right-top span").textContent = total;
    document.querySelector(".bottom-row-type-1-top span").textContent = todo;

    const bottomRow2 = document.querySelectorAll(".bottom-row-type-2-top span");
    bottomRow2[0].textContent = inProgress;
    bottomRow2[1].textContent = awaitingFeedback;
    bottomRow2[2].textContent = done;
}

// ---------------------------
// Datum
// ---------------------------

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

        const stats = getTaskStatistics(tasksCopy);
        updateSummaryCounters(stats);

        const nextDeadlineTask = getUpcomingDeadline(tasksCopy);
        if (nextDeadlineTask) {
            initDate(new Date(nextDeadlineTask.dueDate), "Next Due");
        } else {
            initDate(); // falls keine Deadline vorhanden, heutiges Datum
        }

    } catch (err) {
        console.error("Fehler beim Laden der Tasks:", err);
    }
}

// ---------------------------
// Initialisierung nach HTML Include
// ---------------------------

w3.includeHTML(async () => {
    updateGreeting();
    await initTasksSummary();
});
