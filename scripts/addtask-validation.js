(function () {
    function validateForm(taskData) {
        let hasError = false;
        if (!validateTitle(taskData.title)) hasError = true;
        if (!validateDueDate(taskData.dueDate)) hasError = true;
        if (!validateCategory(taskData.category)) hasError = true;
        return hasError;
    }

    function validateTitle(title) {
        const titleInput = document.querySelector(".title-input");
        const titleError = document.querySelector(".error-message");
        const valid = !!title.trim();
        setValidationState(titleInput, titleError, valid);
        return valid;
    }

    function validateDueDate(dueDate) {
        const container = document.querySelector(".due-date-content");
        const error = document.querySelector(".due-date-container .error-message");
        const valid = !!dueDate;
        setValidationState(container, error, valid);
        return valid;
    }

    function validateCategory(category) {
        const content = document.querySelector(".category-content");
        const error = document.querySelector(".category-container .error-message");
        const valid = category && category !== "Select task category";
        setValidationState(content, error, valid);
        return valid;
    }

    function setValidationState(element, errorEl, isValid) {
        element.style.borderBottom = isValid
            ? "1px solid #D1D1D1"
            : "1px solid #FF4D4D";
        errorEl.style.display = isValid ? "none" : "block";
    }

    // ✅ global zugänglich machen (ohne window)
    this.validateForm = validateForm;
})();
