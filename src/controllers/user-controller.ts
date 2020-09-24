import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Context } from 'koa';
import { User } from '../models/user.model';
import { UserInterface } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

// Get all users
export const getAllUsers = async (ctx: Context) => {
  try {
    User.sync();
    const users = await User.findAll();
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
    ctx.response.status = err.statusCode || err.status || 400;
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
    ctx.response.status = 201;
    ctx.response.body = newUser;
  } catch (err) {
    console.log(err);
    ctx.response.status = err.statusCode || err.status || 400;
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
    });
    if (!user) {
      ctx.response.status = 401;
      ctx.body = { message: 'Wrong credentials, try again' };
      return;
    }
    if (user.blocked) {
      console.log('Sorry, user is blocked');
      ctx.response.status = 400;
      ctx.response.body = {
        message: 'Sorry, user is blocked',
      };
      return;
    }
    // Match password
    const isMatch = bcrypt.compareSync(
      ctx.request.body.password,
      user.password,
    );
    const tokenSecret = process.env.TOKEN_SECRET as string;
    const tokenLife = process.env.TOKEN_LIFE as string;
    if (isMatch) {
      const token = jwt.sign({ Id: user.id }, tokenSecret, {
        expiresIn: tokenLife,
      });
      user.isloggedIn = true;
      await user.save();
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
  } catch (err) {
    console.log(err);
    ctx.response.status = err.statusCode || err.status || 400;
    ctx.response.body = {
      message: 'Registration failed',
      err: err,
    };
  }
};

// Logout
export const userlogOut = async (ctx: Context) => {
  try {
    const user = ctx.state.user as UserInterface;
    user.isloggedIn = false;
    await user.save();
    ctx.response.status = 200;
    ctx.response.body = { message: 'Logged Out' };
  } catch (err) {
    console.log(err);
  }
};

// Block/Unblock User
export const blockUser = async (ctx: Context) => {
  const user = (await User.findByPk(ctx.params.id)) as UserInterface;
  if (user.blocked) {
    user.blocked = false;
    ctx.response.status = 200;
    ctx.response.body = { message: `Unblocked user: ${user.id}` };
  } else {
    user.blocked = true;
    ctx.response.status = 200;
    ctx.response.body = { message: `Blocked user: ${user.id}` };
  }
  await user.save();
};
