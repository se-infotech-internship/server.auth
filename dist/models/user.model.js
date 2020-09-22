"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("../util/db"));
const User = db_1.default.define('user', {
    id: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        primaryKey: true,
        defaultValue: uuid_1.v4()
    },
    email: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    blocked: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    isAdmin: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    name: sequelize_1.default.STRING,
    secondName: sequelize_1.default.STRING,
    middleName: sequelize_1.default.STRING,
    ipn: sequelize_1.default.STRING
});
module.exports = User;
