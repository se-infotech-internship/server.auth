import Router from 'koa-router';

//import controllers
import {
  getAllUsers,
  blockUser,
  deleteUser,
} from '../controllers/admin-controller';

// Middlewares
import {
  hasToken,
  isBlocked,
  isAdmin,
} from '../middlewares';

const router = new Router();

// get all users
router.get(
  '/api/admin/users',
  hasToken,
  isBlocked,
  isAdmin,
  getAllUsers,
);

// Block/Unblock user
router.get(
  '/api/admin/block/:id',
  hasToken,
  isBlocked,
  isAdmin,
  blockUser,
);

// Delete user
router.delete(
  '/api/admin/delete/:id',
  hasToken,
  isBlocked,
  isAdmin,
  deleteUser,
);

export = router;