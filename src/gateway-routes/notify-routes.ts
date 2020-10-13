import Router from 'koa-router';

import Fetching from '../util/fetch';
// Middlewares
import {
    hasToken,
    isBlocked,
} from '../middlewares';

const router = new Router();

const serverUrl = process.env.NOTIF_URL || 'http://localhost:3000';

// cron-expressions?

export default router;