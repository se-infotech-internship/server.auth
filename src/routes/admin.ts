import Router from 'koa-router';
// import { Context } from 'koa';

//import controllers
import {
  getAllUsers,
  blockUser,
  deleteUser,
} from '../controllers/admin-controller';

// Middlewares
import {
  ensureAuthenticated,
  hasToken,
  isBlocked,
  isAdmin,
} from '../middlewares';

const router = new Router();

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
  '/api/admin/block/:id',
  hasToken,
  ensureAuthenticated,
  isBlocked,
  isAdmin,
  blockUser,
);

// Delete user
router.delete(
  '/api/admin/delete/:id',
  hasToken,
  ensureAuthenticated,
  isBlocked,
  isAdmin,
  deleteUser,
);

export = router;
