// ===================== ASSIGNED TO =====================
const assignedContent = document.querySelector('.assigned-content');
const assignedText = assignedContent.querySelector('.assigned-text');
const assignedDropdown = document.getElementById('assigned-dropdown');

const contacts = ['Alice', 'Bob', 'Charlie', 'David'];
contacts.forEach(contact => {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    div.textContent = contact;
    div.addEventListener('click', () => {
        assignedText.textContent = contact;
        assignedDropdown.classList.remove('show');
    });
    assignedDropdown.appendChild(div);
});

assignedContent.addEventListener('click', () => {
    assignedDropdown.classList.toggle('show');
});

// ===================== CATEGORY =====================
const categoryContent = document.querySelector('.category-content');
const categoryText = categoryContent.querySelector('.assigned-text');

// Dropdown für Kategorien erstellen
const categories = ['Design', 'Development', 'Marketing', 'Sales'];
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

// ===================== SUBTASKS =====================
const taskContent = document.querySelector('.task-content');
const subtaskList = document.querySelector('.subtask-list');

taskContent.addEventListener('click', (event) => {
    // Nur reagieren, wenn wirklich auf den Text oder Pfeil geklickt wird
    if (event.target.closest('.subtask-text') || event.target.closest('.assigned-arrow-container')) {
        const newSubtask = prompt('Enter a new subtask:');
        if (newSubtask) {
            const li = document.createElement('li');
            li.className = 'subtask-item';
            li.textContent = newSubtask;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.className = 'delete-subtask-btn';
            deleteBtn.addEventListener('click', () => li.remove());

            li.appendChild(deleteBtn);
            subtaskList.appendChild(li);
        }
    }
});

