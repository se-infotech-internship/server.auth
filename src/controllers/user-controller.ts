import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Context } from 'koa';
import { User } from '../models/user.model';
import { UserInterface } from '../models/user.model';
import { Decoded } from '../util/middlewares';
import { v4 as uuidv4 } from 'uuid';


// async function getGoogleUser({ code }) {
//   const { tokens } = await OAuth2.getToken(code);

//   OAuth2.setCredentials(tokens);

//   // Fetch the user's profile with the access token and bearer
//   const googleUser = await fetch
//     (
//       `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
//       {
//         method: 'get',
//         headers: {
//           Authorization: `Bearer ${tokens.id_token}`,
//         },
//       },
//     )
//     .then(res => res.data)
//     .catch(error => {
//       throw new Error(error.message);
//     });

//   return googleUser;
// }

// const redirectURL = 'https://developers.google.com/oauthplayground';
// const refreshToken = process.env.GOOGLE_REFRESH_TOKEN as string;
// const myOAuth2Client = new OAuth2(
//   clientId,
//   clientSecret,
//   redirectURL,
// );

// myOAuth2Client.setCredentials({
//   refresh_token: refreshToken,
// });
// const nodeMailUser = process.env.NODEMAILER_USER as string;

// Email notifications setup
// const emailSetup = (t: string) => {
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true,
//     auth: {
//       type: 'OAuth2',
//       user: nodeMailUser,
//       clientId: clientId,
//       clientSecret: clientSecret,
//       refreshToken: refreshToken,
//       accessToken: t,
//     },
//   });
//   return transporter;
// };

// Get all users
export const getAllUsers = async (ctx: Context) => {
  try {
    User.sync();
    const users = await User.findAll();
    if (!users || users.length === 0) {
      ctx.body = {
        message: 'No users found',
      };
      return;
    }
    ctx.status = 200;
    ctx.body = users;
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Users fetch failed',
      err: err,
    };
  }
};

// Register new user
export const registerNewUser = async (ctx: Context) => {
  const { email, password } = ctx.request.body;
  const id = uuidv4();
  const isAdmin = !!ctx.request.body.isAdmin;
  const rememberPassword = !!ctx.request.body.rememberPassword;
  let refreshToken = '';
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
    if (rememberPassword) {
      refreshToken = uuidv4();
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
      refreshToken: refreshToken,
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
    const tokenSecret = process.env.TOKEN_SECRET as string;
    const token = ctx.params.id as string;
    const decoded = (await jwt.verify(token, tokenSecret)) as Decoded;
    await User.update(
      { confirmed: true },
      { where: { id: decoded.Id } },
    );
    ctx.status = 200;
    ctx.body = { message: 'Email confirmation failed' };
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Email confirmation failed',
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
    const tokenSecret = process.env.TOKEN_SECRET as string;
    const tokenLife = process.env.TOKEN_LIFE as string;
    if (isMatch) {
      const token = jwt.sign({ Id: user.id }, tokenSecret, {
        expiresIn: tokenLife,
      });
      user.isloggedIn = true;
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
    const user = ctx.state.user as UserInterface;
    user.isloggedIn = false;
    await user.save();
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

// Block/Unblock User
export const blockUser = async (ctx: Context) => {
  try {
    const user = (await User.findByPk(
      ctx.params.id,
    )) as UserInterface;
    if (user.blocked) {
      user.blocked = false;
      ctx.status = 200;
      ctx.body = { message: `Unblocked user: ${user.id}` };
    } else {
      user.blocked = true;
      ctx.status = 200;
      ctx.body = { message: `Blocked user: ${user.id}` };
    }
    await user.save();
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Block/unblock user failed',
      err: err,
    };
  }
};

// Delete user
export const deleteUser = async (ctx: Context) => {
  try {
    await User.destroy({
      where: {
        id: ctx.params.id,
      },
    });
    ctx.status = 200;
    ctx.body = { message: `Deleted user: ${ctx.params.id}` };
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Delete user failed',
      err: err,
    };
  }
};

// Add user details
export const editUserDetails = async (ctx: Context) => {
  try {
    const user = ctx.state.user as UserInterface;
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
