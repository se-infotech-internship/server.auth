import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Context } from 'koa';
import { User } from '../models/user.model';
import { UserInterface } from '../models/user.model';
import { Decoded } from '../middlewares';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import { client } from '../storage/redis';
import fetch from 'node-fetch';

dotenv.config();

// Constants
const tokenSecret = process.env.TOKEN_SECRET as string;
const tokenLife = process.env.TOKEN_LIFE as string;
const tokenLifeLong = process.env.TOKEN_LIFE_LONG as string;

function tokenExpiresIn(s: boolean) {
  let exp = '';
  if (s) {
    exp = tokenLifeLong;
  } else exp = tokenLife;
  return exp;
}
export function createNewToken(save: boolean, usId: string) {
  let exp = tokenExpiresIn(save);
  const newToken = jwt.sign({ Id: usId }, tokenSecret, {
    expiresIn: exp,
  });
  return newToken;
}

// Register new user
export const registerNewUser = async (ctx: Context) => {
  const {
    email,
    password,
  }: { email: string; password: string } = ctx.request.body;
  if (
    !email ||
    !password ||
    email.length === 0 ||
    password.length === 0
  ) {
    ctx.status = 401;
    ctx.body = { message: 'Wrong credentials, try again' };
    return;
  }
  const id = uuidv4();
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

    // send email to verify user
    const token = jwt.sign({ Id: id }, tokenSecret, {
      expiresIn: '1 day',
    });
    const res = await fetch(`http://localhost:3000/api/email/confirm/toUser`, {
      method: 'post',
      body: JSON.stringify({
        email: email,
        name: 'New User',
        link: `http://195.230.156.40:5001/api/user/confirm/${token}`,
      }),
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
    });
    if (!res) {
      ctx.status = 400;
      ctx.body = { message: 'Notification API error' };
      return;
    }

    // Save user to DB
    const newUser = await User.create({
      id: id,
      email: email.replace(/\s|-/g, '').toLowerCase(),
      password: hashPassword,
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
    const token = ctx.params.token as string;
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
      message: 'New token created',
    };
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
    const password = ctx.request.body.password as string;
    if (!password) {
      ctx.status = 400;
      ctx.body = { message: 'Please, provide a password' };
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    await User.update(
      { password: hashPassword },
      { where: { id: id } },
    );
    ctx.status = 200;
    ctx.body = { message: 'Password reset successful' };
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Password reset failed',
      err: err,
    };
  }
};

// Login
export const userLogIn = async (ctx: Context) => {
  try {
    const {
      email,
      password,
    }: { email: string; password: string } = ctx.request.body;
    if (
      !email ||
      !password ||
      email.length === 0 ||
      password.length === 0
    ) {
      ctx.status = 401;
      ctx.body = { message: 'Wrong credentials, try again' };
      return;
    }
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      ctx.status = 401;
      ctx.body = { message: 'Wrong credentials, try again' };
      return;
    }
    if (user.blocked) {
      ctx.status = 403;
      ctx.body = {
        message: 'Sorry, user is blocked',
      };
      return;
    }
    // if (!user.confirmed) {
    //   console.log('Please, confirm your email to log in');
    //   ctx.status = 401;
    //   ctx.body = {
    //     message: 'Please, confirm your email to log in',
    //   };
    //   return;
    // }
    const savedPassword = user.password as string;
    // Match password
    const isMatch = bcrypt.compareSync(password, savedPassword);

    if (isMatch) {
      const token = createNewToken(user.rememberPassword, user.id);

      ctx.status = 200;
      ctx.body = {
        id: user.id,
        token: token,
      };
    } else {
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
    await client.setex(token, 691200, user.id);

    ctx.status = 200;
    ctx.body = { message: 'Logged Out' };
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'log out failed',
      err: err,
    };
  }
};

// user settings
export const editUserDetails = async (ctx: Context) => {
  try {
    const user = ctx.state.user as UserInterface;
    if (!user) {
      ctx.status = 400;
      ctx.body = {
        message: 'User not found',
      };
      return;
    }

    if ('name' in ctx.request.body)
      user.name = ctx.request.body.name
        .replace(/\s|-/g, '')
        .toLowerCase();
    if ('phone' in ctx.request.body)
      user.phone = ctx.request.body.phone.replace(/\s|-/g, '');
    if ('TZNumber' in ctx.request.body)
      user.TZNumber = ctx.request.body.TZNumber.replace(
        /\s|-/g,
        '',
      ).toLowerCase();
    if ('TZLicence' in ctx.request.body)
      user.TZLicence = ctx.request.body.TZLicence.replace(
        /\s|-/g,
        '',
      ).toLowerCase();
    if ('driverLicence' in ctx.request.body)
      user.driverLicence = ctx.request.body.driverLicence
        .replace(/\s|-/g, '')
        .toLowerCase();
    if ('TZVIN' in ctx.request.body)
      user.TZVIN = ctx.request.body.TZVIN.replace(
        /\s|-/g,
        '',
      ).toLowerCase();
    if ('rememberPassword' in ctx.request.body)
      user.rememberPassword = ctx.request.body.rememberPassword;
    if ('distToCam' in ctx.request.body)
      user.distToCam = ctx.request.body.distToCam;
    if ('pushNotifications' in ctx.request.body)
      user.pushNotifications = ctx.request.body.pushNotifications;
    if ('turnOnApp' in ctx.request.body)
      user.turnOnApp = ctx.request.body.turnOnApp;
    if ('emailNotifications' in ctx.request.body)
      user.emailNotifications = ctx.request.body.emailNotifications;
    if ('appPaymentReminder' in ctx.request.body)
      user.appPaymentReminder = ctx.request.body.appPaymentReminder;
    if ('maxSpeedNotifications' in ctx.request.body)
      user.maxSpeedNotifications =
        ctx.request.body.maxSpeedNotifications;
    if ('voiceNotifications' in ctx.request.body)
      user.voiceNotifications = ctx.request.body.voiceNotifications;
    if ('sound' in ctx.request.body)
      user.sound = ctx.request.body.sound;
    if ('finesAutoCheck' in ctx.request.body)
      user.finesAutoCheck = ctx.request.body.finesAutoCheck;
    if ('finesPaymentAutoCheck' in ctx.request.body)
      user.finesPaymentAutoCheck =
        ctx.request.body.finesPaymentAutoCheck;
    if ('distanceToCam' in ctx.request.body)
      user.distanceToCam = ctx.request.body.distanceToCam;
    if ('camAutoFind' in ctx.request.body)
      user.camAutoFind = ctx.request.body.camAutoFind;

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
