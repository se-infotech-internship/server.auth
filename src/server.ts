import Koa from 'koa';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import * as dotenv from 'dotenv';
import sequelize from './storage/sql'
import userRouter from './routes/user';
import adminRouter from './routes/admin';
import messageRouter from './routes/message';
import integrationRouter from './gateway-routes/integration-routes';
import cors from '@koa/cors';

import { CronJob } from 'cron';
import sendNotification from './util/sendNotification';


dotenv.config();
const app = new Koa();

const port = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser());
app.use(json());

app.use(userRouter.routes());
app.use(adminRouter.routes());
app.use(messageRouter.routes());
//gateway routes
app.use(integrationRouter.routes());

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
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)


      // running every 5 minutes
      const job = new CronJob('0 */1 * * * *', async () => {
        console.log('success from cron')
        await sendNotification();   // taking users with filters
        // checking for updates in last 5 min and send notification   
      }, null, true, 'Europe/Stockholm');
      job.start();
      
    }
    );
  })
  .catch((err) => console.log(err));
