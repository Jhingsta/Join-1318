const BASE_URL = "https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Loads all tasks from the Firebase database.
 */
async function loadTasks() {
  try {
    let response = await fetch(`${BASE_URL}tasks.json`);
    let data = await response.json();
    return data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
  } catch (error) {
    console.error("Error loading tasks:", error);
    return [];
  }
}

/**
 * Creates a new task in the Firebase database.
 * @param {Object} taskData - The data for the new task.
 */
async function createTask(taskData) {
  const payload = prepareTaskPayload(taskData);

  try {
    const response = await fetch(`${BASE_URL}tasks.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    const result = await response.json();
    return { id: result.name, ...payload };
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

/**
 * Prepares the task payload by merging default values and processing subtasks.
 * @param {Object} taskData - The data for the new task.
 */
function prepareTaskPayload(taskData) {
  const defaultTask = {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    category: null,
    assignedUsersFull: [],
    createdAt: new Date().toISOString(),
    subtasks: { total: 0, completed: 0, items: [] },
  };

  const processedSubtasks = processSubtasks(taskData.subtasks);
  return { ...defaultTask, ...taskData, subtasks: processedSubtasks };
}

/**
 * Updates an existing task in the Firebase database.
 * @param {string} taskId - The ID of the task to update.
 * @param {Object} updates - The updates to apply to the task.
 */
async function updateTask(taskId, updates) {
  try {
    const updatedTask = prepareUpdatedTask(taskId, updates);

    const response = await fetch(`${BASE_URL}tasks/${taskId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    return updates;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

/**
 * Prepares the updated task by merging current task data and updates.
 * @param {string} taskId - The ID of the task to update.
 * @param {Object} updates - The updates to apply to the task.
 */
async function prepareUpdatedTask(taskId, updates) {
  const currentTask = await fetchTask(taskId);
  const updatedTask = { ...currentTask, ...updates };

  if (updates.subtasks) {
    updatedTask.subtasks = processSubtasks(updates.subtasks);
  }

  return updatedTask;
}

/**
 * Deletes a task from the Firebase database.
 * @param {string} taskId - The ID of the task to delete.
 */
async function deleteTask(taskId) {
  try {
    let response = await fetch(`${BASE_URL}tasks/${taskId}.json`, { method: "DELETE" });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    return true;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}

/**
 * Processes subtasks to ensure consistent formatting.
 * @param {Array} subtasks - The subtasks to process.
 */
function processSubtasks(subtasks = []) {
  let items = subtasks.map((st, i) => {
    if (typeof st === "string" && st.trim() !== "") {
      return { title: st.trim(), done: false };
    } else if (st?.title?.trim()) {
      return { title: st.title.trim(), done: st.done || false };
    }
    return { title: `Subtask ${i + 1}`, done: false };
  });

  return {
    total: items.length,
    completed: items.filter(st => st.done).length,
    items,
  };
}

/**
 * Fetches a task by its ID from the Firebase database.
 * @param {string} taskId - The ID of the task to fetch.
 */
async function fetchTask(taskId) {
  let response = await fetch(`${BASE_URL}tasks/${taskId}.json`);
  if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to load task`);
  let task = await response.json();
  if (!task) throw new Error("Task not found");
  return task;
}