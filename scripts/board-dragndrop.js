// ===== DRAG AND DROP SYSTEM - Modernisiert für CRUD-Architektur =====

// Drag and Drop für alle Task-Karten aktivieren
function enableTaskDragAndDrop() {
    // Alle Spalten als Drop-Zonen konfigurieren
    setupDropZones();
    
    // Alle Task-Karten draggable machen
    setupDraggableCards();
}

// Drop-Zonen (Spalten) konfigurieren
function setupDropZones() {
    const columns = [
        document.getElementById('column-todo'),
        document.getElementById('column-inProgress'),
        document.getElementById('column-awaitFeedback'),
        document.getElementById('column-done')
    ].filter(Boolean);

    columns.forEach(column => {
        // Bestehende Listener entfernen (verhindert Duplikate)
        column.removeEventListener('dragover', handleDragOver);
        column.removeEventListener('dragleave', handleDragLeave);
        column.removeEventListener('drop', handleDrop);
        
        // Neue Listener hinzufügen
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('dragleave', handleDragLeave);
        column.addEventListener('drop', handleDrop);
    });
}

// Draggable Cards konfigurieren
function setupDraggableCards() {
    const cards = document.querySelectorAll('.task-card');
    
    cards.forEach(card => {
        // Prüfe ob Card eine Task-ID hat
        if (!card.id || !card.id.startsWith('task-')) {
            console.warn('Task card missing proper ID:', card);
            return;
        }
        
        // Draggable aktivieren
        card.setAttribute('draggable', 'true');
        
        // Bestehende Listener entfernen
        card.removeEventListener('dragstart', handleDragStart);
        card.removeEventListener('dragend', handleDragEnd);
        
        // Neue Listener hinzufügen
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
}

// Event Handler für Drag Start
function handleDragStart(e) {
    // Task-ID direkt aus DOM-ID extrahieren
    const taskId = e.target.id.replace('task-', '');
    if (!taskId) {
        e.preventDefault();
        console.warn('Cannot drag - no task ID found');
        return;
    }
    
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Visual feedback
    setTimeout(() => e.target.classList.add('dragging'), 0);
}

// Event Handler für Drag End
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

// Event Handler für Drag Over (Drop Zone)
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
}

// Event Handler für Drag Leave (Drop Zone)
function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

// Event Handler für Drop (Drop Zone)
async function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;
    
    const columnId = e.currentTarget.id;
    await moveTaskToColumn(taskId, columnId);
}

// Task in neue Spalte verschieben
async function moveTaskToColumn(taskId, columnId) {
    // Column ID zu Status mapping
    const statusMap = {
        'column-todo': 'todo',
        'column-inProgress': 'inProgress', 
        'column-awaitFeedback': 'awaitFeedback',
        'column-done': 'done'
    };
    
    const newStatus = statusMap[columnId];
    if (!newStatus) {
        console.error('Unknown column:', columnId);
        return;
    }
    
    try {
        // Task aus lokaler Liste finden
        const task = getTasks().find(t => t.id === taskId);
        if (!task) {
            console.error('Task not found:', taskId);
            return;
        }
        
        // Prüfen ob Status-Änderung nötig
        if (task.status === newStatus) {
            console.log('Task already in target status');
            return;
        }
        
        // Status lokal aktualisieren
        task.status = newStatus;
        
        // Firebase aktualisieren
        await updateTask(taskId, { status: newStatus });
        
        // Board neu rendern
        renderBoard();
        
        // Drag & Drop wieder aktivieren (nach Board-Render)
        setTimeout(enableTaskDragAndDrop, 0);
        
        console.log(`Task ${taskId} moved to ${newStatus}`);
        
    } catch (error) {
        console.error('Error moving task:', error);
        
        // Rollback bei Fehler - Board neu laden
        try {
            await loadTasksForBoard();
            renderBoard();
            setTimeout(enableTaskDragAndDrop, 0);
        } catch (reloadError) {
            console.error('Error during rollback:', reloadError);
        }
    }
}

// Integration mit Board-Rendering
// Wird vom Board-System aufgerufen, nachdem renderBoard() fertig ist
function initializeDragAndDrop() {
    // Kurze Verzögerung um sicherzustellen dass DOM ready ist
    setTimeout(enableTaskDragAndDrop, 10);
}