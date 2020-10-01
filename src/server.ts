import Koa from 'koa';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import * as dotenv from 'dotenv';
import sequelize from './storage/sql'
import userRouter from './routes/user';
import adminRouter from './routes/admin';
import messageRouter from './routes/message';

dotenv.config();
const app = new Koa();

const port = process.env.PORT || 5001;

app.keys = ['keys', 'keykeys'];
app.use(bodyParser());
app.use(json());

app.use(userRouter.routes());
app.use(adminRouter.routes());
app.use(messageRouter.routes());

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
