const fs = require('fs').promises;
const path = require('path');

const TASKS_FILE = path.join('utils', 'tasks.json');

async function editTask(req, res) {
    try {
        const { id } = req.params;
        const { title, dueDate, status } = req.body;

        // Validation for empty title and dueDate
        const emptyTitle = !title || title.trim() === "";
        const emptyDueDate = !dueDate || dueDate.trim() === "";

        // Both empty
        if (emptyTitle && emptyDueDate) {
            return res.status(400).json({
                message: 'Both title and dueDate fields cannot be empty.'
            });
        }

        // Only title empty
        if (emptyTitle) {
            return res.status(400).json({
                message: 'Title field cannot be empty.'
            });
        }

        // Only dueDate empty
        if (emptyDueDate) {
            return res.status(400).json({
                message: 'Due date field cannot be empty.'
            });
        }

        // Validate max title length (100 characters)
        if (title.length > 60) {
            return res.status(400).json({
                message: 'Title cannot exceed 60 characters.'
            });
        }

        let tasks = [];

        // Read tasks.json
        try {
            const data = await fs.readFile(TASKS_FILE, 'utf8');
            tasks = JSON.parse(data);
        } catch (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ message: 'No tasks found to edit.' });
            } else {
                throw err;
            }
        }

        // Find task by ID
        const taskIndex = tasks.findIndex(t => t.id == id);
        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // Update fields 
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            title: title || tasks[taskIndex].title,
            dueDate: dueDate || tasks[taskIndex].dueDate,
            status: status || tasks[taskIndex].status
        };

        // Save file
        await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');

        return res.status(200).json({
            message: 'Task updated successfully!',
            task: tasks[taskIndex]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

async function updateStatus(req, res) {
    try {
        const { id } = req.params;

        let tasks = JSON.parse(await fs.readFile(TASKS_FILE, 'utf8'));

        const taskIndex = tasks.findIndex(t => t.id == id);
        if (taskIndex === -1) {
            return res.status(404).json({ message: "Task not found." });
        }

        // Toggle status
        tasks[taskIndex].status =
            tasks[taskIndex].status === "completed" ? "pending" : "completed";

        await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');

        return res.status(200).json({
            message: "Status updated successfully",
            task: tasks[taskIndex]
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = { editTask, updateStatus };
