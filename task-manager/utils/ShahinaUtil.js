const { User } = require('../models/user')
const fs = require('fs').promises;
const path = require('path');

const USERS_FILE = path.join('utils', 'users.json');
const TEMPLATE_FILE = path.join('utils', 'users.template.json');

async function addUser(req, res) {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password and Confirm Password does not match." });
        }

        let users = [];
        try {
            const data = await fs.readFile(USERS_FILE, 'utf8');
            users = JSON.parse(data);
        } catch (err) {
            if (err.code === 'ENOENT') {
                const templateData = await fs.readFile(TEMPLATE_FILE, 'utf8');
                users = JSON.parse(templateData);

                await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
            } else {
                throw err;
            }
        }

        const emailExists = users.some(user => user.email === email);
        if (emailExists) {
            return res.status(400).json({ message: "This email is already in use, please use another email." });
        }

        const newUser = new User(name, email, password, confirmPassword);

        users.push(newUser);
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');

        return res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
}

module.exports = { addUser };