class Task {
    constructor(title, dueDate, createdBy) {
        this.title = title;
        this.dueDate = dueDate;
        this.createdBy = createdBy;


        this.status = "pending";

        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        this.id = timestamp + "" + random.toString().padStart(3, '0');
    }
}

module.exports = { Task };
