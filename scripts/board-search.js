// ===== BOARD SEARCH SYSTEM =====

// Globale Variable für aktuelle Suchterme
let currentSearchTerm = "";

// DOM-Elemente
const input = document.getElementById("search-input");
const icon = document.getElementById("search-icon");
const clear = document.getElementById("search-icon-clear");

// Funktion zum Rendern des gefilterten Boards
function renderFilteredBoard(searchTerm) {
    const allTasks = getTasks(); // oder window.taskManager.getTasks()
    
    // Tasks basierend auf Titel und Beschreibung filtern
    const filteredTasks = allTasks.filter(task => 
        (task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Spalten-Container
    const columns = {
        todo: document.getElementById('column-todo'),
        inProgress: document.getElementById('column-inProgress'),
        awaitFeedback: document.getElementById('column-awaitFeedback'),
        done: document.getElementById('column-done'),
    };

    // Alle Spalten leeren
    Object.values(columns).forEach(el => el && (el.innerHTML = ''));

    // Gefilterte Tasks rendern
    filteredTasks.forEach(task => {
        const card = createTaskCard(task);
        const column = columns[task.status] || columns.todo;
        if (column) column.appendChild(card);
    });

    // Platzhalter für leere Spalten
    Object.values(columns).forEach(columnEl => {
        if (columnEl && columnEl.children.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'task-placeholder';
            placeholder.textContent = 'No tasks found';
            columnEl.appendChild(placeholder);
        }
    });
}

// Hauptsuchfunktion, die bei onkeyup aufgerufen wird
function handleSearch() {
    const searchTerm = input.value.trim();
    currentSearchTerm = searchTerm;

    if (searchTerm !== "") {
        icon.classList.add("hidden");
        clear.classList.remove("hidden");
        renderFilteredBoard(searchTerm);
    } else {
        icon.classList.remove("hidden");
        clear.classList.add("hidden");
        renderBoard();
    }
}

// Such-Eingabe leeren
function clearSearch() {
    input.value = "";
    currentSearchTerm = "";
    handleSearch();
}