const assert = require('assert');
const util = require('util');
// const cp = require('child_process');
// const execFile = util.promisify(cp.execFile);

const agent = require('superagent');

const config = require('config');
const mongoose = require('lib/mongoose');
const User = require('models/user');
const app = require('app');

describe('Users REST API', () => {
  function getURL(path) {
    return `http://localhost:${config.PORT}/api${path}`;
  };

  let server;
  let mongod;

  const fixtureExistingUserData = {
    displayName: 'John Doe',
    email: 'doe.john@company.com'
  };

  const fixtureNewUserData = {
    displayName: 'Alice Doe',
    email: 'doe.alice@wonder.land'
  };

  let existingUser;

  before(done => {
    // mongod = execFile('mongod', ['--dbpath', './dbdata']);
    server = app.listen(config.PORT, done);
  });

  after(done => {
    // mongod && mongod.kill();
    mongoose.disconnect();
    server.close(done);
  });

  beforeEach(async () => {
    await User.remove();
    existingUser = await User.create(fixtureExistingUserData);
  });

  describe('POST /users/', async () => {
    it('creates a user', async () => {
      const res = await agent.post(getURL('/users'))
        .send(fixtureNewUserData)
        .then(res => res.body);

      const user = await User.findById(res._id);

      assert.strictEqual(user.displayName, fixtureNewUserData.displayName);
      assert.strictEqual(user.email, fixtureNewUserData.email);
    });

    it('throws if email already exists', async () => {
      const res = await agent.post(getURL('/users'))
        .send({
          ...fixtureNewUserData,
          ...{
            email: fixtureExistingUserData.email
          }
        })
        .catch(err => err);

        const { body } = res.response;
        assert.strictEqual(res.status, 400);
        assert.strictEqual(body.errors.email, 'Такой email уже существует');
    });

    it('throws if email not valid', async () => {
      const res = await agent.post(getURL('/users'))
        .send({
          displayName: 'Anon',
          email: 'some-invalid-email'
        })
        .catch(err => err);

        const { body } = res.response;
        assert.strictEqual(res.status, 400);
        assert.strictEqual(body.errors.email, 'Некорректный email');
    })
  });

  describe('GET /user/:id', async () => {
    it('gets the user by id', async () => {
      const response = await agent
        .get(getURL(`/users/${existingUser._id}`))
        .catch(err => err);

      assert.strictEqual(response.statusCode, 200);
      assert.ok(/application\/json/.test(response.headers['content-type']));
      assert.strictEqual(response.body.email, existingUser.email);
      assert.strictEqual(response.body._id, existingUser.id);
    });

    it('returns 404 if user does not exist', async () => {
      const { ObjectId } = mongoose.Types;
      const response = await agent
        .get(getURL(`/users/${ObjectId()}`))
        .catch(e => e);
        assert.strictEqual(response.response.statusCode, 404);
    });

    it('returns 404 if invalid id', async () => {
      const response = await agent
        .get(getURL(`/users/abc}`))
        .catch(e => e);
      assert.strictEqual(response.response.statusCode, 404);
    });
  });

  describe('DELETE /user/:id', async () => {
    it('removes user', async () => {
      const response = await agent
        .del(getURL(`/users/${existingUser._id}`))
        .catch(err => err);

      const user = await User.findById(existingUser._id);

      assert.strictEqual(response.statusCode, 200);
      assert.ok(!user);
    });

    it('returns 404 if the user does not exist', async function() {
      const { ObjectId } = mongoose.Types;
      const response = await agent
        .del(getURL(`/users/${ObjectId()}`))
        .catch(err => err);
      assert.strictEqual(response.response.statusCode, 404);
    });
  });

  describe('GET /users', async () => {
    it('gets all users', async function() {
      const response = await agent.get(getURL('/users'));

      assert.strictEqual(response.statusCode, 200);
      assert.ok(/application\/json/.test(response.headers['content-type']));
      assert.strictEqual(response.body.length, 1);
      assert.strictEqual(response.body[0]._id, existingUser.id);
    });
  });
});