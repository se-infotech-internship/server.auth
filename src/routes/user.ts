import { Context } from 'koa';
import Router from 'koa-router';

//import controllers
import {
  getAllUsers,
  registerNewUser,
  userLogIn,
  userlogOut,
  blockUser,
  deleteUser,
  editUserDetails,
} from '../controllers/user-controller';

// Middlewares

import {
  ensureAuthenticated,
  hasToken,
  isBlocked,
  isAdmin,
} from '../util/middlewares';

const router = new Router();

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

// Delete user
router.delete(
  '/api/admin/user/delete/:id',
  hasToken,
  ensureAuthenticated,
  isBlocked,
  isAdmin,
  deleteUser,
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

// Add user details
router.post(
  '/api/user/edit/',
  hasToken,
  ensureAuthenticated,
  isBlocked,
  editUserDetails,
);

export = router;
