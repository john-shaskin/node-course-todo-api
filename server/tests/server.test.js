const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');
const {User} = require('../models/user');
const bcrypt = require('bcryptjs');

describe('POST /todos', () =>{
  beforeEach(populateTodos);
  beforeEach(populateUsers);

  it('should create a new TODO', (done) => {
    var text = 'Fart';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) =>{
        if (err) {
          return done(err);
        }
        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch(e => done(e));
      });
  });

  it('should not create a TODO with bad body', (done) => {
    request(app)
      .post('/todos')
      .send({
        text: null
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then(todos => {
          expect(todos.length).toBe(3);
          done();
        }).catch(e => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all the todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(3);
      })
      .end(done);
  })
});

describe('GET /todos/:id', () => {
  it('should return 404 if ID malformed', (done) => {
    request(app)
      .get('/todos/where-is-the-beef')
      .expect(404)
      .expect(res => {
        expect(res.body).toNotExist;
      })
      .end(done);
  });

  it('should return 404 if ID okay but no TODO exists', (done) => {
    request(app)
      .get('/todos/000000000000000000000000')
      .expect(404)
      .expect(res => {
        expect(res.body).toNotExist;
      })
      .end(done);
  });

  it ('should return a TODO by ID, if it exists', (done) => {
    request(app)
    .get('/todos/DEADBEEFDEADBEEFDEADBEEF')
    .expect(200)
    .expect(res => {
      expect(res.body.todo.text).toBe('Something thingered');
    })
    .end(done);
  });

  it ('should return 400 if there was an error', (done) => {
    expect(true).isTrue;
    done();
  });
});

describe('DELETE /todos/:id', () => {
  it('should return 404 if ID malformed', (done) => {
    request(app)
      .delete('/todos/where-is-the-beef')
      .expect(404)
      .expect(res => {
        expect(res.body).toNotExist;
      })
      .end(done);
  });

  it('should return 404 if ID okay but no TODO exists', (done) => {
    request(app)
      .delete('/todos/000000000000000000000000')
      .expect(404)
      .expect(res => {
        expect(res.body).toNotExist;
      })
      .end(done);
  });

  it ('should return a 200, if it exists and was deleted', (done) => {
    var idToDelete = 'DEADBEEFDEADBEEFDEADBEEF'
    request(app)
      .delete(`/todos/${idToDelete}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe('Something thingered');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(idToDelete).then(ghostTodo => {
          expect(ghostTodo).toNotExist;
          return done();
        }).catch(e => done(e));
      });
  });
});

describe('PATCH /todos/:id', () => {
  it('should return 404 if ID malformed', (done) => {
    request(app)
      .patch('/todos/whereisthebeef')
      .expect(404)
      .expect(res => {
        expect(res.body).toNotExist;
      })
      .end(done);
  });

  it('should return 404 if ID okay but no TODO exists', (done) => {
    request(app)
      .patch('/todos/000000000000000000000000')
      .expect(404)
      .expect(res => {
        expect(res.body).toNotExist;
      })
      .end(done);
  });

  it('should not update anything if no properties included in body', (done) => {
    var updateId = '123412341234123412341234';
    request(app)
      .patch(`/todos/${updateId}`)
      .send({ garbage: 'blood' })
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(updateId).then(todo => {
          expect(todo.text).toBe('This is a thing also')
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toBeNull;
          done();
        }).catch(e => {
          return done(e);
        })
      });
  });

  it('should update text, if specified', (done) => {
    var updateId = '123412341234123412341234';
    request(app)
      .patch(`/todos/${updateId}`)
      .send({ text: 'Do the doo doo doot doo' })
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(updateId).then(todo => {
          expect(todo.text).toBe('Do the doo doo doot doo')
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toBeNull;
          done();
        }).catch(e => {
          return done(e);
        });
      });
  });

  it('should update completedAt, if completed set to true', (done) => {
    var updateId = '123412341234123412341234';
    request(app)
      .patch(`/todos/${updateId}`)
      .send({ completed: true })
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(updateId).then(todo => {
          expect(todo.text).toBe('Do the doo doo doot doo')
          expect(todo.completed).toBeTrue;
          expect(todo.completedAt).not.toBeNull;
          done();
        }).catch(e => {
          return done(e);
        });
      });
  });

  it('should null completedAt, if completed set to false', (done) => {
    var updateId = '567856785678567856785678';
    request(app)
      .patch(`/todos/${updateId}`)
      .send({ completed: false })
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(updateId).then(todo => {
          expect(todo.text).toBe('This thing got completed')
          expect(todo.completed).toBeFalse;
          expect(todo.completedAt).toBeNull;
          done();
        }).catch(e => {
          return done(e);
        });
      });
  });
});

describe('POST /users', () => {

  it('should create a new user', (done) => {
    var email = 'iamanidiot@email.me';
    var password = '123456';

    request(app)
      .post('/users/')
      .send({
        email: email,
        password: password,
      })
      .expect(200)
      .expect(res => {
        expect(res.body.email).toBe(email);
        expect(res.body.password).toBeUndefined;
        expect(res.headers["x-auth"]).not.toBeNull;
        expect(res.body.tokens).toNotExist;
        expect(res.body.password).toNotExist;
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then(user => {
          expect(user.email).toBe(email);
          expect(user.password).not.toBeNull;
          expect(user.tokens.length).toBe(1);
          expect(user.tokens[0].access).toBe('auth');
          expect(user.tokens[0].token).not.toBeNull;
          bcrypt.compare(password, user.password, (err, res) => {
            if (err) {
              done(err);
            }
            expect(res).toBeTrue;
            done();
          });
        }).catch(e => {
          done(e);
        })
      });
  });

  it('should return a 400 if you try to create a user with a duplicate email', done => {
    var duplicateEmail = users[0].email;
    request(app)
      .post('/users/')
      .send({
        email: duplicateEmail,
        password: 'thisisanotherpassword'
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.find({email: duplicateEmail}).then(users => {
          expect(users.length).toBe(1);
          done();
        }).catch(e => {
          done(e);
        });
      });
  });

  it('should return a 400 for an invalid email', done => {
    var invalidEmail = "roottoottoot"
    request(app)
      .post('/users/')
      .send({
        invalidEmail,
        password: 'thisisanotherpassword'
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.find({invalidEmail}).then(users => {
          expect(users).toNotExist;
          done();
        }).catch(e => {
          done(e);
        });
      });
  });

  it('should return a 400 if the email is too short', done => {
    var invalidEmail = "ami4"
    request(app)
      .post('/users/')
      .send({
        invalidEmail,
        password: 'thisisanotherpassword'
      })
      .expect(400)
      .end(done);
  });

  it('should return a 400 if the password is too short', done => {
    var email = "shibby@dude.ranch";
    var invalidPassword = "passw";
    request(app)
      .post('/users/')
      .send({
        email,
        invalidPassword
      })
      .expect(400)
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return a user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return a 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).toNotExist;
      })
      .end(done);
  });
});
