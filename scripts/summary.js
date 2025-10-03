// ---------------------------
// Greeting Functions
// ---------------------------

/**
 * Returns a greeting based on the current time.
 */
function getGreetingByTime() {
  let hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  if (hour >= 18 && hour < 22) return 'Good evening';
  return 'Good night';
}

/**
 * Retrieves the current user's name from localStorage.
 */
function getCurrentUserName() {
  try {
    let currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      let userData = JSON.parse(currentUser);
      return userData.name || 'Guest';
    }
    return 'Guest';
  } catch (error) {
    console.error('Error getting user name:', error);
    return 'Guest';
  }
}

/**
 * Updates the greeting message in the HTML.
 */
function updateGreeting() {
  let greetingElement = document.getElementById('greeting-time');
  if (!greetingElement) return;

  let greeting = getGreetingByTime();
  let userName = getCurrentUserName();

  greetingElement.className = userName === 'Guest' ? 'greeting-time-guest' : 'greeting-time-user';
  greetingElement.innerHTML = userName === 'Guest' ? greeting : `${greeting}, <span class="greeting-name-user">${userName}</span>`;
}

// ---------------------------
// Tasks & Summary Helper Functions
// ---------------------------

/**
 * Returns a copy of the tasks array.
 * @param {Array} tasks - The tasks array.
 */
function getTasksCopy(tasks) {
  return tasks.slice();
}

/**
 * Calculates task statistics based on their status and priority.
 * @param {Array} tasks - The tasks array.
 */
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

/**
 * Finds the next urgent task deadline.
 * @param {Array} tasks - The tasks array.
 */
function getUpcomingUrgentDeadline(tasks) {
  let urgentWithDueDate = tasks
    .filter(t => t.priority === "urgent" && t.dueDate)
    .map(t => ({ ...t, dueTime: new Date(t.dueDate).getTime() }))
    .filter(t => !isNaN(t.dueTime))
    .sort((a, b) => a.dueTime - b.dueTime);
  return urgentWithDueDate[0] || null;
}

/**
 * Updates the summary counters in the HTML.
 * @param {Object} stats - The task statistics object.
 */
function updateSummaryCounters({ total, todo, inProgress, awaitFeedback, done, urgent }) {
  let elements = {
    urgent: document.querySelector(".summary-urgent"),
    total: document.querySelector(".summary-total"),
    todo: document.querySelector(".summary-todo"),
    inProgress: document.querySelector(".summary-inprogress"),
    awaitFeedback: document.querySelector(".summary-feedback"),
    done: document.querySelector(".summary-done"),
  };

  if (elements.urgent) elements.urgent.textContent = urgent;
  if (elements.total) elements.total.textContent = total;
  if (elements.todo) elements.todo.textContent = todo;
  if (elements.inProgress) elements.inProgress.textContent = inProgress;
  if (elements.awaitFeedback) elements.awaitFeedback.textContent = awaitFeedback;
  if (elements.done) elements.done.textContent = done;
}

/**
 * Initializes the date display in the HTML.
 * @param {Date|null} deadlineDate - The deadline date to display.
 * @param {string} label - The label for the date.
 */
function initDate(deadlineDate = null, label = "Today") {
  let deadlineDateEl = document.getElementById("deadline-date");
  let deadlineLabelEl = document.getElementById("deadline-label");

  if (!deadlineDateEl || !deadlineLabelEl) return;

  let dateToShow = deadlineDate || new Date();
  deadlineDateEl.textContent = dateToShow.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  deadlineLabelEl.textContent = label;
}

// ---------------------------
// Tasks Summary Initialization
// ---------------------------

/**
 * Initializes the task summary by loading tasks and updating the UI.
 */
async function initTasksSummary() {
  try {
    let tasks = await loadTasks();
    let stats = getTaskStatistics(getTasksCopy(tasks));
    updateSummaryCounters(stats);

    let nextUrgentDeadlineTask = getUpcomingUrgentDeadline(tasks);
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let { dueDate, label } = getDeadlineInfo(nextUrgentDeadlineTask, today);
    initDate(dueDate, label);
  } catch (err) {
    console.error("Error loading tasks:", err);
  }
}

/**
 * Determines the deadline date and label based on the next urgent task.
 * @param {Object|null} nextUrgentDeadlineTask - The next urgent task with a deadline.
 * @param {Date} today - Today's date.
 */
function getDeadlineInfo(nextUrgentDeadlineTask, today) {
  if (!nextUrgentDeadlineTask) {
    return { dueDate: today, label: "Today" };
  }
  let dueDate = new Date(nextUrgentDeadlineTask.dueDate);
  let label = dueDate < today ? "Expired Deadline" : "Upcoming Deadline";
  return { dueDate, label };
}

// ---------------------------
// Initialization after HTML Include
// ---------------------------

/**
 * Initializes the summary page after HTML is included.
 */
w3.includeHTML(async () => {
  updateGreeting();
  await initTasksSummary();
});