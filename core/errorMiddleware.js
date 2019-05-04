const { STATUS_CODES } = require('http');

module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    if (e.status) {
      ctx.body = e.message;
      ctx.status = e.status;
    } else if (e.name == "ValidationError") {

      ctx.status = 400;

      let errors = {};
      for (let field in e.errors) {
        errors[field] = e.errors[field].message;
      }

      ctx.body = {
        errors: errors
      };

    } else {
      ctx.body = STATUS_CODES[500];
      ctx.status = 500;
      console.error(e.message, e.stack);
    }
  }
};
