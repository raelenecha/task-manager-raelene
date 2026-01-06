// Opens modal when "Add Task" button is clicked
document.querySelector(".add-btn").addEventListener("click", () => {
    document.getElementById("addTaskModal").style.display = "flex";
});

// CLOSE modal when clicking the 'X' button
document.querySelector(".close-btn").addEventListener("click", () => {
    document.getElementById("addTaskModal").style.display = "none";
});

// CLOSE modal when clicking outside the modal
window.addEventListener("click", function (e) {
    const modal = document.getElementById("addTaskModal");
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

// Handles form submit
document.getElementById("taskForm").addEventListener("submit", function (e) {
    e.preventDefault();
    addTask();
});
function addTask() {
    var response = "";

    // Create data object
    var jsonData = new Object();
    jsonData.title = document.getElementById("taskName").value;
    jsonData.dueDate = document.getElementById("taskDate").value;

    // Get user email from login system
    jsonData.createdBy = localStorage.getItem("email");

    // AJAX POST
    var request = new XMLHttpRequest();
    request.open("POST", "/add-task", true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function () {
        response = JSON.parse(request.responseText);

        if (response.error) {
            // BACKEND ERROR
            alert(response.error);
        } else {
            // BACKEND SUCCESS
            alert("Added Task: " + response.task.title);

            document.getElementById("taskName").value = "";
            document.getElementById("taskDate").value = "";
            document.getElementById("addTaskModal").style.display = "none";
        }
    };

    request.send(JSON.stringify(jsonData));
}
