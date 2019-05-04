const isTest = process.env.NODE_ENV === 'test';

module.exports = Object.freeze({
  PORT: process.env.PORT || 3000,
  mongodb: {
    debug: isTest ? false : true,
    uri: `mongodb://localhost:27017/${isTest ? `test` : `users`}`
  }
})