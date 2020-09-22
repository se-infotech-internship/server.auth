"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const koa_router_1 = __importDefault(require("koa-router"));
// import models
const router = new koa_router_1.default();
// test
router.get('/', async (ctx) => {
    ctx.body = 'Test';
});
// register user
router.post('/api/user/register/', async (ctx) => {
    ctx.body = 'Register route';
});
// logIn user
router.post('/api/user/login/', async (ctx) => {
    ctx.body = 'Login route';
});
// logOut user
router.get('/api/user/logout/', async (ctx) => {
    ctx.body = 'LogOut route';
});
module.exports = router;
