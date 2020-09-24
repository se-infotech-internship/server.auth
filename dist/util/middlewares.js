"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isBlocked = exports.ensureAuthenticated = exports.hasToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
exports.hasToken = async (ctx, next) => {
    const token = ctx.request.headers.token;
    const tokenSecret = process.env.TOKEN_SECRET;
    if (!token) {
        console.log('Token - Please, log in to view this resourse');
        ctx.response.status = 401;
        ctx.response.body = {
            message: 'Token - Please, log in to view this resourse',
        };
        return;
    }
    const decoded = (await jsonwebtoken_1.default.verify(token, tokenSecret));
    ctx.state.id = decoded.Id;
    return next();
};
exports.ensureAuthenticated = async (ctx, next) => {
    const id = ctx.state.id;
    const user = await user_model_1.User.findByPk(id);
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
exports.isBlocked = async (ctx, next) => {
    const user = ctx.state.user;
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
exports.isAdmin = async (ctx, next) => {
    const user = ctx.state.user;
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
