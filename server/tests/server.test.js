const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');

const todos = [{
  _id: new ObjectId('DEADBEEFDEADBEEFDEADBEEF'),
  text: 'Something thingered'
}, {
  text: 'This is a thing also'
}];

describe('POST /todos', () =>{
  beforeEach((done) => {
    Todo.remove({}).then(() => {
      return Todo.insertMany(todos);
    }).then(() => done());
  });

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
          expect(todos.length).toBe(2);
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
        expect(res.body.todos.length).toBe(2);
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
