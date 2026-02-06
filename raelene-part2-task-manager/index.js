var express = require('express');
var bodyParser = require("body-parser");
var app = express();
const PORT = process.env.PORT || 5050
var startPage = "register.html";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./public"));

/* istanbul ignore next */ // not my feature (Shahina)
const { addUser } = require('./utils/ShahinaUtil');
/* istanbul ignore next */ // not my feature (Shahina)
app.post('/add-User', addUser);

/* istanbul ignore next */ // not my feature (Ayana)
const { editTask, updateStatus } = require("./utils/AyanaUtil");
/* istanbul ignore next */ // not my feature (Ayana)
app.put('/edit-task/:id', editTask);
/* istanbul ignore next */ // not my feature (Ayana)
app.put("/update-status/:id", updateStatus);

/* istanbul ignore next */ // not my feature (start page / UI)
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/public/" + startPage);
})

/* istanbul ignore next */ // not my feature (Hamsitha)
const { addTask } = require('./utils/HamsithaUtil');
/* istanbul ignore next */ // not my feature (Hamsitha)
app.post('/add-task', addTask);

const { viewTasks } = require('./utils/RaeleneUtil');
app.get('/view-tasks', viewTasks);


let server = null;

// Only start the server when NOT running Jest tests
if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, function () {
    /* istanbul ignore next */ // logging only
    const address = server.address();

    /* istanbul ignore next */ // logging only
    if (address && typeof address === "object") {
      const host = address.address === "::" ? "localhost" : address.address;
      const baseUrl = `http://${host}:${address.port}`;
      console.log(`Demo project at: ${baseUrl}`);
    } else {
      console.log(`Demo project running on port ${PORT}`);
    }
  });
}

module.exports = { app, server };

