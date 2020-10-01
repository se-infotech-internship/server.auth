import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Context } from 'koa';
import { User } from '../models/user.model';
// import { UserInterface } from '../models/user.model';
import { Decoded } from '../middlewares';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import { client } from '../storage/redis'

dotenv.config();

const tokenSecret = process.env.TOKEN_SECRET as string;
const tokenLife = process.env.TOKEN_LIFE as string;
const redisExp = process.env.REDIS_EXP as string;

// Register new user
export const registerNewUser = async (ctx: Context) => {
  const { email, password } = ctx.request.body;
  const id = uuidv4();
  const isAdmin = !!ctx.request.body.isAdmin;
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
    // Match password
    const isMatch = bcrypt.compareSync(
      ctx.request.body.password,
      user.password,
    );
    
    if (isMatch) {
      let refreshToken = undefined;
      if (user.rememberPassword) {
        refreshToken = uuidv4();
        await client.setex(refreshToken, +redisExp, user.id);
      }
      
      const accessToken = jwt.sign({ Id: user.id }, tokenSecret, {
      expiresIn: tokenLife,
      });
      
      // user.isloggedIn = true;
      await user.save();
      ctx.status = 200;
      ctx.body = {
        id: user.id,
        accessToken: accessToken,
        refreshToken: refreshToken,
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

// remember password middleware
export const rememberPassword = async (ctx: Context) => {
  try {
    const refreshToken = ctx.request.headers.accessToken as string;
    if (!refreshToken) {
      console.log('Token - Please, log in to view this resourse');
      ctx.response.status = 401;
      ctx.response.body = {
        message: 'Token - Please, log in to view this resourse',
      };
      return;
    }
    await client.get(refreshToken, async (err, result)=>{
      if (err || !result) {
        console.log(err);
        ctx.status = 400;
        ctx.body = {
        message: 'Saved password check failed',
          err: err,
        };
        return;
      }
      const id = result as string;
      const newRefreshToken = uuidv4();
      await client.setex(newRefreshToken, +redisExp, id);
      const accessToken = jwt.sign({ Id: result }, tokenSecret, {
        expiresIn: tokenLife,
      });
      ctx.status = 200
      ctx.body = {
        id: result,
        accessToken: accessToken,
        refreshToken: newRefreshToken,
      };
    })
    
  }
  catch(err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Saved password check failed',
      err: err,
    };
  }
}

// Logout
export const userlogOut = async (ctx: Context) => {
  try {
    // const user = ctx.state.user as UserInterface;
    // user.isloggedIn = false;
    // await user.save();
    ctx.status = 200;
    ctx.body = { message: 'Logged Out' };
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
