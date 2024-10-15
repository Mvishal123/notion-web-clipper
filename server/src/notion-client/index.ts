const { Client } = require("@notionhq/client");

export const client = new Client({
  auth: process.env.NOTION_TOKEN,
});
