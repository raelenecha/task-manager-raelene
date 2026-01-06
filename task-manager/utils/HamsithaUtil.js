//import the task class from the models folder
//This class is used to create a new task object title, deadline and userID
const { Task } = require('../models/Task');

// Built-in Node.js module for reading and writing files using promises
const fs = require('fs').promises;
const path = require('path');

const TASKS_FILE = path.join('utils', 'tasks.json');
const TEMPLATE_FILE = path.join('utils', 'tasks.template.json');

async function addTask(req, res) {
    try {
        const { title, dueDate, createdBy } = req.body;

        // ERROR CASE 1: Missing required fields
        if (!title || !dueDate || !createdBy) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // ERROR CASE 2: Title too long
        if (title.length > 60) {
            return res.status(400).json({ error: "Title cannot exceed 60 characters." });
        }

        // ----- LOAD EXISTING TASKS -----
        let tasks = [];
        try {
            const data = await fs.readFile(TASKS_FILE, "utf8");
            tasks = JSON.parse(data);
        } catch (err) {
            if (err.code === "ENOENT") {
                const templateData = await fs.readFile(TEMPLATE_FILE, "utf8");
                tasks = JSON.parse(templateData);
                await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf8");
            } else {
                throw err;
            }
        }

        // ERROR CASE 3: Duplicate task
        const exists = tasks.find(t => t.title === title && t.createdBy === createdBy);
        if (exists) {
            return res.status(400).json({ error: "Task already exists for this user." });
        }

        // ----- CREATE NEW TASK -----
        const newTask = new Task(title, dueDate, createdBy);
        tasks.push(newTask);

        // save updated file
        await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf8");

        // success response
        return res.status(201).json({ message: "Task added successfully", task: newTask });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}

module.exports = { addTask };
