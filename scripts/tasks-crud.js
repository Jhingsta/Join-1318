const BASE_URL = "https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/";

async function loadTasks() {
  try {
      const response = await fetch(`${BASE_URL}tasks.json`);
      const data = await response.json();
      // Umwandlung in Array mit id-Feld
      const tasks = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      return tasks;
  } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
  }
}

async function createTask(taskData) {
  const defaultTask = {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    subtasks: { completed: 0, total: 0 },
    assignedUsersFull: [],
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
    return newTask; // Rückgabe der neuen Task, Aufrufer verwaltet Liste
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

    return { id: taskId, ...updates }; // Aufrufer aktualisiert seine Task-Liste
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

async function deleteTask(taskId) {
  try {
    const response = await fetch(`${BASE_URL}tasks/${taskId}.json`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return true; // Aufrufer entfernt Task selbst aus seiner Liste
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}