import { Context } from 'koa';
import { Message } from '../models/message.model';
import { v4 as uuidv4 } from 'uuid';

// getall messages for user
export const getUserMessages = async (ctx: Context) => {
  try {
    await Message.sync();
    const id = ctx.state.id as string;
    const messages = await Message.findAll({
      where: {
        from: id,
      },
    });
    if (!messages || messages.length === 0) {
      ctx.body = {
        message: 'No messages found',
      };
      return;
    }
    ctx.status = 200;
    ctx.body = messages;
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Get messages failed',
      err: err,
    };
  }
};

// create new message
export const addMessage = async (ctx: Context) => {
  try {
    const from = ctx.state.id as string;
    const body = ctx.request.body.body as string;
    const to = ctx.params.to as string;

    if (!body) {
      ctx.status = 400;
      ctx.body = {
        message: 'Please, provide your message',
      };
      return;
    }
    const newMessage = await Message.create({
      id: uuidv4(),
      body: body,
      from: from,
      to: to,
    });
    ctx.status = 201;
    ctx.body = newMessage;
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Create message failed',
      err: err,
    };
  }
};

// delete message
export const deleteMessage = async (ctx: Context) => {
  try {
    const id = ctx.params.id as string;
    await Message.destroy({
      where: {
        id: id,
      },
    });
    ctx.status = 200;
    ctx.body = {
      message: 'Message deleted',
    };
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 400;
    ctx.body = {
      message: 'Delete message failed',
      err: err,
    };
  }
};
