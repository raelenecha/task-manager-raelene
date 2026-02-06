const request = require("supertest");
const fs = require("fs").promises;
const path = require("path");

// Import app + server (your index.js starts the server)
const { app } = require("../index");

// Same tasks.json path used by RaeleneUtil.js
const TASKS_FILE = path.join(__dirname, "..", "utils", "tasks.json");
// Backup original tasks.json content
let originalTasksFileExists = true;
let originalTasksContent = "";
// Read original tasks.json before tests
beforeAll(async () => {
    try {
        originalTasksContent = await fs.readFile(TASKS_FILE, "utf8");
    } catch (err) {
        if (err.code === "ENOENT") {
            originalTasksFileExists = false;
        } else {
            throw err;
        }
    }
});
// Restore original tasks.json after all tests
afterAll(async () => {
    // Restore tasks.json to original state
    if (originalTasksFileExists) {
        await fs.writeFile(TASKS_FILE, originalTasksContent, "utf8");
    } else {
        try { await fs.unlink(TASKS_FILE); } catch (e) { }
    }
    });
// Tests for viewing tasks via API
describe("API Testing – View Tasks", () => {
    beforeEach(async () => {
        // Reset tasks.json to a clean baseline before each test
        await fs.writeFile(TASKS_FILE, JSON.stringify([]), "utf8");
    });

    // POSITIVE case - viewTasks
    it("should return 200 and task list when data is valid", async () => {
        //define valid task data
        const mockData = [
            {
                id: "t-1",
                title: "API Task",
                status: "pending",
                createdBy: "user@example.com",
                dueDate: "2025-02-01"
            }
        ];
        // write mock data to tasks.json
        await fs.writeFile(TASKS_FILE, JSON.stringify(mockData), "utf8");
        //send api req using supertest
        const res = await request(app).get("/view-tasks");
        // Check response
        expect(res.status).toBe(200);
        // validate returned task count
        expect(res.body.length).toBe(1);
        // validate returned task fields
        expect(res.body[0].title).toBe("API Task");
    });

    // viewTasks - missing file
    it("should return 200 and empty list when task file is missing", async () => {
        const backup = TASKS_FILE + ".bak";
        await fs.rename(TASKS_FILE, backup);
        // Now tasks.json is missing
        try {
            const res = await request(app).get("/view-tasks");
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        } finally {
            await fs.rename(backup, TASKS_FILE);
        }
    });

    // NEGATIVE case - viewTasks - corrupted data
    it("should return 400 when corrupted task records are found", async () => {
        //define corrupted task data
        const corrupted = [
            {
                // missing id -> corrupted
                title: "Bad Task",
                status: "pending",
                createdBy: "user@example.com",
                dueDate: "2025-02-01"
            }
        ];
        // write corrupted data to tasks.json
        await fs.writeFile(TASKS_FILE, JSON.stringify(corrupted), "utf8");
        //send api req using supertest
        const res = await request(app).get("/view-tasks");
        // Check response
        expect(res.status).toBe(400);
        // validate error message
        expect(res.body.message).toBe("Corrupted task records found.");
    });

    //viewTasks - invalid format
    it("should return 400 when task data format is invalid", async () => {
        await fs.writeFile(TASKS_FILE, JSON.stringify({}), "utf8");

        const res = await request(app).get("/view-tasks");

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid tasks format. Expected an array.");
    });

    // EDGE case- viewTasks - invalid JSON
    it("should return 500 when tasks.json contains invalid JSON", async () => {
        await fs.writeFile(TASKS_FILE, "not valid json", "utf8");

        const res = await request(app).get("/view-tasks");

        expect(res.status).toBe(500);
        expect(typeof res.body.message).toBe("string");
    });

    // viewTasks - invalid email in createdBy
    it("should return 400 when createdBy email format is invalid", async () => {
        const invalidEmailData = [
            {
                id: "t-2",
                title: "Bad Email Task",
                status: "pending",
                createdBy: "not-an-email",
                dueDate: "2025-02-01"
            }
        ];
        // write corrupted data to tasks.json
        await fs.writeFile(TASKS_FILE, JSON.stringify(invalidEmailData), "utf8");

        const res = await request(app).get("/view-tasks");

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Corrupted task records found.");
        expect(Array.isArray(res.body.corrupted)).toBe(true);
        expect(res.body.corrupted.length).toBe(1);
        expect(res.body.corrupted[0].title).toBe("Bad Email Task");
    });


    // viewTasks - invalid status value
    it("should return 400 when task status is invalid", async () => {
        const invalidStatusData = [
            {
                id: "t-3",
                title: "Bad Status Task",
                status: "in-progress", // invalid (only pending/completed allowed)
                createdBy: "user@example.com",
                dueDate: "2025-02-01"
            }
        ];
        // write corrupted data to tasks.json
        await fs.writeFile(TASKS_FILE, JSON.stringify(invalidStatusData), "utf8");

        const res = await request(app).get("/view-tasks");
        // Check response
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Corrupted task records found.");
        expect(res.body.corrupted.length).toBe(1);
        expect(res.body.corrupted[0].title).toBe("Bad Status Task");
    });


    // viewTasks - invalid dueDate format
    it("should return 400 when dueDate is not a valid date", async () => {
        const invalidDateData = [
            {
                id: "t-4",
                title: "Bad Date Task",
                status: "pending",
                createdBy: "user@example.com",
                dueDate: "not-a-real-date"
            }
        ];
        // write corrupted data to tasks.json
        await fs.writeFile(TASKS_FILE, JSON.stringify(invalidDateData), "utf8");

        const res = await request(app).get("/view-tasks");
        // Check response
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Corrupted task records found.");
        expect(res.body.corrupted.length).toBe(1);
        expect(res.body.corrupted[0].title).toBe("Bad Date Task");
    });

});
