import Router from 'koa-router';

import Fetching from '../util/fetch';
// Middlewares
import {
    hasToken,
    isBlocked,
    isAdmin
} from '../middlewares';


const router = new Router();

const serverUrl = process.env.INTERGATION_URL || 'http://localhost:4000';
// getting all fees
router.get('/fees/all-fees/',
    hasToken,
    isBlocked,
    isAdmin,
    async (ctx,err) => {
        const path: string = serverUrl + ctx.request.path;
        const method: string = ctx.request.method;
        console.log(path, ' ', method);
        const result: any = await Fetching(method, path);
        const data  = await result.json();
        if(!result){
            ctx.body = {
                err: "Error"
            };
        }
        else{
            ctx.body = data;
            
        }
    }
);
// getting fees by userId?
router.get('/fees/get-fee/by/userId/:id',
   /*  hasToken,
    isBlocked, */
    async (ctx,err) => {
        const path: string = serverUrl + ctx.request.path;
        const method: string = ctx.request.method;
        console.log(path, ' ', method);
        const result: any = await Fetching(method, path);
        const data  = await result.json();
        if(!result){
            ctx.body = {
                err: "Error"
            };
        }
        else{
            ctx.body = data;
        }
    }
);
// getting fees by number of fee
router.get('/fees/get-fee/by/numberOf/:numberOf',
   /*  hasToken,
    isBlocked, */
    async (ctx,err) => {
        const path: string = serverUrl + ctx.request.path;
        const method: string = ctx.request.method;
        console.log(path, ' ', method);
        const result: any = await Fetching(method, path);
        const data  = await result.json();
        if(!result){
            ctx.body = {
                err: "Error"
            };
        }
        else{
            ctx.body = data;
            
        }
    }
);
// getting fees by serial 
router.get('/fees/get-fee/by/serial/:serial',
   /*  hasToken,
    isBlocked, */
    async (ctx,err) => {
        const path: string = serverUrl + ctx.request.path;
        const method: string = ctx.request.method;
        console.log(path, ' ', method);
        const result: any = await Fetching(method, path);
        const data  = await result.json();
        if(!result){
            ctx.body = {
                err: "Error"
            };
        }
        else{
            ctx.body = data;
            
        }
    }
);
// getting fees by tz number 
router.get('/fees/get-fee/by/tzNumber/:tzNumber',
   /*  hasToken,
    isBlocked, */
    async (ctx,err) => {
        const path: string = serverUrl + ctx.request.path;
        const method: string = ctx.request.method;
        console.log(path, ' ', method);
        const result: any = await Fetching(method, path);
        const data  = await result.json();
        if(!result){
            ctx.body = {
                err: "Error"
            };
        }
        else{
            ctx.body = data;
            
        }
    }
);

export default router;