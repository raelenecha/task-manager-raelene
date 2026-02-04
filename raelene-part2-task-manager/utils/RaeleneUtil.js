const fs = require('fs').promises;
const path = require('path');

// tasks.json is in the same folder as this file (utils/)
const TASKS_FILE = path.join(__dirname, 'tasks.json');

async function viewTasks(req, res) {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');

        let allTasks = JSON.parse(data);

        //  Ensure tasks.json always contains an array
        if (!Array.isArray(allTasks)) {
            return res.status(400).json({
                message: "Invalid tasks format. Expected an array."
            });
        }

        //  Validate task fields
        const corrupted = allTasks.filter(task => validateTask(task));

        if (corrupted.length > 0) {
            return res.status(400).json({
                message: "Corrupted task records found.",
                corrupted: corrupted
            });
        }

        return res.status(200).json(allTasks);

    } catch (error) {
        // File does not exist → no tasks yet
        if (error.code === 'ENOENT') {
            return res.status(200).json([]);
        }

        // Other errors (usually JSON.parse errors)
        return res.status(500).json({ message: error.message });
    }
}

function validateTask(task) {
    const missingField =
        !task.id ||
        task.title == null ||
        task.status == null ||
        !task.createdBy ||
        !task.dueDate;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmail = !emailRegex.test(task.createdBy);

    const invalidStatus = task.status !== "pending" && task.status !== "completed";

    let invalidDueDate = false;
    if (task.dueDate) {
        const d = new Date(task.dueDate);
        invalidDueDate = isNaN(d.getTime());
    }

    return missingField || invalidEmail || invalidStatus || invalidDueDate;
}

module.exports = { viewTasks };
