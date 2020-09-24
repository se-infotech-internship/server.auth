"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_json_1 = __importDefault(require("koa-json"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const dotenv = __importStar(require("dotenv"));
const db_1 = __importDefault(require("./util/db"));
const user_1 = __importDefault(require("./routes/user"));
const app = new koa_1.default();
dotenv.config();
const port = process.env.PORT || 5001;
app.use(koa_bodyparser_1.default());
app.use(koa_json_1.default());
app.use(user_1.default.routes());
// Error handler
app.use(async (ctx, next) => {
    try {
        await next();
    }
    catch (err) {
        ctx.status = err.statusCode || err.status || 500;
        ctx.body = { code: err.statusCode, message: err.message };
        ctx.app.emit('error', err, ctx);
    }
});
db_1.default
    .sync()
    .then(() => {
    console.log('Database connected');
    app.listen(port, () => console.log(`Server is running on port ${port}`));
})
    .catch((err) => console.log(err));
