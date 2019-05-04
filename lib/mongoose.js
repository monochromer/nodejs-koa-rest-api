const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const config = require('config');

mongoose.set('debug', config['mongodb']['debug']);
mongoose.plugin(beautifyUnique);
mongoose.connect(config['mongodb']['uri'], {
  useNewUrlParser: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connection is open');
});

module.exports = mongoose;
