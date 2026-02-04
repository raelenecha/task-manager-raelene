// Mock fs before importing util
jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        writeFile: jest.fn()
    }
}));

const fs = require('fs').promises;
const { viewTasks } = require('../utils/RaeleneUtil');

// Tests for viewing tasks
describe('Unit Tests for View Tasks', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });
    //viewTasks
    it('viewTasks should return tasks successfully', async () => {
        const mockData = JSON.stringify([
            {
                id: "t-1",
                title: "Test Task",
                description: "DVOPS assignment",
                dueDate: "2025-02-01",
                status: "pending",
                createdBy: "user@example.com"
            }
        ]);

        fs.readFile.mockResolvedValue(mockData);

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await viewTasks(req, res);

        expect(res.status).toHaveBeenCalledWith(200);

        const response = res.json.mock.calls[0][0];
        expect(response.length).toBe(1);
        expect(response[0].title).toBe('Test Task');
    });

    //viewTasks - missing file
    it('should return empty task list when task file is missing', async () => {
        fs.readFile.mockRejectedValue({ code: 'ENOENT' });

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await viewTasks(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    //viewTasks - corrupted data
    it('should reject corrupted task records', async () => {
        const mockData = JSON.stringify([
            {
                title: "Bad Task",
                status: "pending",
                createdBy: "user@example.com",
                dueDate: "2025-02-01"
                // missing id → corrupted
            }
        ]);

        fs.readFile.mockResolvedValue(mockData);

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await viewTasks(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];
        expect(response.message).toBe("Corrupted task records found.");
    });

    //viewTasks - invalid data format
    it('should reject invalid task data format', async () => {
        fs.readFile.mockResolvedValue(JSON.stringify({}));

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await viewTasks(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];
        expect(response.message).toBe("Invalid tasks format. Expected an array.");
    });

    //viewTasks - read error
    it('should return server error when task data cannot be parsed', async () => {
        fs.readFile.mockResolvedValue("not valid json");

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await viewTasks(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    //edge cases - viewTasks - missing dueDate
    it('should mark task as corrupted when dueDate is missing (covers dueDate branch)', async () => {
        const mockData = JSON.stringify([
            {
                id: "t-missing-date",
                title: "Missing due date",
                status: "pending",
                createdBy: "user@example.com"
                // dueDate intentionally missing
            }
        ]);

        fs.readFile.mockResolvedValue(mockData);

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await viewTasks(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];
        expect(response.message).toBe("Corrupted task records found.");
    });

    //viewTasks - invalid dueDate
    it('should mark task as corrupted when dueDate is invalid (covers invalidDueDate branch)', async () => {
        const mockData = JSON.stringify([
            {
                id: "t-bad-date",
                title: "Bad due date",
                status: "pending",
                createdBy: "user@example.com",
                dueDate: "not-a-date"
            }
        ]);

        fs.readFile.mockResolvedValue(mockData);

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await viewTasks(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        const response = res.json.mock.calls[0][0];
        expect(response.message).toBe("Corrupted task records found.");
    });

    //viewTasks - null title
    it('should reject task when title is null (covers missingField title branch)', async () => {
        const mockData = JSON.stringify([
            {
                id: "t-null-title",
                title: null,                 // triggers title == null
                status: "pending",
                createdBy: "user@example.com",
                dueDate: "2025-02-01"
            }
        ]);

        fs.readFile.mockResolvedValue(mockData);

        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await viewTasks(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json.mock.calls[0][0].message).toBe("Corrupted task records found.");
    });

    //viewTasks - null status
    it('should reject task when status is null (covers missingField status branch)', async () => {
        const mockData = JSON.stringify([
            {
                id: "t-null-status",
                title: "Has title",
                status: null,                // triggers status == null
                createdBy: "user@example.com",
                dueDate: "2025-02-01"
            }
        ]);

        fs.readFile.mockResolvedValue(mockData);

        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await viewTasks(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json.mock.calls[0][0].message).toBe("Corrupted task records found.");
    });

    //viewTasks - invalid email
    it('should reject task when createdBy email is invalid (covers invalidEmail branch)', async () => {
        const mockData = JSON.stringify([
            {
                id: "t-bad-email",
                title: "Bad email",
                status: "pending",
                createdBy: "not-an-email",   // invalid email format
                dueDate: "2025-02-01"
            }
        ]);

        fs.readFile.mockResolvedValue(mockData);

        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await viewTasks(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json.mock.calls[0][0].message).toBe("Corrupted task records found.");
    });

});
