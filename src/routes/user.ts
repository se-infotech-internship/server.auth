import Router from 'koa-router';
// import { Context, Next } from 'koa';

//import controllers
import {
  registerNewUser,
  userLogIn,
  userlogOut,
  editUserDetails,
  confirmEmail,
} from '../controllers/user-controller';
import { googleAuth, googleAuthCallback } from '../controllers/google-auth-controller'

// Middlewares
import {
  ensureAuthenticated,
  hasToken,
  isBlocked,
} from '../middlewares';

const router = new Router();

// register user
router.post('/api/user/register/', registerNewUser);

// confirm email
router.get('/api/user/confirm/:token', confirmEmail);

// logIn user
router.post('/api/user/login/', userLogIn);
router.get('/api/user/login/');

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

// Google auth
router.get('/api/user/login/google', googleAuth);
router.get('/api/user/login/google/callback', googleAuthCallback);

export = router;
