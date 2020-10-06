import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Context } from 'koa';
import { User } from '../models/user.model';
import { UserInterface } from '../models/user.model';
import { Decoded } from '../middlewares';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import { client } from '../storage/redis'

dotenv.config();

const tokenSecret = process.env.TOKEN_SECRET as string;
const tokenLife = process.env.TOKEN_LIFE as string;
const tokenLifeLong = process.env.TOKEN_LIFE_LONG as string;

function tokenExpiresIn (s: boolean) {
  let exp = '';
  if (s) {
    exp = tokenLifeLong;
  }
  else exp = tokenLife;
  return exp;
}
export function createNewToken (save: boolean, usId: string) {
  let exp = tokenExpiresIn (save);
  const newToken = jwt.sign({ Id: usId }, tokenSecret, {
    expiresIn: exp,
  });
  return newToken;
}

// Register new user
export const registerNewUser = async (ctx: Context) => {
  const { email, password } = ctx.request.body;
  const id = uuidv4();
  const isAdmin = !!ctx.request.body.isAdmin;
  const rememberPassword = !!ctx.request.body.rememberPassword;
  try {
    // Check if User Exists in DB
    const emailExist = await User.findOne({
      where: {
        email: email,
      },
    });
    if (emailExist) {
      ctx.status = 400;
      ctx.body = { message: 'Email is already exists' };
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // send email tu verify user

    // Save user to DB
    const newUser = await User.create({
      id: id,
      email: email,
      password: hashPassword,
      isAdmin: isAdmin,
      rememberPassword: rememberPassword,
    });
    ctx.status = 201;
    ctx.body = newUser;
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Registration failed',
      err: err,
    };
  }
};

// confirm email
export const confirmEmail = async (ctx: Context) => {
  try {
    const token = ctx.params.id as string;
    const decoded = (await jwt.verify(token, tokenSecret)) as Decoded;
    await User.update(
      { confirmed: true },
      { where: { id: decoded.Id } },
    );
    ctx.status = 200;
    ctx.body = { message: 'Email confirmed' };
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Email confirmation failed',
      err: err,
    };
  }
};

// Refresh token
export const refreshToken = async (ctx: Context) => {
  try {
    const user = ctx.state.user as UserInterface;
    const newToken = createNewToken(user.rememberPassword, user.id);
    ctx.status = 201;
    ctx.body = {
      token: newToken,
      message: 'New token created'
    }
  }
  catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Email confirmation failed',
      err: err,
    };
  }
}

// password reset
export const passwordReset = async (ctx: Context) => {
  try {
    const id = ctx.params.id as string;
    const password = ctx.request.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
  
    await User.update(
      { password: hashPassword },
      { where: { id: id } },
    );
    ctx.status = 200;
    ctx.body = { message: 'Password reset successful' };
  }
  catch(err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Password reset failed',
      err: err,
    };
  }
}

// Login
export const userLogIn = async (ctx: Context) => {
  try {
    const user = await User.findOne({
      where: {
        email: ctx.request.body.email,
      },
    });
    if (!user) {
      ctx.status = 401;
      ctx.body = { message: 'Wrong credentials, try again' };
      return;
    }
    if (user.blocked) {
      console.log('Sorry, user is blocked');
      ctx.status = 400;
      ctx.body = {
        message: 'Sorry, user is blocked',
      };
      return;
    }
    // if (!user.confirmed) {
    //   console.log('Please, confirm your email to log in');
    //   ctx.status = 400;
    //   ctx.body = {
    //     message: 'Please, confirm your email to log in',
    //   };
    //   return;
    // }
    const savedPassword = user.password as string;
    // Match password
    const isMatch = bcrypt.compareSync(
      ctx.request.body.password,
      savedPassword,
    );
    
    if (isMatch) {
      const token = createNewToken(user.rememberPassword, user.id);
      
      // user.isloggedIn = true;
      await user.save();
      ctx.status = 200;
      ctx.body = {
        id: user.id,
        token: token,
      };
    } else {
      console.log('Wrong credentials, try again...');
      ctx.status = 401;
      ctx.body = {
        message: 'Wrong credentials, try again...',
      };
    }
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Registration failed',
      err: err,
    };
  }
};

// Logout
export const userlogOut = async (ctx: Context) => {
  try {
    const token = ctx.request.headers.token as string;
    const user = ctx.state.user as UserInterface;
    const exp = tokenExpiresIn(user.rememberPassword);

    await client.setex(token, +exp, user.id, (err, res) => {
      if (err) {
        console.log(err);
        ctx.status = 400;
        ctx.body = {
          message: 'Redis save failed',
          err: err,
        };
        return;
      }
      ctx.status = 200;
      ctx.body = { message: 'Logged Out' };
    });
    // user.isloggedIn = false;
    // await user.save();
  } 
  catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'log out failed',
      err: err,
    };
  }
};

// Add user details
export const editUserDetails = async (ctx: Context) => {
  try {
    const id = ctx.params.id as string;
    const user = await User.findByPk(id);
    if (!user) {
      ctx.status = 400;
      ctx.body = {
        message: 'User not found',
      };
      return;
    }
    user.name =
      'name' in ctx.request.body ? ctx.request.body.name : null;
    user.TZNumber =
      'TZNumber' in ctx.request.body
        ? ctx.request.body.TZNumber
        : null;
    user.TZLicence =
      'TZLicence' in ctx.request.body
        ? ctx.request.body.TZLicence
        : null;
    user.driverLicence =
      'driverLicence' in ctx.request.body
        ? ctx.request.body.driverLicence
        : null;
    await user.save();
    ctx.status = 200;
    ctx.body = { message: 'Updated' };
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Edit user details failed',
      err: err,
    };
  }
};
