// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server.');
  const db = client.db('TodoApp');

  // deleteMany
  // db.collection('Todos').deleteMany({text: 'Crap on flooer'}).then((result => {
  //   console.log(result);
  // }));

  // deleteOne
  // db.collection('Todos').deleteOne({text: 'Dang'}).then((result) => {
  //   console.log(result);
  // });

  // findOneAndDelete
  // db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
  //   console.log(result);
  // });

  // deleteMany again
  db.collection('Users').deleteMany({name: 'MC Hammer'}).then((result) => {
    console.log(result);
  });
  // findOneAndDelete again
  db.collection('Users').findOneAndDelete({_id: new ObjectID('5aa8ab027be48528e4432b22')}).then((result) => {
    console.log(result);
  });

  //client.close();
});
