"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const koa_router_1 = __importDefault(require("koa-router"));
//import controllers
const user_controller_1 = require("../controllers/user-controller");
const router = new koa_router_1.default();
// test
router.get('/', async (ctx) => {
    ctx.body = { message: 'Test' };
    ctx.response.status = 200;
    ctx.response.body = { message: 'Test1' };
});
// get all users
router.get('/api/admin/users', user_controller_1.getAllUsers);
// register user
router.post('/api/user/register/', user_controller_1.registerNewUser);
// logIn user
router.post('/api/user/login/', user_controller_1.userLogIn);
// logOut user
router.get('/api/user/logout/', async (ctx) => {
    ctx.body = 'LogOut route';
});
module.exports = router;
