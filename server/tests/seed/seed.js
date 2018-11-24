const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('../../models/todo');
const { User } = require('../../models/user');

const userId1 = new ObjectId();
const userId2 = new ObjectId();
const users = [{
  _id: userId1,
  email: 'borat@usanda.com',
  password: 'somepassword',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userId1, access: 'auth' }, process.env.JWT_SECRET).toString(),
  }],
}, {
  _id: userId2,
  email: 'iamabiggeridiot@yahoo.com',
  password: 'alsoapasswordwhynot',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userId2, access: 'auth' }, process.env.JWT_SECRET).toString(),
  }],
}];

const todos = [{
  _id: new ObjectId('DEADBEEFDEADBEEFDEADBEEF'),
  text: 'Something thingered',
  _creator: userId1,
}, {
  _id: new ObjectId('123412341234123412341234'),
  text: 'This is a thing also',
  _creator: userId2,
}, {
  _id: new ObjectId('567856785678567856785678'),
  text: 'This thing got completed',
  completed: true,
  completedAt: 42,
  _creator: userId2,
}];

const populateTodos = (done) => {
  Todo.remove({}).then(Todo.insertMany(todos)).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    const user1 = new User(users[0]).save();
    const user2 = new User(users[1]).save();

    return Promise.all([user1, user2]);
  }).then(() => {
    done();
  }).catch((e) => {
    console.log('Error saving users', e);
  });
};

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers,
};
