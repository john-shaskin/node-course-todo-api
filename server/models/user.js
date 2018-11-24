const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    required: true,
    minlength: 5,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email.',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  tokens: [{
    access: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  }],
});

UserSchema.methods.generateAuthToken = function generateAuthToken() {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({
    _id: user._id.toHexString(),
    access,
  }, process.env.JWT_SECRET).toString();

  user.tokens = user.tokens.concat([{ access, token }]);

  return user.save().then(() => token);
};

UserSchema.methods.removeToken = function removeToken(token) {
  const user = this;

  return user.update({
    $pull: {
      tokens: { token },
    },
  });
};

UserSchema.statics.findByToken = function findByToken(token) {
  const User = this;
  let decoded = null;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  }
  catch (e) {
    return Promise.reject(e);
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth',
  });
};

UserSchema.statics.findByCredentials = function findByCredentials(email, password) {
  const User = this;

  return User.findOne({ email }).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (err || !res) {
          return reject(err);
        }

        return resolve(user);
      });
    });
  });
};

UserSchema.pre('save', function pre(next) {
  const user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        console.log(err);
      }
      bcrypt.hash(user.password, salt, (err2, hashedPassword) => {
        if (err2) {
          console.log(err);
        }
        user.password = hashedPassword;
        next();
      });
    });
  }
  else {
    next();
  }
});

UserSchema.methods.toJSON = function toJSON() {
  const user = this;

  const userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

const User = mongoose.model('User', UserSchema);

module.exports = { User };
