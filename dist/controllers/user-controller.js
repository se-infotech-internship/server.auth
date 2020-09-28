"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editUserDetails = exports.deleteUser = exports.blockUser = exports.userlogOut = exports.userLogIn = exports.confirmEmail = exports.registerNewUser = exports.getAllUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const uuid_1 = require("uuid");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// Google API setup
// const OAuth2 = google.auth.OAuth2;
// const clientId = process.env.GOOGLE_ID as string;
// const clientSecret = process.env.GOOGLE_SECRET as string;
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
exports.getAllUsers = async (ctx) => {
    try {
        user_model_1.User.sync();
        const users = await user_model_1.User.findAll();
        if (!users || users.length === 0) {
            ctx.body = {
                message: 'No users found',
            };
            return;
        }
        ctx.status = 200;
        ctx.body = users;
    }
    catch (err) {
        console.log(err);
        ctx.status = err.statusCode || err.status || 400;
        ctx.body = {
            message: 'Users fetch failed',
            err: err,
        };
    }
};
// Register new user
exports.registerNewUser = async (ctx) => {
    const { email, password } = ctx.request.body;
    const id = uuid_1.v4();
    const isAdmin = !!ctx.request.body.isAdmin;
    const rememberPassword = !!ctx.request.body.rememberPassword;
    let refreshToken = '';
    try {
        // Check if User Exists in DB
        const emailExist = await user_model_1.User.findOne({
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
            refreshToken = uuid_1.v4();
        }
        // Hash password
        const salt = await bcrypt_1.default.genSalt(10);
        const hashPassword = await bcrypt_1.default.hash(password, salt);
        // send email tu verify user
        // Save user to DB
        const newUser = await user_model_1.User.create({
            id: id,
            email: email,
            password: hashPassword,
            isAdmin: isAdmin,
            refreshToken: refreshToken,
        });
        ctx.status = 201;
        ctx.body = newUser;
    }
    catch (err) {
        console.log(err);
        ctx.status = err.statusCode || err.status || 400;
        ctx.body = {
            message: 'Registration failed',
            err: err,
        };
    }
};
// confirm email
exports.confirmEmail = async (ctx) => {
    try {
        const tokenSecret = process.env.TOKEN_SECRET;
        const token = ctx.params.id;
        const decoded = (await jsonwebtoken_1.default.verify(token, tokenSecret));
        await user_model_1.User.update({ confirmed: true }, { where: { id: decoded.Id } });
        ctx.status = 200;
        ctx.body = { message: 'Email confirmation failed' };
    }
    catch (err) {
        console.log(err);
        ctx.status = err.statusCode || err.status || 400;
        ctx.body = {
            message: 'Email confirmation failed',
            err: err,
        };
    }
};
// Login
exports.userLogIn = async (ctx) => {
    try {
        const user = await user_model_1.User.findOne({
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
        const isMatch = bcrypt_1.default.compareSync(ctx.request.body.password, user.password);
        const tokenSecret = process.env.TOKEN_SECRET;
        const tokenLife = process.env.TOKEN_LIFE;
        if (isMatch) {
            const token = jsonwebtoken_1.default.sign({ Id: user.id }, tokenSecret, {
                expiresIn: tokenLife,
            });
            user.isloggedIn = true;
            await user.save();
            ctx.status = 200;
            ctx.body = {
                id: user.id,
                token: token,
            };
        }
        else {
            console.log('Wrong credentials, try again...');
            ctx.status = 401;
            ctx.body = {
                message: 'Wrong credentials, try again...',
            };
        }
    }
    catch (err) {
        console.log(err);
        ctx.status = err.statusCode || err.status || 400;
        ctx.body = {
            message: 'Registration failed',
            err: err,
        };
    }
};
// Logout
exports.userlogOut = async (ctx) => {
    try {
        const user = ctx.state.user;
        user.isloggedIn = false;
        await user.save();
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
// Block/Unblock User
exports.blockUser = async (ctx) => {
    try {
        const user = (await user_model_1.User.findByPk(ctx.params.id));
        if (user.blocked) {
            user.blocked = false;
            ctx.status = 200;
            ctx.body = { message: `Unblocked user: ${user.id}` };
        }
        else {
            user.blocked = true;
            ctx.status = 200;
            ctx.body = { message: `Blocked user: ${user.id}` };
        }
        await user.save();
    }
    catch (err) {
        console.log(err);
        ctx.status = err.statusCode || err.status || 400;
        ctx.body = {
            message: 'Block/unblock user failed',
            err: err,
        };
    }
};
// Delete user
exports.deleteUser = async (ctx) => {
    try {
        await user_model_1.User.destroy({
            where: {
                id: ctx.params.id,
            },
        });
        ctx.status = 200;
        ctx.body = { message: `Deleted user: ${ctx.params.id}` };
    }
    catch (err) {
        console.log(err);
        ctx.status = err.statusCode || err.status || 400;
        ctx.body = {
            message: 'Delete user failed',
            err: err,
        };
    }
};
// Add user details
exports.editUserDetails = async (ctx) => {
    try {
        const user = ctx.state.user;
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
    }
    catch (err) {
        console.log(err);
        ctx.status = err.statusCode || err.status || 400;
        ctx.body = {
            message: 'Edit user details failed',
            err: err,
        };
    }
};
