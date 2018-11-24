const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = 'TheDumbPassword';

// bcrypt.genSalt(10, (err, salt) => {
//   bcrypt.hash(password, salt, (err, hash) => {
//     console.log(hash);
//   });
// });

var hashedPassword = '$2a$10$GLOYAglcPHoIf4x4VtG12e9CHZ2p3f6qwVk7DGrC4YvA4Pi.p2Y7G';
bcrypt.compare('thiesdfss', hashedPassword, (err, res) => {
  console.log(res);
})
// var data = {
//   id: 55
// };
//
// var token = jwt.sign(data, 'barfybarfbarf');
// console.log(token);
//
// var decoded = jwt.verify(token, 'barfybarfbarf');
// console.log('decoded', decoded);

// var message = 'This is the dumbest string';
// var hash = SHA256(message).toString();
//
// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);
//
//
// var data = {
//   id: 42
// };
//
// var token = {
//   data: data,
//   hash: SHA256(JSON.stringify(data) + 'somethingdude').toString()
// };
//
// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();
//
// var resultHash = SHA256(JSON.stringify(token.data) + 'somethingdude').toString();
//
// if (resultHash === token.hash) {
//   console.log('Data was not changed');
// }
// else {
//   console.log('Someone fucked with your data');
// }
