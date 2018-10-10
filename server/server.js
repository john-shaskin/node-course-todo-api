require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const {ObjectId} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
  console.log(req.body);
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  todo.save().then(doc => {
    res.send(doc);
  }).catch(e => {
    res.status(400);
    res.send(e);
  });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({
      todos
    })
  }).catch(e => {
    res.status(400);
    res.send(e);
  })
});

// GET /todos/:id
app.get('/todos/:id', authenticate, (req, res) => {
  var todoId = req.params.id || '';
  if (!ObjectId.isValid(todoId)) {
    res.status(404);
    res.send();
  }
  else {
    Todo.findOne({
        _id: todoId,
        _creator: req.user._id
      }).then(todo => {
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
app.delete('/todos/:id', authenticate, (req, res) => {
  var todoId = req.params.id || '';
  if (!ObjectId.isValid(todoId)) {
    res.status(404);
    res.send();
  }

  else {
    Todo.findOneAndRemove({
      _id: todoId,
      _creator: req.user._id
    }).then(todo => {
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

// PATCH /todos/:id
app.patch('/todos/:id', authenticate, (req, res) => {
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

  Todo.findOneAndUpdate({
      _id: todoId,
      _creator: req.user._id
    }, {$set: body}, {new: true}).then(todo => {
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

// GET /users/me
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// POST /users/login (email, password)
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  var unauthenticatedMessage = 'Incorrect user/password.'
  if (!body.email || !body.password) {
    return res.status(401).send(unauthenticatedMessage);
  }

  User.findByCredentials(body.email, body.password).then(user => {
    return user.generateAuthToken().then(token => {
      res.header('x-auth', token).send(user);
    });
  }).catch(e => {
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }).catch(() => {
    res.status(400).send();
  })
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
