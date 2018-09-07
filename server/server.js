const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  console.log(req.body);
  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then(doc => {
    res.send(doc);
  }).catch(e => {
    res.status(400);
    res.send(e);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({
      todos
    })
  }).catch(e => {
    res.status(400);
    res.send(e);
  })
});

// GET /todos/:id
app.get('/todos/:id', (req, res) => {
  var todoId = req.params.id || '';
  if (!ObjectId.isValid(todoId)) {
    res.status(404);
    res.send();
  }
  else {
    Todo.findById(todoId).then(todo => {
      if (todo === null) {
        res.status(404);
        res.send();
      }
      else {
        res.status(200);
        res.send({todo});
      }
    }).catch(e => {
      res.status(400);
      res.send(e);
    });
  }
});

// DELETE /todos/:id
app.delete('/todos/:id', (req, res) => {
  var todoId = req.params.id || '';
  if (!ObjectId.isValid(todoId)) {
    res.status(404);
    res.send();
  }

  else {
    Todo.findByIdAndRemove(todoId).then(todo => {
      if (!todo) {
        res.status(404);
        res.send();
      }
      else {
        res.send({todo});
      }
    }).catch(e => {
      res.status(400);
      res.send(e);
    });
  }
})

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
