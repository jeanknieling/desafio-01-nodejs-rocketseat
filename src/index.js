const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find((user) => user.username === username);

  if (!userExists) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = userExists;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.find((user) => user.username == username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  return response.status(201).json(users.at(-1));
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const userToDo = user.todos.filter((todo) => todo.id === id)[0];

  if (!userToDo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  userToDo.title = title ?? userToDo.title;
  userToDo.deadline = new Date(deadline) ?? userToDo.deadline;

  return response.json(userToDo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userToDo = user.todos.filter((todo) => todo.id === id)[0];

  if (!userToDo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  userToDo.done = true;

  return response.json(userToDo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userToDoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (userToDoIndex === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(userToDoIndex, 1);

  return response.status(204).json();
});

module.exports = app;
