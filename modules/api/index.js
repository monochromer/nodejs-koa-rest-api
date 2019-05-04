const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const usersModule = require('./users');

const apiRouter = new Router();

apiRouter.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  // Access-Control-Allow-Headers, Access-Control-Allow-Methods
  await next();
})
apiRouter.use(bodyParser({
  jsonLimit: '56kb'
}));
apiRouter.use('/users', usersModule.routes());

module.exports = apiRouter;