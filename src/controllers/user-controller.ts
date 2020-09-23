import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Context } from 'koa';
import { User } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

// Get all users
export const getAllUsers = async (ctx: Context) => {
  try {
    const users = await User.findAll();
    // console.log(users);
    if (!users || users.length === 0) {
      ctx.response.body = {
        message: 'No users found',
      };
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = users;
  } catch (err) {
    console.log(err);
    ctx.response.status = 400;
    ctx.response.body = {
      message: 'Users fetch failed',
      err: err,
    };
  }
};

// Register new user
export const registerNewUser = async (ctx: Context) => {
  const { email, password } = ctx.request.body;
  const id = uuidv4();
  try {
    // Check if User Exists in DB
    const emailExist = await User.findOne({
      where: {
        email: email,
      },
    });
    console.log(emailExist);
    if (emailExist) {
      ctx.response.status = 400;
      ctx.body = { message: 'Email is already exists' };
      return;
    }

    const isAdmin = !!ctx.request.body.isAdmin;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      id: id,
      email: email,
      password: hashPassword,
      isAdmin: isAdmin,
    });
    ctx.response.status = 200;
    ctx.response.body = newUser;
  } catch (err) {
    console.log(err);
    ctx.response.status = 400;
    ctx.response.body = {
      message: 'Registration failed',
      err: err,
    };
  }
};

// Login
export const userLogIn = async (ctx: Context) => {
  try {
    const user = await User.findOne({
      where: {
        email: ctx.request.body.email,
      },
      raw: true,
    });
    if (!user) {
      ctx.response.status = 400;
      ctx.body = { message: 'Wrong credentials, try again' };
      return;
    } else {
      // Match password
      await bcrypt.compare(
        ctx.request.body.password,
        user.password,
        (err, isMatch) => {
          if (err) {
            console.log(err);
            ctx.response.status = 400;
            ctx.response.body = {
              message: 'Password compare failed',
              err: err,
            };
            return;
          }
          if (isMatch) {
            user.isloggedIn = true;
            const token = jwt.sign({ Id: user.id }, 'fsdgsdgsgdsg', {
              expiresIn: '3h',
            });
            user.save();
            ctx.response.status = 200;
            ctx.response.body = {
              id: user.id,
              token: token,
            };
          } else {
            console.log('Wrong credentials, try again...');
            ctx.response.status = 401;
            ctx.response.body = {
              message: 'Wrong credentials, try again...',
            };
          }
        },
      );
    }
  } catch (err) {
    console.log(err);
    ctx.response.status = 400;
    ctx.response.body = {
      message: 'Registration failed',
      err: err,
    };
  }
};

// Logout
export const userlogOut = async () => {
  try {
    // logOut user...
  } catch (err) {
    console.log(err);
  }
};
