"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const { Client } = require("@notionhq/client");
exports.client = new Client({
    auth: process.env.NOTION_TOKEN,
});
