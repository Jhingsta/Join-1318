// Function to get greeting based on time of day
function getGreetingByTime() {
  const hour = new Date().getHours();
  let greeting = '';
  
  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning';
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Good afternoon';
  } else if (hour >= 18 && hour < 22) {
    greeting = 'Good evening';
  } else {
    greeting = 'Good night';
  }
  
  return greeting;
}

// Function to format date for display
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options = { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  };
  
  return date.toLocaleDateString('en-US', options);
}

// Function to update summary statistics
function updateSummaryStatistics() {
  if (!window.taskManager) {
    console.log('Task manager not loaded yet, retrying...');
    setTimeout(updateSummaryStatistics, 100);
    return;
  }

  const stats = window.taskManager.getTaskStatistics();
  const upcomingDeadline = window.taskManager.getUpcomingDeadline();
  
  // Update urgent tasks count
  const urgentTasksElement = document.querySelector('.middle-row-left-left-top span');
  if (urgentTasksElement) {
    urgentTasksElement.textContent = stats.urgent;
  }
  
  // Update upcoming deadline
  const deadlineDateElement = document.querySelector('.middle-row-left-right-top');
  const deadlineTextElement = document.querySelector('.middle-row-left-right-bottom');
  if (deadlineDateElement && deadlineTextElement) {
    if (upcomingDeadline) {
      deadlineDateElement.textContent = formatDate(upcomingDeadline.dueDate);
      deadlineTextElement.textContent = upcomingDeadline.title;
    } else {
      deadlineDateElement.textContent = 'No upcoming deadlines';
      deadlineTextElement.textContent = 'All caught up!';
    }
  }
  
  // Update total tasks in board
  const totalTasksElement = document.querySelector('.middle-row-right-top span');
  if (totalTasksElement) {
    totalTasksElement.textContent = stats.total;
  }
  
  // Update todo tasks count
  const todoTasksElement = document.querySelector('.bottom-row-type-1-top span');
  if (todoTasksElement) {
    todoTasksElement.textContent = stats.todo;
  }
  
  // Update in-progress tasks count
  const inProgressTasksElement = document.querySelector('.bottom-row-type-2-top span');
  if (inProgressTasksElement) {
    inProgressTasksElement.textContent = stats.inProgress;
  }
  
  // Update awaiting feedback tasks count
  const awaitingFeedbackElement = document.querySelectorAll('.bottom-row-type-2-top span')[1];
  if (awaitingFeedbackElement) {
    awaitingFeedbackElement.textContent = stats.awaitingFeedback;
  }
  
  // Update done tasks count
  const doneTasksElement = document.querySelectorAll('.bottom-row-type-2-top span')[2];
  if (doneTasksElement) {
    doneTasksElement.textContent = stats.done;
  }
}

// Function to update user name from localStorage
function updateUserName() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const greetingNameElement = document.querySelector('.greeting-name');
  
  if (currentUser && currentUser.name && greetingNameElement) {
    greetingNameElement.textContent = currentUser.name;
  }
}

// Function to get current user name from localStorage
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

// Function to update greeting with current user name
function updateGreeting() {
  const greetingElement = document.getElementById('greeting-time');
  if (greetingElement) {
    const greeting = getGreetingByTime();
    const userName = getCurrentUserName();
    greetingElement.innerHTML = `${greeting}, <span class="greeting-name">${userName}</span>`;
  }
}

// Function to refresh summary data
async function refreshSummaryData() {
  if (window.taskManager) {
    await window.taskManager.loadTasks();
    updateSummaryStatistics();
  }
}

// Update greeting and summary when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Update greeting
  updateGreeting();
  
  // Update user name
  updateUserName();
  
  // Wait for task manager to load, then update statistics
  setTimeout(() => {
    updateSummaryStatistics();
  }, 500);
  
  // Add refresh functionality to the urgent tasks section
  const urgentTasksSection = document.querySelector('.middle-row-left');
  if (urgentTasksSection) {
    urgentTasksSection.addEventListener('click', () => {
      // Navigate to board page
      window.location.href = './board.html';
    });
  }
});

// Refresh data every 30 seconds to keep summary up to date
setInterval(refreshSummaryData, 30000);
