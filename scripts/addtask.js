const categories = ["Technical Task", "User Story"];
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

const dueDateInput = document.querySelector(".due-date-input");
const dueDateIcon = document.querySelector(".due-date-icon");
const dueDateContainer = document.querySelector(".due-date-content");
const dueDateError = document.querySelector(".due-date-container .error-message");

// Blur-Event (Validierung)
dueDateInput.addEventListener("blur", () => {
    if (!dueDateInput.value.trim()) {
        dueDateInput.style.borderBottom = "1px solid #FF4D4D";
        dueDateError.style.display = "block";
    } else {
        dueDateInput.style.borderBottom = "1px solid #D1D1D1";
        dueDateError.style.display = "none";
    }
});

// Funktion um Datepicker zu öffnen
function openDatepicker() {
    if (dueDateInput.showPicker) {
        dueDateInput.showPicker(); // moderner Weg
    } else {
        dueDateInput.click(); // Fallback für ältere Browser
    }
}

// Klick auf Icon öffnet Datepicker
dueDateIcon.addEventListener("click", openDatepicker);

// Klick auf die gesamte Zeile öffnet Datepicker
dueDateContainer.addEventListener("click", openDatepicker);


const buttons = document.querySelectorAll(".priority-frame");

buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

const arrowContainer = document.querySelector('.assigned-content');
const assignedDropdown = document.getElementById('assigned-dropdown');

arrowContainer.addEventListener('click', (event) => {
    event.stopPropagation();
    assignedDropdown.classList.toggle('show');
});


