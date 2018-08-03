const {ObjectId} = require('mongodb');
const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');

var userId = '5b2c8094b5bfa7d03a832b17';

User.findById({
  _id: userId
}).then(user => {
  if (!user) {
    console.log('User not found');
  }
  else{
    console.log('User by Id', JSON.stringify(user, null, 2));
  }
}).catch(e => {
  console.log(e);
});

// var id = '5b57fb290e778a8032e2602f11';
//
// if (!ObjectId.isValid(id)) {
//   console.log('ID is not valid');
// }
// Todo.find({
//   _id: id
// }).then(todos => {
//   console.log('Todos', todos);
// });
//
// Todo.findOne({
//   _id: id
// }).then(todo => {
//   console.log('Todo', todo);
// });

// Todo.findById(id).then(todo => {
//   if (!todo) {
//     return console.log('Id not found');
//   }
//   console.log('Todo By Id', todo);
// }).catch(e => console.log(e));
