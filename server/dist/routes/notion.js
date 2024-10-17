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
            database_id: process.env.NOTION_DATABASE_ID,
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
    var _a, _b, _c, _d, _e;
    const data = req.body.newData;
    const { id } = req.params;
    console.log({ data });
    try {
        const page = yield notion_client_1.client.pages.retrieve({
            page_id: id,
        });
        console.log({ page: page["properties"]["Title"].title });
        if (!page) {
            res.status(404).json({
                message: "Page not found",
            });
            return;
        }
        const response = yield notion_client_1.client.pages.update({
            page_id: id,
            properties: {
                "Reading status": {
                    type: "status",
                    status: {
                        name: (_a = data === null || data === void 0 ? void 0 : data.status) !== null && _a !== void 0 ? _a : page["properties"]["Reading status"]["status"]["name"],
                        color: ((_b = data === null || data === void 0 ? void 0 : data.status) !== null && _b !== void 0 ? _b : page["properties"]["Reading status"]["status"]["name"]) ===
                            "Not started"
                            ? "default"
                            : ((_c = data === null || data === void 0 ? void 0 : data.status) !== null && _c !== void 0 ? _c : page["properties"]["Reading status"]["status"]["name"]) ===
                                "In progress"
                                ? "blue"
                                : "green",
                    },
                },
                Title: {
                    title: [
                        {
                            text: {
                                content: (_d = data === null || data === void 0 ? void 0 : data.title) !== null && _d !== void 0 ? _d : page["properties"]["Title"]["title"][0].text.content,
                            },
                            plain_text: (_e = data === null || data === void 0 ? void 0 : data.title) !== null && _e !== void 0 ? _e : page["properties"]["Title"]["title"][0]["plain_text"],
                        },
                    ],
                },
            },
        });
        const updatedData = {
            title: response.properties["Title"].title[0].text.content,
            url: response.properties["URL"].url,
            status: response.properties["Reading status"].status.name,
        };
        res.status(200).json({
            response: updatedData,
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
    var _f, _g, _h;
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
        if (((_h = (_g = (_f = isPresent["results"][0]) === null || _f === void 0 ? void 0 : _f.properties) === null || _g === void 0 ? void 0 : _g["URL"]) === null || _h === void 0 ? void 0 : _h.url) === url) {
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
            id: response.id,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}));
notionRouter.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const page = yield notion_client_1.client.pages.retrieve({
            page_id: id,
        });
        const data = {
            title: page["properties"]["Title"]["title"][0]["text"]["content"],
            url: page["properties"]["URL"]["url"],
            status: page["properties"]["Reading status"]["status"]["name"],
        };
        res.status(200).json({
            data,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}));
notionRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k, _l;
    let { url } = req.query;
    url = decodeURIComponent(url);
    console.log({ url });
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
        if (((_l = (_k = (_j = isPresent["results"][0]) === null || _j === void 0 ? void 0 : _j.properties) === null || _k === void 0 ? void 0 : _k["URL"]) === null || _l === void 0 ? void 0 : _l.url) === url) {
            res.status(200).json({
                message: "URL already exists",
                success: false,
                data: {
                    present: true,
                    id: isPresent["results"][0].id,
                },
            });
            return;
        }
        res.status(200).json({
            message: "URL does not exist",
            data: {
                present: false,
                id: null,
                status: null,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
            data: null,
        });
    }
}));
exports.default = notionRouter;
