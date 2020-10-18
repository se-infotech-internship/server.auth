import { Context } from 'koa';
import { User } from '../models/user.model';
import Sequelize from 'sequelize';
import { UserInterface } from '../models/user.model';
import { createNewToken } from '../controllers/user-controller';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

interface FindAndCountAllUsers {
  rows: UserInterface[];
  count: number;
}

// TEST - Autogeneratu fake users
export const autoGenUsers = async (ctx: Context) => {
  try {
    const quantity = ctx.params.quantity as string;
    for (let i = 0; i < +quantity; i++) {
      await User.create({
        id: uuidv4(),
        email: `test${100 + i}@gmail.com`,
        password: '123456',
        rememberPassword: false,
        name: 'john',
        secondName: 'smith',
        middleName: 'anderson',
        TZVIN: uuidv4().replace(/-/g, ''),
        phone: Date.now().toString(),
      });
    }
    ctx.status = 200;
    ctx.body = { message: `${quantity} users created` };
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Autogenerate failed',
      err: err,
    };
  }
};

// TEST - Pagination page
export const pagination = async (ctx: Context) => {
  try {
    const quantity = ctx.query.quantity ? +ctx.query.quantity : 10;
    const page = ctx.query.page ? +ctx.query.page : 1;
    const fetchRes = await fetch(
      `http://localhost:5001/api/admin/users/?page=${page}&quantity=${quantity}`,
    );
    const res = (await fetchRes.json()) as FindAndCountAllUsers;

    const numberOfUsers = res.count;
    const pages = Math.ceil(numberOfUsers / quantity);
    let buttons = '';
    for (let i = 1; i <= pages; i++) {
      buttons += `<a href=
      \"http://localhost:5001/api/admin/pagination/?page=${i}&quantity=${quantity}\">
      <button>${i}</button>
      </a>`;
    }
    const prevButton =
      page !== 1
        ? `<a href=
    \"http://localhost:5001/api/admin/pagination/?page=${
      page - 1
    }&quantity=${quantity}\">
    <button><<</button>
    </a>`
        : '';
    const nextButton =
      page !== pages
        ? `<a href=
    \"http://localhost:5001/api/admin/pagination/?page=${
      page + 1
    }&quantity=${quantity}\">
    <button>>></button>
    </a>`
        : '';
    const users = res.rows.map(
      (user: UserInterface) => `<li>${user.email}</li>`,
    );
    const body = `<h2>Pagination test</h2><div><p>${users}</p></div><div>${
      prevButton + buttons + nextButton
    }</div>`;
    ctx.status = 200;
    ctx.body = body;
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Pagination page failed',
      err: err,
    };
  }
};

// Get all users
export const getAllUsers = async (ctx: Context) => {
  try {
    await User.sync();
    const page = ctx.query.page ? +ctx.query.page : 1;
    const quantity = ctx.query.quantity ? +ctx.query.quantity : 10;
    const {
      phone,
      name,
      secondName,
      middleName,
      TZNumber,
      TZVIN,
    }: {
      phone: string;
      name: string;
      secondName: string;
      middleName: string;
      TZNumber: string;
      TZVIN: string;
    } = ctx.query;

    const queryOptions: Sequelize.FindAndCountOptions = {
      offset: (page - 1) * quantity,
      limit: quantity,
    };
    let queryParams = {};

    if (phone) {
      queryParams = {
        ...queryParams,
        phone: phone.replace(/\s|-/g, ''),
      };
    }
    if (name) {
      queryParams = {
        ...queryParams,
        name: name.replace(/\s|-/g, '').toLowerCase(),
      };
    }
    if (secondName) {
      queryParams = {
        ...queryParams,
        secondName: secondName.replace(/\s|-/g, '').toLowerCase(),
      };
    }
    if (middleName) {
      queryParams = {
        ...queryParams,
        middleName: middleName.replace(/\s|-/g, '').toLowerCase(),
      };
    }
    if (TZNumber) {
      queryParams = {
        ...queryParams,
        TZNumber: TZNumber.replace(/\s|-/g, '').toLowerCase(),
      };
    }
    if (TZVIN) {
      queryParams = {
        ...queryParams,
        TZVIN: TZVIN.replace(/\s|-/g, '').toLowerCase(),
      };
    }
    if (Object.keys(queryParams).length !== 0) {
      queryOptions.where = queryParams;
    }

    const users = await User.findAndCountAll(queryOptions);
    if (!users || users.rows.length === 0) {
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

// Admin log in
export const adminLogIn = async (ctx: Context) => {
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
    const admin = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!admin || password !== admin.password) {
      ctx.status = 401;
      ctx.body = { message: 'Wrong credentials, try again' };
      return;
    }
    if (admin.blocked || !admin.isAdmin) {
      ctx.status = 403;
      ctx.body = {
        message: 'Sorry, access denied',
      };
      return;
    }

    const token = createNewToken(admin.rememberPassword, admin.id);

    ctx.status = 200;
    ctx.body = {
      id: admin.id,
      token: token,
    };
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Log In failed',
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
