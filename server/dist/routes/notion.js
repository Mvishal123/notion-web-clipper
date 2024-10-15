"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notion_client_1 = require("../notion-client");
const notionRouter = (0, express_1.Router)();
notionRouter.get("/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const list = yield notion_client_1.client.databases.query({
            database_id: "11f3ca336816800d917dc8ac6273f56f",
        });
        const response = Object.entries(list.results).map((item, index) => {
            const props = item[1]["properties"];
            const data = {
                id: list.results[index].id,
                title: props["Title"].title[0].text["content"],
                url: props["URL"].url,
                status: props["Reading status"].status.name,
            };
            return data;
        });
        res.status(200).json({
            data: response,
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).send("Internal Server Error");
    }
}));
notionRouter.put("/update/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.body;
    const { id } = req.params;
    try {
        const response = yield notion_client_1.client.pages.update({
            page_id: id,
            properties: {
                "Reading status": {
                    type: "status",
                    status: {
                        name: status,
                        color: status === "Not started"
                            ? "default"
                            : status === "In progress"
                                ? "blue"
                                : "green",
                    },
                },
            },
        });
        res.status(200).json({
            response: response,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}));
notionRouter.put("/delete/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield notion_client_1.client.pages.update({
            page_id: id,
            archived: true,
        });
        res.status(200).json({
            message: "Page removed successfully",
            success: true,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
}));
notionRouter.post("/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, url } = req.body;
    try {
        const isPresent = yield notion_client_1.client.databases.query({
            database_id: process.env.NOTION_DATABASE_ID,
            filter: {
                property: "URL",
                url: {
                    equals: url,
                },
            },
        });
        if (((_a = isPresent === null || isPresent === void 0 ? void 0 : isPresent.results[0]) === null || _a === void 0 ? void 0 : _a.url) === url) {
            res.status(400).send("URL already exists");
            return;
        }
        const response = yield notion_client_1.client.pages.create({
            object: "page",
            parent: {
                type: "database_id",
                database_id: process.env.NOTION_DATABASE_ID,
            },
            properties: {
                "Reading status": {
                    type: "status",
                    status: {
                        name: "Not started",
                        color: "default",
                    },
                },
                URL: {
                    type: "url",
                    url: url,
                },
                Title: {
                    id: "title",
                    type: "title",
                    title: [
                        {
                            type: "text",
                            text: {
                                content: title,
                            },
                        },
                    ],
                },
            },
        });
        res.status(200).json({
            response: response,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}));
notionRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    const { url } = req.body;
    try {
        const isPresent = yield notion_client_1.client.databases.query({
            database_id: process.env.NOTION_DATABASE_ID,
            filter: {
                property: "URL",
                url: {
                    equals: url,
                },
            },
        });
        if (((_d = (_c = (_b = isPresent["results"][0]) === null || _b === void 0 ? void 0 : _b.properties) === null || _c === void 0 ? void 0 : _c["URL"]) === null || _d === void 0 ? void 0 : _d.url) === url) {
            res.status(200).json({
                message: "URL already exists",
                success: false,
                present: true,
            });
            return;
        }
        res.status(200).json({
            message: "URL does not exist",
            success: true,
            present: false,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
}));
exports.default = notionRouter;
