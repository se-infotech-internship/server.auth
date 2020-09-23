import Koa from 'koa';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import * as dotenv from 'dotenv';
import sequelize from './util/db';
import userRouter from './routes/user';

const app = new Koa();

dotenv.config();

const port = process.env.PORT || 5001;

app.use(bodyParser());
app.use(json());
app.use(userRouter.routes());

sequelize
  .sync()
  .then(() => {
    console.log('Database connected');
    app.listen(port, () =>
      console.log(`Server is running on port ${port}`),
    );
  })
  .catch((err) => console.log(err));
