import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import { User, UserInterface } from '../models/user.model';
import * as dotenv from 'dotenv';
import { client } from '../storage/redis'

dotenv.config();

export interface Decoded {
  Id: string;
  iat: number;
  exp: number;
}

// access token check middleware
export const hasToken = async (ctx: Context, next: Next) => {
  try {
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
    const isBlackList = await client.get(token);
    if (isBlackList) {
      console.log('Sorry, token expired');
      ctx.response.status = 401;
      ctx.response.body = {
        message: 'Sorry, token expired',
      };
      return;
    }
    const decoded = (await jwt.verify(token, tokenSecret)) as Decoded;
    ctx.state.id = decoded.Id;

    const user = await User.findByPk(decoded.Id);
    if (!user) {
      console.log('Auth - No user found');
      ctx.response.status = 400;
      ctx.response.body = {
        message: 'Auth - No user found',
      };
      return;
    }
    ctx.state.user = user;
    return next();
  }
  catch(err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Access token check failed',
      err: err,
    };
  }
  
};

// blocked user check middleware
export const isBlocked = async (ctx: Context, next: Next) => {
  try {
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
  }
  catch(err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Blocked user check failed',
      err: err,
    };
  }
  
};

// admin permission check middleware
export const isAdmin = async (ctx: Context, next: Next) => {
  try {
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
  }
  catch(err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Admin check failed',
      err: err,
    };
  }

};

