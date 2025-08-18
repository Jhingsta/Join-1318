const BASE_URL = "https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Simple task manager that provides CRUD operations and summary helpers
 * over Firebase Realtime Database using REST API.
 */
(function initializeTaskManager() {
  const state = {
    tasks: [], // Array of { id, title, description, status, priority, dueDate, subtasks }
    isLoaded: false,
  };

  function firebaseObjectToArray(object) {
    if (!object) return [];
    const items = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        items.push({ id: key, ...object[key] });
      }
    }
    return items;
  }

  async function loadTasks() {
    try {
      const response = await fetch(`${BASE_URL}tasks.json`);
      const data = await response.json();
      state.tasks = firebaseObjectToArray(data);
      state.isLoaded = true;
      return state.tasks;
    } catch (error) {
      console.error("Error loading tasks:", error);
      state.tasks = [];
      state.isLoaded = false;
      return [];
    }
  }

  async function createTask(taskData) {
    const defaultTask = {
      title: "",
      description: "",
      status: "todo", // todo | inProgress | awaitingFeedback | done
      priority: "medium", // low | medium | urgent
      dueDate: "",
      subtasks: { completed: 0, total: 0 },
      assignedTo: [],
      createdAt: new Date().toISOString(),
    };

    const payload = { ...defaultTask, ...taskData };

    try {
      const response = await fetch(`${BASE_URL}tasks.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const newTask = { id: result.name, ...payload };
      state.tasks.push(newTask);
      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  async function updateTask(taskId, updates) {
    try {
      const response = await fetch(`${BASE_URL}tasks/${taskId}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      // Update local state
      state.tasks = state.tasks.map(t => (t.id === taskId ? { ...t, ...updates } : t));
      return state.tasks.find(t => t.id === taskId) || null;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  async function deleteTask(taskId) {
    try {
      const response = await fetch(`${BASE_URL}tasks/${taskId}.json`, { method: "DELETE" });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      state.tasks = state.tasks.filter(t => t.id !== taskId);
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  function getTasks() {
    return state.tasks.slice();
  }

  function getTaskStatistics() {
    const stats = {
      total: state.tasks.length,
      urgent: state.tasks.filter(t => t.priority === "urgent").length,
      todo: state.tasks.filter(t => t.status === "todo").length,
      inProgress: state.tasks.filter(t => t.status === "inProgress").length,
      awaitingFeedback: state.tasks.filter(t => t.status === "awaitingFeedback").length,
      done: state.tasks.filter(t => t.status === "done").length,
    };
    return stats;
  }

  function getUpcomingDeadline() {
    const withDueDate = state.tasks
      .filter(t => t.dueDate)
      .map(t => ({ ...t, dueTime: new Date(t.dueDate).getTime() }))
      .filter(t => !isNaN(t.dueTime))
      .sort((a, b) => a.dueTime - b.dueTime);
    return withDueDate[0] || null;
  }

  window.taskManager = {
    loadTasks,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskStatistics,
    getUpcomingDeadline,
  };
})();


