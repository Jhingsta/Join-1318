// Globale Variable für aktuelle Suchterme
let currentSearchTerm;

const input = document.getElementById("search-input");
const icon = document.getElementById("search-icon");
const clear = document.getElementById("search-icon-clear");

// Funktion zum Rendern des gefilterten Boards
function renderFilteredBoard(searchTerm) {
    const allTasks = window.taskManager.getTasks();
    
    // Tasks basierend auf Suchterm filtern
    const filteredTasks = allTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const columns = {
        todo: document.getElementById('column-todo'),
        inProgress: document.getElementById('column-inProgress'),
        awaitFeedback: document.getElementById('column-awaitFeedback'),
        done: document.getElementById('column-done'),
    };

    // Alle Spalten leeren
    Object.values(columns).forEach((el) => el && (el.innerHTML = ''));

    // Gefilterte Tasks rendern
    filteredTasks.forEach((task) => {
        const card = createTaskCard(task);
        const column = columns[task.status] || columns.todo;
        if (column) {
            column.appendChild(card);
        }
    });

    // Platzhalter für leere Spalten bei der Suche
    Object.entries(columns).forEach(([status, columnEl]) => {
        if (!columnEl) return;
        
        if (columnEl.children.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'task-placeholder';
            placeholder.textContent = 'No tasks found';
            columnEl.appendChild(placeholder);
        }
    });
}

// Hauptsuchfunktion die bei onkeyup aufgerufen wird
function handleSearch() {

  if (input.value.trim() !== "") {
    icon.classList.add("hidden");
    clear.classList.remove("hidden");
    renderFilteredBoard(input.value);
  } else {
    icon.classList.remove("hidden");
    clear.classList.add("hidden");
    renderBoard();
  }
}

function clearSearch() {

  input.value = "";
  handleSearch();
}
