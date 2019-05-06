const { STATUS_CODES } = require('http');
const Router = require('koa-router');
const _ = require('lodash');

const mongoose = require('lib/mongoose');
const User = require('models/user');

const usersRouter = new Router();

usersRouter
  .param('id', async (id, ctx, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ctx.throw(404);
    }
    const userById = await User.findById(id);
    if (!userById) {
      ctx.throw(404, 'user with this id not found');
    }
    ctx.state.userById = userById;
    await next();
  })
  .get('/', async (ctx, next) => {
    let { limit, skip } = ctx.request.query;
    limit = limit ? parseInt(limit) : 0;
    skip = skip ? parseInt(skip) : 0;
    const [ users, count ] = await Promise.all([
      User.find({}, null, { skip, limit }),
      User.estimatedDocumentCount()
    ]);
    ctx.set('X-Count', count);
    ctx.body = users;
  })
  .get('/:id', async (ctx, next) => {
    ctx.body = ctx.state.userById;
  })
  .del('/:id', async (ctx, next) => {
    await ctx.state.userById.remove();
    ctx.body = STATUS_CODES[200];
  })
  .patch('/:id', async (ctx, next) => {
    const { body } = ctx.request;
    const newUserData = _.pick(body, User.publicFields);
    const user = ctx.state.userById;
    Object.assign(user, newUserData);
    await user.save();
    ctx.body = user;
  })
  .post('/', async (ctx, next) => {
    const { body } = ctx.request;
    const userData = _.pick(body, User.publicFields);
    const user = await User.create(userData);
    ctx.body = user;
  });

module.exports = usersRouter;