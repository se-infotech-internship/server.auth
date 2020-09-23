import { Context } from 'koa';
import Router from 'koa-router';

//import controllers
import {
  getAllUsers,
  registerNewUser,
  userLogIn,
} from '../controllers/user-controller';

const router = new Router();

// test
router.get('/', async (ctx: Context) => {
  ctx.body = { message: 'Test' };
  ctx.response.status = 200;
  ctx.response.body = { message: 'Test1' };
});

// get all users
router.get('/api/admin/users', getAllUsers);

// register user
router.post('/api/user/register/', registerNewUser);

// logIn user
router.post('/api/user/login/', userLogIn);

// logOut user
router.get('/api/user/logout/', async (ctx) => {
  ctx.body = 'LogOut route';
});

export = router;
