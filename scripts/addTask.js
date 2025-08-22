const categories = ["Technical Task", "User Story"];

// Add event listeners for title input validation
const titleInput = document.querySelector(".title-input");
const titleError = document.querySelector(".error-message");

titleInput.addEventListener("blur", () => {
    if (!titleInput.value.trim()) {
        titleInput.style.borderBottom = "1px solid #FF4D4D";
        titleError.style.display = "block";
    } else {
        titleInput.style.borderBottom = "1px solid #D1D1D1";
        titleError.style.display = "none";
    }
});
titleInput.addEventListener("input", () => {
    if (titleInput.value.trim()) {
        titleInput.style.borderBottom = "1px solid #005DFF";
        titleError.style.display = "none";
    }
});

// Add event listeners for due date input validation
// Elemente referenzieren
const dueDateInput = document.querySelector(".due-date-input");
const dueDateContent = document.querySelector(".due-date-content");
const dueDateError = document.querySelector(".due-date-container .error-message");

// Blur-Event (wenn Fokus verloren geht)
dueDateInput.addEventListener("blur", () => {
    if (!dueDateInput.value.trim()) {
        dueDateContent.style.borderBottom = "1px solid #FF4D4D";
        dueDateError.style.display = "block";
    } else {
        dueDateContent.style.borderBottom = "1px solid #D1D1D1";
        dueDateError.style.display = "none";
    }
});

// Input-Event (wenn User tippt)
dueDateInput.addEventListener("input", () => {
    if (dueDateInput.value.trim()) {
        dueDateContent.style.borderBottom = "1px solid #005DFF"; // optional: Fokus-Farbe
        dueDateError.style.display = "none";
    }
});


// Add event listeners for priority buttons
const buttons = document.querySelectorAll(".priority-frame");

buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
        // Entferne active von allen Buttons
        buttons.forEach(b => b.classList.remove("active"));
        // Füge active nur zum geklickten Button hinzu
        btn.classList.add("active");
    });
});

// Add event listener for assigned dropdown toggle
const arrowContainer = document.querySelector('.assigned-arrow-container');
const assignedDropdown = document.getElementById('assigned-dropdown');

arrowContainer.addEventListener('click', (event) => {
    event.stopPropagation();
    assignedDropdown.style.display = assignedDropdown.style.display === 'block' ? 'none' : 'block';
});

// Klick außerhalb schließt
document.addEventListener('click', (event) => {
    if (!assignedDropdown.contains(event.target) && event.target !== arrowContainer) {
        assignedDropdown.style.display = 'none';
    }
});


function populateCategoryDropdown() {
    const container = document.querySelector('.category-container .category-content');
    if (!container) return;

    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';

    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = cat;

        item.addEventListener('click', () => {
            container.querySelector('.assigned-text').textContent = cat;
            menu.style.display = 'none';
        });

        menu.appendChild(item);
    });

    container.appendChild(menu);

    // Klick auf Pfeil zum Öffnen
    const arrow = container.querySelector('.assigned-arrow-container');
    arrow.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });

    // Klick außerhalb schließt das Menü
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            menu.style.display = 'none';
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const BASE_URL = "https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/";

    const assignedContent = document.querySelector('.assigned-content');
    const assignedText = assignedContent.querySelector('.assigned-text');
    const assignedDropdown = document.getElementById('assigned-dropdown');

    let users = [];

    // 1. Firebase Users laden
    async function loadUsers() {
        try {
            const response = await fetch(`${BASE_URL}users.json`);
            const data = await response.json();

            if (data) {
                users = Object.values(data); // aus Objekten ein Array machen
                populateAssignedDropdown();
                console.log("Users loaded successfully:", users);
            } else {
                users = [];
                console.log("Keine Nutzer gefunden");
            }
        } catch (error) {
            console.error("Fehler beim Laden der Users:", error);
            users = [];
        }
    }

    // 2. Assigned-Dropdown bauen
    function populateAssignedDropdown() {
        assignedDropdown.innerHTML = ""; // vorherige Items löschen
        users.forEach(user => {
            const div = document.createElement('div');
            div.className = 'dropdown-item';
            div.textContent = user.name; // name aus Firebase verwenden
            div.addEventListener('click', () => {
                assignedText.textContent = user.name;
                assignedDropdown.classList.remove('show');
            });
            assignedDropdown.appendChild(div);
        });
    }

    // 3. Dropdown toggle
    assignedContent.addEventListener('click', () => {
        assignedDropdown.classList.toggle('show');
    });

    // Firebase Users laden
    await loadUsers();
});


