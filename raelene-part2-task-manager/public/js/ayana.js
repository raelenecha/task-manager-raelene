// Stores the ID of the task being edited
let currentTaskId = null;

// Open edit modal
function openEditModal(task) {
    currentTaskId = task.id;

    document.getElementById("editTitle").value = task.title;
    document.getElementById("editDueDate").value = task.dueDate;

    document.getElementById("editMessage").innerText = "";
    document.getElementById("editTaskModal").style.display = "flex";
}

// Close edit modal
function closeEditModal() {
    document.getElementById("editTaskModal").style.display = "none";
}

// When Save button is clicked
document.getElementById("saveTaskBtn").addEventListener("click", function () {
    editTask();
});

// EDIT TASK function
function editTask() {
    var response = "";

    var jsonData = new Object();
    jsonData.title = document.getElementById("editTitle").value.trim();
    jsonData.dueDate = document.getElementById("editDueDate").value.trim();

    // AJAX PUT
    var request = new XMLHttpRequest();
    request.open("PUT", "/edit-task/" + currentTaskId, true);
    request.setRequestHeader("Content-Type", "application/json");

    request.onload = function () {
        var result = JSON.parse(request.responseText);

        if (request.status !== 200) {
            // backend validation error
            document.getElementById("editMessage").innerText = result.message;
            return;
        }

        alert("Task updated successfully!");

        closeEditModal();
        getTasks(); 
    };

    request.send(JSON.stringify(jsonData));
}

function toggleStatus(id) {
    fetch(`/update-status/${id}`, { method: "PUT" })
        .then(() => getTasks());
}

