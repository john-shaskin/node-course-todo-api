require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

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
});

app.patch('/todos/:id', (req, res) => {
  var todoId = req.params.id || '';
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectId.isValid(todoId)) {
    res.status(404);
    return res.send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  }
  else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(todoId, {$set: body}, {new: true}).then(todo => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch(e => {
    res.status(400).send(e);
  })
});

// POST /users
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then(token => {
    res.header('x-auth', token).send(user);
  }).catch(e => {
    res.status(400).send(e);
  });

});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
