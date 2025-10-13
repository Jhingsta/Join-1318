(function () {
    function getTaskData() {
        return {
            title: getTitle(),
            description: getDescription(),
            dueDate: getDueDate(),
            priority: getPriority(),
            assignedUsersFull: getAssignedUsers(),
            category: getCategory(),
            subtasks: getSubtasks(),
        };
    }

    function getTitle() {
        return document.querySelector(".title-input")?.value.trim() || "";
    }

    function getDescription() {
        return document.querySelector(".description-input")?.value.trim() || "";
    }

    function getDueDate() {
        return document.querySelector(".due-date-input")?.value || "";
    }

    function getPriority() {
        const priorityBtn = document.querySelector(".priority-frame.active");
        return priorityBtn ? priorityBtn.textContent.trim().toLowerCase() : "medium";
    }

    function getAssignedUsers() {
        const assignedDropdown = document.getElementById("assigned-dropdown");
        if (!assignedDropdown) return [];

        const selected = [];
        assignedDropdown.querySelectorAll(".checkbox-wrapper.checked").forEach(wrapper => {
            const div = wrapper.closest(".dropdown-item");
            const userId = div?.dataset.userId;
            const user = (window.users || []).find(u => u.id === userId);
            if (user) selected.push(formatUser(user));
        });
        return selected;
    }

    function formatUser(user) {
        return {
            id: user.id,
            name: user.name,
            initials: user.initials,
            color: user.color,
        };
    }

    function getCategory() {
        const categoryEl = document.querySelector(".category-content .assigned-text");
        return categoryEl ? categoryEl.textContent.trim() : null;
    }

    function getSubtasks() {
        const subtaskList = document.querySelector("#subtask-list");
        const subtaskSpans = subtaskList?.querySelectorAll("li span") || [];
        const subtaskItems = Array.from(subtaskSpans)
            .map(span => span.textContent.trim())
            .filter(title => title.length > 0)
            .map(title => ({ title, done: false }));
        return {
            total: subtaskItems.length,
            completed: 0,
            items: subtaskItems
        };
    }

    // 🔹 globale Referenz erstellen, ohne window zu verwenden
    this.getTaskData = getTaskData;

})();
