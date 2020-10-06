import Router from 'koa-router';

import {
    getUserMessages,
    addMessage,
    deleteMessage
} from '../controllers/message-controller';

// middlewares
import {
    hasToken,
    // ensureAuthenticated,
    isBlocked,
    isAdmin
} from '../middlewares'

const router = new Router();

// get messages from user
router.get(
    '/api/message/:id', 
    hasToken, 
    // ensureAuthenticated, 
    isBlocked, 
    getUserMessages
    );

// create messages
router.post(
    '/api/message/add',
    hasToken,
    // ensureAuthenticated,
    isBlocked, 
    addMessage
    );

// delete messages
router.delete(
    '/api/message/:id',
    hasToken,
    // ensureAuthenticated,
    isBlocked,
    isAdmin,
    deleteMessage
    );

export = router;