import Router from 'koa-router';

//import controllers
import {
  registerNewUser,
  userLogIn,
  userlogOut,
  editUserDetails,
  confirmEmail,
  passwordReset,
  refreshToken
} from '../controllers/user-controller';
import { 
  googleAuth,
  googleAuthCallback,
 } from '../controllers/google-auth-controller'

// Middlewares
import {
  hasToken,
  isBlocked,
} from '../middlewares';

const router = new Router();

// register user
router.post('/api/user/register', registerNewUser);

// confirm email
router.get('/api/user/confirm/:token', confirmEmail);

// password reset
router.post('/api/user/password/:id', passwordReset);

// logIn user
router.post('/api/user/login', userLogIn);

// refresh token
router.get(
  '/api/user/token',
  hasToken,
  isBlocked,
  refreshToken
);

// logOut user
router.get(
  '/api/user/logout',
  hasToken,
  userlogOut,
);

// User settings
router.post(
  '/api/user/edit',
  hasToken,
  isBlocked,
  editUserDetails,
);

// Google auth
router.get('/api/user/login/google', googleAuth);
router.get('/api/user/login/google/callback', googleAuthCallback);

export = router;
