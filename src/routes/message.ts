import Router from 'koa-router';

import {
  getUserMessages,
  addMessage,
  deleteMessage,
} from '../controllers/message-controller';

// middlewares
import {
  hasToken,
  isBlocked,
  isAdmin,
} from '../middlewares';

const router = new Router();

// get messages from user
router.get(
  '/api/message',
  hasToken,
  isBlocked,
  getUserMessages,
);

// create messages
router.post(
  '/api/message/add/:to',
  hasToken,
  isBlocked,
  addMessage,
);

// delete messages
router.delete(
  '/api/message/:id',
  hasToken,
  isBlocked,
  isAdmin,
  deleteMessage,
);

export = router;