document.addEventListener('click', (event) => {
    if (!assignedDropdown.contains(event.target) && event.target !==
        arrowContainer) {
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

    const arrow = container.querySelector('.assigned-arrow-container');
    arrow.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.style.display = menu.style.display === 'block' ? 'none' :
            'block';
    });

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            menu.style.display = 'none';
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const assignedContent = document.querySelector('.assigned-content');
    const assignedTextContainer = assignedContent.querySelector('.assigned-text-container');
    const assignedText = assignedTextContainer.querySelector('.assigned-text');
    const assignedInput = assignedContent.querySelector('.assigned-input');
    const arrowContainer = assignedContent.querySelector('.assigned-arrow-container');
    const arrowIcon = arrowContainer.querySelector('img');
    const assignedDropdown = document.getElementById('assigned-dropdown');
    const selectedAvatarsContainer = document.querySelector(".selected-avatars-container");

    let users = [];

    // ---------- Load Users ----------
    async function loadUsers() {
        try {
            const res = await fetch("https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/users.json");
            const data = await res.json();
            users = data ? Object.values(data) : [];
            populateDropdown();
        } catch (e) {
            console.error("Fehler beim Laden der Users", e);
        }
    }

    // ---------- Helpers ----------
    function getInitials(name) {
        if (!name) return "";
        return name.trim().split(" ").map(n => n[0].toUpperCase()).slice(0, 2).join("");
    }

    function getColor(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${Math.abs(hash) % 360},70%,50%)`;
    }

    // ---------- Update Selected Avatars ----------
    function updateSelectedAvatars() {
        selectedAvatarsContainer.innerHTML = "";
        const selected = users.filter((u, i) => {
            const img = assignedDropdown.children[i].querySelector('img');
            return img.src.includes("checked");
        }).slice(0, 3);

        selected.forEach(u => {
            const a = document.createElement('div');
            a.className = 'selected-avatar assigned-text';
            a.textContent = getInitials(u.name);
            a.style.width = '28px';
            a.style.height = '28px';
            a.style.borderRadius = '50%';
            a.style.display = 'flex';
            a.style.alignItems = 'center';
            a.style.justifyContent = 'center';
            a.style.fontWeight = 'bold';
            a.style.fontSize = '13px';
            a.style.color = 'white';
            a.style.backgroundColor = getColor(u.name);
            a.style.marginRight = '4px';
            a.style.flex = '0 0 auto';
            selectedAvatarsContainer.appendChild(a);
        });

        selectedAvatarsContainer.style.display = selected.length > 0 ? 'flex' : 'none';
    }

    // ---------- Populate Dropdown ----------
    function populateDropdown() {
        assignedDropdown.innerHTML = "";

        users.forEach((user, i) => {
            const div = document.createElement('div');
            div.className = 'dropdown-item';
            div.dataset.clicked = "false";

            const wrapper = document.createElement('div');
            wrapper.className = 'assigned-wrapper';

            const avatar = document.createElement('div');
            avatar.className = 'dropdown-avatar';
            avatar.textContent = getInitials(user.name);
            avatar.style.backgroundColor = getColor(user.name);

            const span = document.createElement('span');
            span.textContent = user.name;

            wrapper.appendChild(avatar);
            wrapper.appendChild(span);

            // Checkbox
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'checkbox-wrapper';
            const checkbox = document.createElement('img');
            checkbox.src = "./assets/icons-addTask/Property 1=Default.png";

            // Hover-Kreis
            const hoverOverlay = document.createElement('div');
            hoverOverlay.className = 'hover-overlay';
            checkboxWrapper.appendChild(hoverOverlay);
            checkboxWrapper.appendChild(checkbox);

            div.appendChild(wrapper);
            div.appendChild(checkboxWrapper);
            assignedDropdown.appendChild(div);

            // ---------- Klick auf Zeile → nur Highlight ----------
            div.addEventListener('click', (e) => {
                if (e.target === checkbox || e.target === hoverOverlay) return;
                div.classList.toggle('active'); // nur Highlight beim Zeilen-Klick
            });

            // ---------- Klick auf Checkbox ----------
            checkboxWrapper.addEventListener('click', (e) => {
                e.stopPropagation();

                const isChecked = checkbox.src.includes("checked");
                checkbox.src = isChecked
                    ? "./assets/icons-addTask/Property 1=Default.png"
                    : "./assets/icons-addTask/Property 1=checked.svg";

                // NICHTS an div.classList ändern
                updateSelectedAvatars();

                // Checkbox immer sichtbar lassen
                checkboxWrapper.style.display = 'flex';
            });
        });
    }

    // ---------- Dropdown toggle ----------
    function toggleDropdown(e) {
        e.stopPropagation();
        const isOpen = assignedDropdown.classList.contains('open');
        if (!isOpen) {
            assignedDropdown.classList.add('open');
            assignedDropdown.style.display = 'block';
            assignedInput.style.display = 'inline';
            assignedText.style.display = 'none';
            arrowIcon.src = '/assets/icons-addTask/arrow_drop_down_up.png';
            assignedInput.focus();
        } else {
            assignedDropdown.classList.remove('open');
            assignedDropdown.style.display = 'none';
            assignedInput.style.display = 'none';
            assignedText.style.display = 'block';
            arrowIcon.src = '/assets/icons-addTask/arrow_drop_down.png';
            assignedInput.value = '';
        }
    }

    assignedTextContainer.addEventListener('click', toggleDropdown);
    arrowContainer.addEventListener('click', toggleDropdown);

    // ---------- Klick außerhalb schließt Dropdown ----------
    // ---------- Klick außerhalb schließt Dropdown ----------
    document.addEventListener('click', e => {
        if (!assignedTextContainer.contains(e.target) && !arrowContainer.contains(e.target)) {
            assignedDropdown.classList.remove('open');
            assignedDropdown.style.display = 'none';
            assignedInput.style.display = 'none';
            assignedText.style.display = 'block';
            arrowIcon.src = '/assets/icons-addTask/arrow_drop_down.png';

            // Checkboxen beibehalten, wenn gesetzt
            Array.from(assignedDropdown.children).forEach(div => {
                const checkboxWrapper = div.querySelector('.checkbox-wrapper');
                const checkbox = checkboxWrapper.querySelector('img');

                if (checkbox.src.includes('checked')) {
                    checkboxWrapper.style.display = 'flex'; // bleibt sichtbar
                } else {
                    checkboxWrapper.style.display = 'none'; // ungesetzte Checkbox ausblenden
                }
            });
        }
    });

    // ---------- Filter input ----------
    assignedInput.addEventListener('input', () => {
        const filter = assignedInput.value.toLowerCase();
        Array.from(assignedDropdown.children).forEach(div => {
            const name = div.querySelector('span').textContent.toLowerCase();
            div.style.display = name.includes(filter) ? 'flex' : 'none';
        });
    });

    await loadUsers();
});


// ===================== CATEGORY ===================== 
const categoryContent = document.querySelector('.category-content');
const categoryText = categoryContent.querySelector('.assigned-text');
const categoryArrow = categoryContent.querySelector('.assigned-arrow-icon');

const categoryDropdown = document.createElement('div');
categoryDropdown.className = 'dropdown-menu';

categories.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    div.textContent = cat;
    div.addEventListener('click', (e) => {
        e.stopPropagation();
        categoryText.textContent = cat;
        categoryDropdown.classList.remove('show');
        categoryArrow.style.transform = 'rotate(0deg)'; // Pfeil zurücksetzen
    });
    categoryDropdown.appendChild(div);
});

categoryContent.appendChild(categoryDropdown);

// Dropdown & Pfeil Toggle
// Dropdown & Pfeil Toggle
categoryContent.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = categoryDropdown.classList.contains('show');
    categoryDropdown.classList.toggle('show', !isOpen); // ✅ Toggle über Klasse
    categoryArrow.src = !isOpen
        ? '/assets/icons-addTask/arrow_drop_down_up.png'
        : '/assets/icons-addTask/arrow_drop_down.png';
});

// Klick außerhalb schließt Dropdown
document.addEventListener('click', (e) => {
    if (!categoryContent.contains(e.target)) {
        categoryDropdown.classList.remove('show'); // ✅ nur über Klasse
        categoryArrow.src = '/assets/icons-addTask/arrow_drop_down.png';
    }
});


// ===================== SUBTASK DROPDOWN ===================== 
// // ===================== SUBTASK DROPDOWN ===================== 
const taskInput = document.querySelector("#subtask-text");
const plusBtn = document.querySelector("#plus-btn");
const checkBtn = document.querySelector("#check-btn");
const cancelBtn = document.querySelector("#cancel-btn");
const subtaskList = document.querySelector("#subtask-list");

taskInput.addEventListener("input", () => {
    if (taskInput.value.trim() !== "") {
        checkBtn.style.display = "inline";
        cancelBtn.style.display = "inline"; plusBtn.style.display = "none";
    } else { resetInput(); }
});
plusBtn.addEventListener("click", () => { taskInput.focus(); });
checkBtn.addEventListener("click", () => {
    const currentTask = taskInput.value.trim();
    if (!currentTask)
        return;
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = currentTask;
    li.appendChild(span);
    const icons = document.createElement("div");
    icons.classList.add("subtask-icons");
    const editIcon = document.createElement("img");
    editIcon.src = "./assets/icons-addTask/Property 1=edit.png";
    editIcon.alt = "Edit";
    editIcon.addEventListener("click", () => { startEditMode(li, span); });
    const deleteIcon = document.createElement("img");
    deleteIcon.src = "./assets/icons-addTask/Property 1=delete.png";
    deleteIcon.alt = "Delete";
    deleteIcon.addEventListener("click", () => { subtaskList.removeChild(li); });
    icons.appendChild(editIcon);
    icons.appendChild(deleteIcon);
    li.appendChild(icons);
    subtaskList.appendChild(li);
    resetInput();
});
cancelBtn.addEventListener("click", resetInput);
function resetInput() { taskInput.value = ""; checkBtn.style.display = "none"; cancelBtn.style.display = "none"; plusBtn.style.display = "inline"; }
function startEditMode(li, span) {
    const input = document.createElement("input"); input.type = "text"; input.value = span.textContent; input.classList.add("subtask-edit-input"); const saveIcon = document.createElement("img"); saveIcon.src = "./assets/icons-addTask/Subtask's icons (1).png";
    saveIcon.alt = "Save"; saveIcon.addEventListener("click", () => { span.textContent = input.value.trim() || span.textContent; li.replaceChild(span, input); li.replaceChild(defaultIcons, actionIcons); }); const deleteIcon = document.createElement("img"); deleteIcon.src = "./assets/icons-addTask/Property 1=delete.png"; deleteIcon.alt = "Delete"; deleteIcon.addEventListener("click", () => { subtaskList.removeChild(li); }); const actionIcons = document.createElement("div"); actionIcons.classList.add("subtask-icons"); actionIcons.appendChild(saveIcon); actionIcons.appendChild(deleteIcon); const defaultIcons = li.querySelector(".subtask-icons"); li.replaceChild(input, span); li.replaceChild(actionIcons, defaultIcons); input.focus();
}


// ----------------------------
// Funktion: Task-Daten auslesen
// ----------------------------
function getTaskData() {
    // 1. Überschrift
    const titleInput = document.querySelector(".title-input");
    const title = titleInput.value.trim();

    // 2. Description
    const descriptionInput = document.querySelector(".description-input");
    const description = descriptionInput.value.trim();

    // 3. Due Date
    const dueDateInput = document.querySelector(".due-date-input");
    let dueDate = dueDateInput.value; // yyyy-mm-dd
    if (dueDate) {
        const [year, month, day] = dueDate.split("-");
        dueDate = `${day}.${month}.${year}`;
    }

    // 4. Priority
    const priorityBtn = document.querySelector(".priority-frame.active");
    const priority = priorityBtn ? priorityBtn.textContent.trim() : null;

    // 5. Assigned to
    const assignedAvatars = document.querySelectorAll(".selected-avatars-container .assigned-text");
    const assignedTo = Array.from(assignedAvatars).map(el => el.textContent.trim());

    // 6. Category
    const categoryText = document.querySelector(".category-content .assigned-text");
    const category = categoryText ? categoryText.textContent.trim() : null;

    // 7. Subtasks
    const subtaskItems = document.querySelectorAll("#subtask-list li");
    const subtasks = Array.from(subtaskItems).map(el => el.textContent.trim());

    return { title, description, dueDate, priority, assignedTo, category, subtasks };
}

// ----------------------------
// EventListener: Create Task
// ----------------------------
const createTaskBtn = document.querySelector(".sign-up-btn");
createTaskBtn.addEventListener("click", () => {
    const taskData = getTaskData();

    // Pflichtfelder prüfen
    if (!taskData.title || !taskData.dueDate) {
        alert("Bitte fülle alle Pflichtfelder aus!");
        return;
    }

    // Test-Ausgabe in der Konsole
    console.log("Task-Daten:", taskData);

    // Hier später Firebase-Aufruf einfügen
});

// ----------------------------
// EventListener: Clear / Reset
// ----------------------------
const resetBtn = document.querySelector(".guest-btn");
resetBtn.addEventListener("click", () => {
    // Felder zurücksetzen
    document.querySelector(".title-input").value = "";
    document.querySelector(".description-input").value = "";
    document.querySelector(".due-date-input").value = "";

    // Priority zurücksetzen auf Medium
    document.querySelectorAll(".priority-frame").forEach(btn => btn.classList.remove("active"));
    document.querySelector(".priority-frame:nth-child(2)").classList.add("active");

    // Assigned & Subtasks löschen
    document.querySelector(".selected-avatars-container").innerHTML = "";
    document.querySelector("#subtask-list").innerHTML = "";

    // Kategorie zurücksetzen
    const categoryText = document.querySelector(".category-content .assigned-text");
    if (categoryText) categoryText.textContent = "Select task category";
});

