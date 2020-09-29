import Koa from 'koa';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import * as dotenv from 'dotenv';
import sequelize from './util/db';
import userRouter from './routes/user';
import passport from 'passport';

const app = new Koa();

dotenv.config();

const port = process.env.PORT || 5001;

app.use(bodyParser());
app.use(json());
app.use(passport.initialize());
app.use(userRouter.routes());

// Error handler
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = { code: err.statusCode, message: err.message };
    ctx.app.emit('error', err, ctx);
  }
});

sequelize
  .sync()
  .then(() => {
    console.log('Database connected');
    app.listen(port, () =>
      console.log(`Server is running on port ${port}`),
    );
  })
  .catch((err) => console.log(err));
