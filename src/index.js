const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username 
  );

  if (!user) {
    return response.status(404).json({error:'User not found'});
  }

  request.user = user;
  return next();

}

/**
 * id: 'uuid'
 * name
 * username
 * todos []
 */

app.post('/users', (request, response) => {
  const { username, name } = request.body;
  const {user} = request
  
  const userAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json(
      {error:"User already exists"}
    );
  }
  
  users.push({
    id: uuidv4,
    name,
    username,
    todos: [],
  });
  return response.status(201).json(users);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);


});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo);
  return response.status(201).json(user.todos);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const {user} = request;

  const id = request.params.id;

  if(!user.todos.id === id){
    
    return response.status(400).send();

  }

  const todo = user.todos.filter((todos) => {
    todos.title = title;
    todos.deadline = deadline;
  });

  return response.status(201).json(user.todos);


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

  const {user} = request;

  const id = request.params.id;
  console.log(id)

  if(!user.todos.id === id){ 
    return response.status(400).send();
  }

  const todo = user.todos.filter((todos) => {
    todos.done= true;
  });

  return response.status(201).json(user.todos);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  const id = request.params.id;
  console.log(id)

  if(!user.todos.id === id){ 
    return response.status(400).send();
    
  }
  //const todo = user.todos.find((todos) => {
  //  (todos.id === id);
  //});

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({error:"todo not exists"})
  };

  user.todos.splice(todo, 1);

  return response.status(201).send();

});


module.exports = app;