import { Context } from 'koa';
import { User } from '../models/user.model';
import { UserInterface } from '../models/user.model';

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

