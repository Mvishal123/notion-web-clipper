"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config({ path: "../.env" });
const express_1 = __importDefault(require("express"));
const notion_1 = __importDefault(require("./routes/notion"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/v1/notion", notion_1.default);
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
