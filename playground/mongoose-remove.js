const {ObjectId} = require('mongodb');
const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');

// Todo.remove({}).then(result => {
//   console.log(result);
// });

// Todo.findOneAndRemove()
// Todo.findByIdAndRemove()
Todo.findOneAndRemove({ _id: '5b91f35a7978f248496f72c5'}).then(todo => {
  console.log(todo);
})

Todo.findByIdAndRemove('5b91f35a7978f248496f72c5').then(todo => {
  console.log(todo);
})
