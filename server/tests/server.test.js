const expect = require('expect');
const request = require('supertest');
const bcrypt = require('bcryptjs');

const { app } = require('../server');
const { User } = require('../models/user');
const { Todo } = require('../models/todo');
const {
  todos,
  populateTodos,
  users,
  populateUsers,
} = require('./seed/seed');

describe('POST /todos', () => {
  beforeEach(populateTodos);
  beforeEach(populateUsers);

  it('should create a new TODO', (done) => {
    const text = 'Fart';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        return Todo.find({ text }).then((foundTodos) => {
          expect(foundTodos.length).toBe(1);
          expect(foundTodos[0].text).toBe(text);
          done();
        }).catch(e => done(e));
      });
  });

  it('should not create a TODO with bad body', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({
        text: null,
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Todo.find().then((foundTodos) => {
          expect(foundTodos.length).toBe(3);
          done();
        }).catch(e => done(e));
      });
  });

  it('should return a 401 if no valid x-auth header is included', (done) => {
    request(app)
      .post('/todos')
      .send({
        text: 'Not going to get saved',
      })
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Todo.find().then((foundTodos) => {
          expect(foundTodos.length).toBe(3);
          done();
        }).catch(e => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all the todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });

  it('should return a 401, if no valid x-auth header is sent', (done) => {
    request(app)
      .get('/todos')
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return done();
      });
  });
});

