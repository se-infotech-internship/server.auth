import Router from 'koa-router';
// import models

const router = new Router();

// test
router.get('/', async ctx => {
    ctx.body = 'Test';
})

// register user
router.post('/api/user/register/', async ctx => {
    ctx.body = 'Register route';
});

// logIn user
router.post('/api/user/login/', async ctx => {
    ctx.body = 'Login route';
});

// logOut user
router.get('/api/user/logout/', async ctx => {
    ctx.body = 'LogOut route';
});

export = router;


