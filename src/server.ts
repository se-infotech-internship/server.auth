
import Koa from 'koa';
import json from 'koa-json';
import * as dotenv from 'dotenv';

const app = new Koa();

dotenv.config({path: '../config'});

const port = process.env.PORT || 5000;

app.use(json());

app.listen(port, () => console.log(`Server is running on port ${port}`));