describe('GET /todos/:id', () => {
  it('should return 404 if ID malformed', (done) => {
    request(app)
      .get('/todos/where-is-the-beef')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('should return 404 if ID okay but no TODO exists', (done) => {
    request(app)
      .get('/todos/000000000000000000000000')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('should return 404 if TODO owned by another user', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('should return a TODO by ID, if it exists', (done) => {
    request(app)
      .get('/todos/DEADBEEFDEADBEEFDEADBEEF')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe('Something thingered');
      })
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should return 404 if ID malformed', (done) => {
    request(app)
      .delete('/todos/where-is-the-beef')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('should return 404 if ID okay but no TODO exists', (done) => {
    request(app)
      .delete('/todos/000000000000000000000000')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('should return a 404, if it does not belong to the user', (done) => {
    const idToDelete = todos[2]._id;
    request(app)
      .delete(`/todos/${idToDelete}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }

        return Todo.findById(idToDelete).then((ghostTodo) => {
          expect(ghostTodo).toBeTruthy();
          done();
        }).catch((e) => {
          done(e);
        });
      });
  });

  it('should return a 200, if it exists and was deleted', (done) => {
    const idToDelete = todos[0]._id;
    request(app)
      .delete(`/todos/${idToDelete}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe('Something thingered');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Todo.findById(idToDelete).then((ghostTodo) => {
          expect(ghostTodo).toBeFalsy();
          done();
        }).catch(e => done(e));
      });
  });
});

describe('PATCH /todos/:id', () => {
  it('should return 404 if ID malformed', (done) => {
    request(app)
      .patch('/todos/whereisthebeef')
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('should return 404 if ID okay but no TODO exists', (done) => {
    request(app)
      .patch('/todos/000000000000000000000000')
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('should not update anything if no properties included in body', (done) => {
    const updateId = '123412341234123412341234';
    request(app)
      .patch(`/todos/${updateId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({ garbage: 'blood' })
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Todo.findById(updateId).then((todo) => {
          expect(todo.text).toBe('This is a thing also');
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toBeNull();
          done();
        }).catch(done);
      });
  });

  it('should return a 404 if TODO does not belong to the user', (done) => {
    const updateId = '123412341234123412341234';
    request(app)
      .patch(`/todos/${updateId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({ text: 'Do the doo doo doot doo', completed: true })
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Todo.findById(updateId).then((todo) => {
          expect(todo.text).toBe('This is a thing also');
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toBeNull();
          done();
        }).catch((e) => {
          done(e);
        });
      });
  });

  it('should update text, if specified', (done) => {
    const updateId = '123412341234123412341234';
    request(app)
      .patch(`/todos/${updateId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({ text: 'Do the doo doo doot doo' })
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Todo.findById(updateId).then((todo) => {
          expect(todo.text).toBe('Do the doo doo doot doo');
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toBeNull();
          done();
        }).catch((e) => {
          done(e);
        });
      });
  });

  it('should update completedAt, if completed set to true', (done) => {
    const updateId = '123412341234123412341234';
    request(app)
      .patch(`/todos/${updateId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({ completed: true })
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Todo.findById(updateId).then((todo) => {
          expect(todo.text).toBe('Do the doo doo doot doo');
          expect(todo.completed).toBeTruthy();
          expect(todo.completedAt).not.toBeNull();
          expect(typeof todo.completedAt).toBe('number');
          done();
        }).catch((e) => {
          done(e);
        });
      });
  });

  it('should null completedAt, if completed set to false', (done) => {
    const updateId = '567856785678567856785678';
    request(app)
      .patch(`/todos/${updateId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({ completed: false })
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return Todo.findById(updateId).then((todo) => {
          expect(todo.text).toBe('This thing got completed');
          expect(todo.completed).toBeFalsy();
          expect(todo.completedAt).toBeNull();
          done();
        }).catch((e) => {
          done(e);
        });
      });
  });
});

describe('POST /users', () => {
  beforeEach(populateTodos);
  beforeEach(populateUsers);

  it('should create a new user', (done) => {
    const email = 'iamanidiot@email.me';
    const password = '123456';

    request(app)
      .post('/users/')
      .send({
        email,
        password,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(email);
        expect(res.body.password).toBeUndefined();
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body.tokens).toBeUndefined();
        expect(res.body.password).toBeUndefined();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return User.findOne({ email }).then((user) => {
          expect(user.email).toBe(email);
          expect(user.password).not.toBeNull();
          expect(user.tokens.length).toBe(1);
          expect(user.tokens[0].access).toBe('auth');
          expect(user.tokens[0].token).not.toBeNull();
          bcrypt.compare(password, user.password, (bErr, bRes) => {
            if (bErr) {
              done(bErr);
            }
            expect(bRes).toBeTruthy();
            done();
          });
        }).catch((e) => {
          done(e);
        });
      });
  });

  it('should return a 400 if you try to create a user with a duplicate email', (done) => {
    const duplicateEmail = users[0].email;
    request(app)
      .post('/users/')
      .send({
        email: duplicateEmail,
        password: 'thisisanotherpassword',
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        return User.find({ email: duplicateEmail }).then((foundUsers) => {
          expect(foundUsers.length).toBe(1);
          done();
        }).catch((e) => {
          done(e);
        });
      });
  });

  it('should return a 400 for an invalid email', (done) => {
    const invalidEmail = 'roottoottoot';
    request(app)
      .post('/users/')
      .send({
        invalidEmail,
        password: 'thisisanotherpassword',
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return User.find({ invalidEmail }).then((foundUsers) => {
          expect(foundUsers).toHaveLength(0);
          done();
        }).catch(e => done(e));
      });
  });

  it('should return a 400 if the email is too short', (done) => {
    const invalidEmail = 'ami4';
    request(app)
      .post('/users/')
      .send({
        invalidEmail,
        password: 'thisisanotherpassword',
      })
      .expect(400)
      .end(done);
  });

  it('should return a 400 if the password is too short', (done) => {
    const email = 'shibby@dude.ranch';
    const invalidPassword = 'passw';
    request(app)
      .post('/users/')
      .send({
        email,
        invalidPassword,
      })
      .expect(400)
      .end(done);
  });
});

describe('GET /users/me', () => {
  beforeEach(populateTodos);
  beforeEach(populateUsers);

  it('should return a user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return a 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users/login', () => {
  beforeEach(populateTodos);
  beforeEach(populateUsers);

  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password,
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return User.findById(users[1]._id).then((user) => {
          expect(user.toObject().tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth'],
          });
          done();
        }).catch(e => done(e));
      });
  });

  it('should return a 400 on invalid credentials', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: 'cecinestpasunmotdepasse',
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        return User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch(e => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return User.findById(users[0]._id).then((user) => {
          expect(user.tokens).toHaveLength(0);
          done();
        }).catch(done);
      });
  });
});
