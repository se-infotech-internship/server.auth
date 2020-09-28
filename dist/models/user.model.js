"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = __importDefault(require("sequelize"));
const db_1 = __importDefault(require("../util/db"));
const User = db_1.default.define('user', {
    id: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        unique: true,
    },
    confirmed: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    password: {
        type: sequelize_1.default.STRING,
        allowNull: false,
    },
    rememberPassword: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    refreshToken: sequelize_1.default.STRING,
    blocked: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isAdmin: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isloggedIn: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    name: sequelize_1.default.STRING,
    TZNumber: sequelize_1.default.STRING,
    TZLicence: sequelize_1.default.STRING,
    driverLicence: sequelize_1.default.STRING,
});
exports.User = User;