// ===================== CATEGORY =====================
const categoryContent = document.querySelector('.category-content');
const categoryText = categoryContent.querySelector('.assigned-text');

// Dropdown für Kategorien erstellen

const categoryDropdown = document.createElement('div');
categoryDropdown.className = 'dropdown-menu';

categories.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    div.textContent = cat;
    div.addEventListener('click', () => {
        categoryText.textContent = cat;
        categoryDropdown.classList.remove('show');
    });
    categoryDropdown.appendChild(div);
});

categoryContent.appendChild(categoryDropdown);

categoryContent.addEventListener('click', () => {
    categoryDropdown.classList.toggle('show');
});

// ===================== SUBTASK DROPDOWN =====================
// ===================== SUBTASK DROPDOWN =====================
const taskInput = document.querySelector("#subtask-text");
const plusBtn = document.querySelector("#plus-btn");
const checkBtn = document.querySelector("#check-btn");
const cancelBtn = document.querySelector("#cancel-btn");
const subtaskList = document.querySelector("#subtask-list");

// Eingabe überwachen → wenn Text da ist, Haken + X anzeigen
taskInput.addEventListener("input", () => {
    if (taskInput.value.trim() !== "") {
        checkBtn.style.display = "inline";
        cancelBtn.style.display = "inline";
        plusBtn.style.display = "none";
    } else {
        resetInput();
    }
});

// Klick auf Plus-Button → aktiviert Eingabefeld
plusBtn.addEventListener("click", () => {
    taskInput.focus();
});

// Klick auf Haken-Button → Subtask hinzufügen
checkBtn.addEventListener("click", () => {
    const currentTask = taskInput.value.trim();
    if (!currentTask) return;

    const li = document.createElement("li");

    // Text-Span
    const span = document.createElement("span");
    span.textContent = currentTask;
    li.appendChild(span);

    // Icons-Container
    const icons = document.createElement("div");
    icons.classList.add("subtask-icons");

    // Edit Icon
    const editIcon = document.createElement("img");
    editIcon.src = "./assets/icons-addTask/Property 1=edit.png";
    editIcon.alt = "Edit";
    editIcon.addEventListener("click", () => {
        startEditMode(li, span);
    });

    // Delete Icon
    const deleteIcon = document.createElement("img");
    deleteIcon.src = "./assets/icons-addTask/Property 1=delete.png";
    deleteIcon.alt = "Delete";
    deleteIcon.addEventListener("click", () => {
        subtaskList.removeChild(li);
    });

    icons.appendChild(editIcon);
    icons.appendChild(deleteIcon);
    li.appendChild(icons);

    subtaskList.appendChild(li);

    resetInput();
});

// Klick auf Cancel-Button → Eingabe zurücksetzen
cancelBtn.addEventListener("click", resetInput);

// Reset-Funktion
function resetInput() {
    taskInput.value = "";
    checkBtn.style.display = "none";
    cancelBtn.style.display = "none";
    plusBtn.style.display = "inline";
}

// Edit-Mode Funktion
function startEditMode(li, span) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;
    input.classList.add("subtask-edit-input");

    const saveIcon = document.createElement("img");
    saveIcon.src = "./assets/icons-addTask/Subtask's icons (1).png"; // Haken
    saveIcon.alt = "Save";
    saveIcon.addEventListener("click", () => {
        span.textContent = input.value.trim() || span.textContent;
        li.replaceChild(span, input);
        li.replaceChild(defaultIcons, actionIcons);
    });

    const deleteIcon = document.createElement("img");
    deleteIcon.src = "./assets/icons-addTask/Property 1=delete.png";
    deleteIcon.alt = "Delete";
    deleteIcon.addEventListener("click", () => {
        subtaskList.removeChild(li);
    });

    const actionIcons = document.createElement("div");
    actionIcons.classList.add("subtask-icons");
    actionIcons.appendChild(saveIcon);
    actionIcons.appendChild(deleteIcon);

    const defaultIcons = li.querySelector(".subtask-icons");

    li.replaceChild(input, span);
    li.replaceChild(actionIcons, defaultIcons);

    input.focus();
}








