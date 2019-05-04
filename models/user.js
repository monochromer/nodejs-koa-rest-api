const mongoose = require('lib/mongoose');
const _ = require('lodash');

const EMAIL_REGEXP = /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/;

const publicFields = ['email', 'displayName'];

const userSchema = mongoose.Schema({
  displayName: {
    type: String,
    required: 'У пользователя должно быть имя',
    unique: 'Такое имя уже существует'
  },
  email: {
    type: String,
    required: 'E-mail пользователя не должен быть пустым',
    validate: [
      {
        validator(value) {
          return EMAIL_REGEXP.test(value);
        },
        message: 'Некорректный email'
      }
    ],
    unique: 'Такой email уже существует'
  },
  gender: {
    type: String,
    enum: ['male', 'female']
  }
}, {
  timestamps: true,
  toObject: {
    transform(doc, ret, options) {
      return _.pick(ret, [...publicFields, '_id']);
    }
  }
});

userSchema.statics.publicFields = publicFields;

const userModel = mongoose.model('User', userSchema, 'users');

module.exports = userModel;