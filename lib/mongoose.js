const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const config = require('config');

mongoose.set('debug', config['mongodb']['debug']);
mongoose.plugin(beautifyUnique);

function connect() {
  mongoose.connect(config['mongodb']['uri'], {
    useNewUrlParser: true
  });
}

connect();

const db = mongoose.connection;

db.on('error', function(e) {
  console.log("db: mongodb error " + e);
  setTimeout(() => {
    connect();
  }, 500);
});

db.on('connected', function(e){
  console.log('db: mongodb is connected');
});

db.on('disconnecting', function(){
  console.log('db: mongodb is disconnecting!!!');
});

db.on('disconnected', function(){
  console.log('db: mongodb is disconnected!!!');
});

db.on('reconnected', function(){
  console.log('db: mongodb is reconnected: ' + url);
});

db.on('timeout', function(e) {
  console.log("db: mongodb timeout "+e);
  // reconnect here
});

db.on('close', function(){
  console.log('db: mongodb connection closed');
});

module.exports = mongoose;
