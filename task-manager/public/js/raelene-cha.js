// Fetch tasks from backend and display them
async function getTasks() {
    try {
        const response = await fetch('http://localhost:5050/view-tasks');

        // Handle backend errors (400 = corrupted data, 500 = server error)
        if (!response.ok) {
            const errorData = await response.json();

            if (response.status === 400) {
                displayMessage("Some tasks could not be displayed due to data corruption.");
            } else {
                displayMessage("Unable to load tasks due to server error");
            }
            return;
        }

        // Success: tasks retrieved
        const tasks = await response.json();

        // Filter tasks created by logged-in user
        const filteredTasks = tasks.filter(
            task => task.createdBy === localStorage.getItem("email")
        );

        displayTasks(filteredTasks);

    } catch (error) {
        displayMessage("An unexpected error occurred. Please try again later.");
    }
}


// Display tasks in two columns
function displayTasks(tasks) {
    const pendingContainer = document.getElementById("pending-tasks");
    const completedContainer = document.getElementById("completed-tasks");
    let numberOfTasks = { pending: 0, completed: 0 };

    pendingContainer.innerHTML = "";
    completedContainer.innerHTML = "";

    // Sort tasks by due date (earliest first)
    tasks.sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA - dateB;
    });

    tasks.forEach(task => {
        const item = document.createElement("div");
        item.classList.add("task-item");

        item.innerHTML = `
            <button class="status-btn" onclick="toggleStatus(${task.id})">
                ${task.status === "completed" ? "✔" : "○"}
            </button>

            <p>${task.title}</p>
            <span class="due-date">Due Date: ${formatDate(task.dueDate)}</span>

            <button class="edit-btn" onclick='openEditModal(${JSON.stringify(task)})'>
                Edit
            </button>
        `;

        if (task.status === "completed") {
            completedContainer.appendChild(item);
            numberOfTasks.completed++;
        } else {
            pendingContainer.appendChild(item);
            numberOfTasks.pending++;
        }
    });

    // No tasks in either category
    if (numberOfTasks.pending === 0) {
        displayMessage("No pending tasks.", true, false);
    }
    if (numberOfTasks.completed === 0) {
        displayMessage("No completed tasks.", false, true);
    }
}


// Display error or empty-state messages
function displayMessage(message, showInPending = true, showInCompleted = true) {
    const pendingContainer = document.getElementById("pending-tasks");
    const completedContainer = document.getElementById("completed-tasks");

    if (showInPending) {
        pendingContainer.innerHTML = `<p class='message error'>${message}</p>`;
    }
    if (showInCompleted) {
        completedContainer.innerHTML = `<p class='message error'>${message}</p>`;
    }
}


// Format due date for display
function formatDate(dateStr) {
    if (!dateStr) return "No due date";

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-SG", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// Auto-refresh tasks every 5 seconds
setInterval(() => {
    getTasks();
}, 5000);


getTasks();
