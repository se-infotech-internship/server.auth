import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import { User, UserInterface } from '../models/user.model';

interface Decoded {
  Id: string;
  iat: number;
  exp: number;
}

export const hasToken = async (ctx: Context, next: Next) => {
  const token = ctx.request.headers.token as string;
  const tokenSecret = process.env.TOKEN_SECRET as string;
  if (!token) {
    console.log('Token - Please, log in to view this resourse');
    ctx.response.status = 401;
    ctx.response.body = {
      message: 'Token - Please, log in to view this resourse',
    };
    return;
  }
  const decoded = (await jwt.verify(token, tokenSecret)) as Decoded;
  ctx.state.id = decoded.Id;
  return next();
};

export const ensureAuthenticated = async (
  ctx: Context,
  next: Next,
) => {
  const id = ctx.state.id as string;
  const user = await User.findByPk(id);
  if (!user) {
    console.log('Auth - No user found');
    ctx.response.status = 400;
    ctx.response.body = {
      message: 'Auth - No user found',
    };
    return;
  }
  if (user.isloggedIn === false) {
    console.log('Please, log in to view this resourse');
    ctx.response.status = 401;
    ctx.response.body = {
      message: 'Please, log in to view this resourse',
    };
    return;
  }
  ctx.state.user = user;
  return next();
};

export const isBlocked = async (ctx: Context, next: Next) => {
  const user = ctx.state.user as UserInterface;
  if (user.blocked) {
    console.log('Sorry, user is blocked');
    ctx.response.status = 403;
    ctx.response.body = {
      message: 'Sorry, user is blocked',
    };
    return;
  }
  return next();
};

export const isAdmin = async (ctx: Context, next: Next) => {
  const user = ctx.state.user as UserInterface;
  if (!user.isAdmin) {
    console.log('Sorry, admins only');
    ctx.response.status = 403;
    ctx.response.body = {
      message: 'Sorry, admins only',
    };
    return;
  }
  return next();
};
