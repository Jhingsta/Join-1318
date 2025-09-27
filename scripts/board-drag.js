// Drag and Drop Feature
function getTaskIdFromCard(card) {
    return card.dataset.taskId || card.getAttribute('data-task-id') || card.id;
}

// 1. Alle Task-Karten draggable machen, wenn das Board gerendert wurde
function enableTaskDragAndDrop() {
    // Alle Spalten holen
    const columns = [
        document.getElementById('column-todo'),
        document.getElementById('column-inProgress'),
        document.getElementById('column-awaitFeedback'),
        document.getElementById('column-done')
    ].filter(Boolean);

    // Alle Karten holen
    const cards = document.querySelectorAll('.task-card');
    cards.forEach(card => {
        card.setAttribute('draggable', 'true');
        // Optional: Eindeutige ID setzen, falls nicht vorhanden
        if (!card.dataset.taskId) {
            // Finde die Task anhand des Titels (besser: Task-Objekt mit ID erweitern!)
            card.dataset.taskId = card.querySelector('.title')?.textContent || '';
        }

        card.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', card.dataset.taskId);
            setTimeout(() => card.classList.add('dragging'), 0);
        });

        card.addEventListener('dragend', e => {
            card.classList.remove('dragging');
        });
    });

    // Spalten als Dropzone vorbereiten
    columns.forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault();
            column.classList.add('drag-over');
        });

        column.addEventListener('dragleave', e => {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', async e => {   // <- async hinzufügen
            e.preventDefault();
            column.classList.remove('drag-over');
            const taskId = e.dataTransfer.getData('text/plain');
            await moveTaskToColumn(taskId, column.id); // <- await, damit Firebase-Update fertig ist
        });
    });

}

// 2. Task verschieben und Board neu rendern / Karte updaten
async function moveTaskToColumn(taskId, columnId) {

    let newStatus = 'todo';
    if (columnId.includes('inProgress')) newStatus = 'inProgress';
    else if (columnId.includes('awaitFeedback')) newStatus = 'awaitFeedback';
    else if (columnId.includes('done')) newStatus = 'done';

    const tasks = window.taskManager.getTasks();
    const task = tasks.find(t => (t.id || t.title) == taskId);

    if (task && task.status !== newStatus) {
        task.status = newStatus; // lokal ändern

        // Firebase-Update abwarten
        await window.taskManager.updateTaskInFirebase(task);
        window.taskManager.saveTasks(tasks); // lokal speichern

        // 🔹 Event feuern, damit nur die Karte aktualisiert wird
        document.dispatchEvent(new CustomEvent("taskUpdated", { detail: task }));

        // Optional: Board neu rendern (falls nötig)
        renderBoard();
        enableTaskDragAndDrop();
    }
}

// 3. Nach jedem Render Drag & Drop aktivieren
const origRenderBoard = renderBoard;
renderBoard = function () {
    origRenderBoard();
    enableTaskDragAndDrop();
};
// Initial aktivieren (falls Board schon gerendert)
enableTaskDragAndDrop();
