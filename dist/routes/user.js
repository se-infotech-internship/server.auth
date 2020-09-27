"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const koa_router_1 = __importDefault(require("koa-router"));
//import controllers
const user_controller_1 = require("../controllers/user-controller");
// Middlewares
const middlewares_1 = require("../util/middlewares");
const router = new koa_router_1.default();
// ------------- Admin -----------------------
// get all users
router.get('/api/admin/users', middlewares_1.hasToken, middlewares_1.ensureAuthenticated, middlewares_1.isBlocked, middlewares_1.isAdmin, user_controller_1.getAllUsers);
// Block/Unblock user
router.get('/api/admin/user/block/:id', middlewares_1.hasToken, middlewares_1.ensureAuthenticated, middlewares_1.isBlocked, middlewares_1.isAdmin, user_controller_1.blockUser);
// Delete user
router.delete('/api/admin/user/delete/:id', middlewares_1.hasToken, middlewares_1.ensureAuthenticated, middlewares_1.isBlocked, middlewares_1.isAdmin, user_controller_1.deleteUser);
// ------------- User/Admin -----------------------
// register user
router.post('/api/user/register/', user_controller_1.registerNewUser);
// confirm email
router.get('/api/user/confirm/:token', user_controller_1.confirmEmail);
// logIn user
router.post('/api/user/login/', user_controller_1.userLogIn);
// logOut user
router.get('/api/user/logout/', middlewares_1.hasToken, middlewares_1.ensureAuthenticated, user_controller_1.userlogOut);
// Add user details
router.post('/api/user/edit/', middlewares_1.hasToken, middlewares_1.ensureAuthenticated, middlewares_1.isBlocked, user_controller_1.editUserDetails);
module.exports = router;
