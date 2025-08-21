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
    assignedDropdown.style.display = assignedDropdown.style.display
        === 'block' ? 'none' : 'block';
})

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
    const BASE_URL = "https://join-1318-default-rtdb.europe-west1.firebasedatabase.app/";
    const selectedAvatarsContainer = document.querySelector(".selected-avatars-container");
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

    function getInitials(name) {
        if (!name) return "";
        const parts = name.trim().split(" ");
        return parts.map(p => p[0].toUpperCase()).slice(0, 2).join("");
    }

    function getColorFromName(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 50%)`;
    }

    function populateAssignedDropdown() {
        assignedDropdown.innerHTML = "";

        users.forEach(user => {
            const div = document.createElement('div');
            div.className = 'dropdown-item';

            const wrapper = document.createElement('div');
            wrapper.className = 'assigned-wrapper';

            const avatar = document.createElement('div');
            avatar.className = 'dropdown-avatar';
            avatar.textContent = getInitials(user.name);
            avatar.style.backgroundColor = getColorFromName(user.name);

            const span = document.createElement('span');
            span.textContent = user.name;

            wrapper.appendChild(avatar);
            wrapper.appendChild(span);

            const checkboxImg = document.createElement('img');
            checkboxImg.src = "./assets/icons-addTask/Property 1=Default.png";
            checkboxImg.className = "checkbox-img";
            let checked = false;

            function toggleCheck() {
                checked = !checked;
                checkboxImg.src = checked
                    ? "./assets/icons-addTask/Property 1=checked.png"
                    : "./assets/icons-addTask/Property 1=Default.png";
                updateSelectedAvatars();
            }

            checkboxImg.addEventListener("mouseenter", () => {
                checkboxImg.src = checked
                    ? "./assets/icons-addTask/Property 1=hover checked.png"
                    : "./assets/icons-addTask/Property 1=hover disable.png";
            });

            checkboxImg.addEventListener("mouseleave", () => {
                checkboxImg.src = checked
                    ? "./assets/icons-addTask/Property 1=checked.png"
                    : "./assets/icons-addTask/Property 1=Default.png";
            });

            checkboxImg.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCheck();
            });

            div.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCheck();
            });

            div.appendChild(wrapper);
            div.appendChild(checkboxImg);
            assignedDropdown.appendChild(div);
        });

        function updateSelectedAvatars() {
            selectedAvatarsContainer.innerHTML = "";
            const selectedUsers = users.filter((user, index) => {
                const div = assignedDropdown.children[index];
                const img = div.querySelector('.checkbox-img');
                return img.src.includes("checked.png") || img.src.includes("hover checked icon.png");
            }).slice(0, 3);

            selectedUsers.forEach(user => {
                const avatar = document.createElement('div');
                avatar.className = 'selected-avatar';
                avatar.textContent = getInitials(user.name);
                avatar.style.backgroundColor = getColorFromName(user.name);
                selectedAvatarsContainer.appendChild(avatar);
            });

            if (selectedAvatarsContainer.children.length > 0) {
                selectedAvatarsContainer.style.display = 'flex';
            } else {
                selectedAvatarsContainer.style.display = 'none';
            }
        }
    }

    await loadUsers();
});


// ===================== CATEGORY ===================== 
const categoryContent = document.querySelector('.category-content');
const categoryText = categoryContent.querySelector('.assigned-text');
const categoryDropdown = document.createElement('div');
categoryDropdown.className = 'dropdown-menu'; categories.forEach(cat => {
    const div = document.createElement('div'); div.className = 'dropdown-item'; div.textContent = cat; div.addEventListener('click', (e) => {
        e.stopPropagation();
        categoryText.textContent = cat; categoryDropdown.classList.remove('show');
    });
    categoryDropdown.appendChild(div);
}); categoryContent.appendChild(categoryDropdown);
categoryContent.addEventListener('click', (e) => { e.stopPropagation(); categoryDropdown.classList.toggle('show'); });
document.addEventListener('click', (e) => { if (!categoryContent.contains(e.target)) { categoryDropdown.classList.remove('show'); } });


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
    const currentTask = taskInput.value.trim(); if (!currentTask) return; const li = document.createElement("li");
    const span = document.createElement("span"); span.textContent = currentTask; li.appendChild(span);
    const icons = document.createElement("div"); icons.classList.add("subtask-icons");
    const editIcon = document.createElement("img"); editIcon.src = "./assets/icons-addTask/Property 1=edit.png"; editIcon.alt = "Edit"; editIcon.addEventListener("click", () => { startEditMode(li, span); });
    const deleteIcon = document.createElement("img"); deleteIcon.src = "./assets/icons-addTask/Property 1=delete.png"; deleteIcon.alt = "Delete"; deleteIcon.addEventListener("click", () => { subtaskList.removeChild(li); }); icons.appendChild(editIcon); icons.appendChild(deleteIcon); li.appendChild(icons); subtaskList.appendChild(li); resetInput();
});
cancelBtn.addEventListener("click", resetInput);
function resetInput() { taskInput.value = ""; checkBtn.style.display = "none"; cancelBtn.style.display = "none"; plusBtn.style.display = "inline"; }
function startEditMode(li, span) {
    const input = document.createElement("input"); input.type = "text"; input.value = span.textContent; input.classList.add("subtask-edit-input"); const saveIcon = document.createElement("img"); saveIcon.src = "./assets/icons-addTask/Subtask's icons (1).png";
    saveIcon.alt = "Save"; saveIcon.addEventListener("click", () => { span.textContent = input.value.trim() || span.textContent; li.replaceChild(span, input); li.replaceChild(defaultIcons, actionIcons); }); const deleteIcon = document.createElement("img"); deleteIcon.src = "./assets/icons-addTask/Property 1=delete.png"; deleteIcon.alt = "Delete"; deleteIcon.addEventListener("click", () => { subtaskList.removeChild(li); }); const actionIcons = document.createElement("div"); actionIcons.classList.add("subtask-icons"); actionIcons.appendChild(saveIcon); actionIcons.appendChild(deleteIcon); const defaultIcons = li.querySelector(".subtask-icons"); li.replaceChild(input, span); li.replaceChild(actionIcons, defaultIcons); input.focus();
}