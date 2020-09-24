import { Context } from 'koa';
import Router from 'koa-router';

//import controllers
import {
  getAllUsers,
  registerNewUser,
  userLogIn,
  userlogOut,
  blockUser,
} from '../controllers/user-controller';

// Middlewares

import {
  ensureAuthenticated,
  hasToken,
  isBlocked,
  isAdmin,
} from '../util/middlewares';

const router = new Router();
// ------------- Test -----------------------
// test
router.get('/', async (ctx: Context) => {
  ctx.body = { message: 'Test' };
  ctx.response.status = 200;
  ctx.response.body = { message: 'Test1' };
});

// ------------- Admin -----------------------
// get all users
router.get(
  '/api/admin/users',
  hasToken,
  ensureAuthenticated,
  isBlocked,
  isAdmin,
  getAllUsers,
);

// Block/Unblock user
router.get(
  '/api/admin/user/block/:id',
  hasToken,
  ensureAuthenticated,
  isBlocked,
  isAdmin,
  blockUser,
);

// ------------- User/Admin -----------------------
// register user
router.post('/api/user/register/', registerNewUser);

// logIn user
router.post('/api/user/login/', userLogIn);

// logOut user
router.get(
  '/api/user/logout/',
  hasToken,
  ensureAuthenticated,
  userlogOut,
);

export = router;
