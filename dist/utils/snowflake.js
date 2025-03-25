"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = void 0;
const snowflake_1 = require("@theinternetfolks/snowflake");
const generateId = () => {
    return snowflake_1.Snowflake.generate();
};
exports.generateId = generateId;
