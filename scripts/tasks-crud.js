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
    status: "todo", // Standardstatus
    priority: "medium",
    dueDate: "",
    category: null,
    assignedUsersFull: [],
    createdAt: new Date().toISOString(),
    subtasks: { total: 0, completed: 0, items: [] },
  };

  // Robuste Subtask-Verarbeitung (Strings oder Objekte erlaubt)
  const processedSubtasks = Array.isArray(taskData.subtasks)
    ? taskData.subtasks.map((st, i) => {
        if (typeof st === "string" && st.trim() !== "") {
          return { title: st.trim(), done: false };
        } else if (st && st.title && st.title.trim() !== "") {
          return { title: st.title.trim(), done: st.done || false };
        } else {
          return { title: `Subtask ${i + 1}`, done: false };
        }
      })
    : [];

  const payload = {
    ...defaultTask,
    ...taskData,
    subtasks: {
      total: processedSubtasks.length,
      completed: processedSubtasks.filter(st => st.done).length,
      items: processedSubtasks,
    },
  };

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
    return newTask; // Fertiges Objekt mit ID zurückgeben
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

async function updateTask(taskId, updates) {
  try {
    // 1. Zuerst die aktuelle Task laden
    const response = await fetch(`${BASE_URL}tasks/${taskId}.json`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to load task`);
    }
    
    const currentTask = await response.json();
    if (!currentTask) {
      throw new Error('Task not found');
    }
    
    // 2. Updates auf die aktuelle Task anwenden
    const updatedTask = { ...currentTask, ...updates };
    
    // 3. Spezielle Behandlung für Subtasks falls nötig
    if (updates.subtasks && Array.isArray(updates.subtasks)) {
      const processedSubtasks = updates.subtasks.map((st, i) => {
        if (typeof st === "string" && st.trim() !== "") {
          return { title: st.trim(), done: false };
        } else if (st && st.title && st.title.trim() !== "") {
          return { title: st.title.trim(), done: st.done || false };
        } else {
          return { title: `Subtask ${i + 1}`, done: false };
        }
      });
      
      updatedTask.subtasks = {
        total: processedSubtasks.length,
        completed: processedSubtasks.filter(st => st.done).length,
        items: processedSubtasks,
      };
    }
    
    // 4. PUT statt PATCH verwenden
    const updateResponse = await fetch(`${BASE_URL}tasks/${taskId}.json`, {
      method: "PUT", // ✅ PUT statt PATCH
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask), // Komplette Task senden
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`HTTP ${updateResponse.status}: ${errorText}`);
    }

    // Nur die Updates zurückgeben
    return updates;
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