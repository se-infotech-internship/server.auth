
import Koa from 'koa';
import json from 'koa-json';
import * as dotenv from 'dotenv';
import sequelize from './util/db';
import router from './routes/user';

const app = new Koa();

dotenv.config();

const port = process.env.PORT || 5001;

app.use(json());
app.use(router.routes());

sequelize
.sync()
.then(() => {
    console.log('Database connected');
    app.listen(port, () => console.log(`Server is running on port ${port}`));
})
.catch(err => console.log(err));