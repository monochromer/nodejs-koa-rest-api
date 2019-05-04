const Koa = require('koa');
const Router = require('koa-router');

const config = require('config');
const errorMiddleware = require('core/errorMiddleware');
const apiModule = require('modules/api');

const app = new Koa();
const mainRouter = new Router();

mainRouter.use('/api', apiModule.routes());
app.use(errorMiddleware);
app.use(mainRouter.routes(), mainRouter.allowedMethods());

if (!module.parent) {
  app.listen(config.PORT, () => {
    console.log(`Server is runnning on http://localhost:${config.PORT}`)
  });
}

module.exports = app;