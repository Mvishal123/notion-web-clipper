import { Request, Response, Router } from "express";
import { client } from "../notion-client";

const notionRouter = Router();

notionRouter.get("/list", async (req: Request, res: Response) => {
  try {
    const list = await client.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
    });

    const response = Object.entries(list.results).map((item, index) => {
      const props = (item[1] as any)["properties"];
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
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

notionRouter.put("/update/:id", async (req: Request, res: Response) => {
  const data = req.body.newData;
  const { id } = req.params;

  console.log({ data });

  try {
    const page = await client.pages.retrieve({
      page_id: id,
    });
    console.log({ page: page["properties"]["Title"].title });

    if (!page) {
      res.status(404).json({
        message: "Page not found",
      });
      return;
    }

    const response = await client.pages.update({
      page_id: id,
      properties: {
        "Reading status": {
          type: "status",
          status: {
            name:
              data?.status ??
              page["properties"]["Reading status"]["status"]["name"],
            color:
              (data?.status ??
                page["properties"]["Reading status"]["status"]["name"]) ===
              "Not started"
                ? "default"
                : (data?.status ??
                    page["properties"]["Reading status"]["status"]["name"]) ===
                  "In progress"
                ? "blue"
                : "green",
          },
        },
        Title: {
          title: [
            {
              text: {
                content:
                  data?.title ??
                  page["properties"]["Title"]["title"][0].text.content,
              },
              plain_text:
                data?.title ??
                page["properties"]["Title"]["title"][0]["plain_text"],
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
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

notionRouter.put("/delete/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await client.pages.update({
      page_id: id,
      archived: true,
    });

    res.status(200).json({
      message: "Page removed successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
});

notionRouter.post("/add", async (req: Request, res: Response) => {
  const { title, url } = req.body;
  try {
    const isPresent = await client.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        property: "URL",
        url: {
          equals: url,
        },
      },
    });

    if (isPresent["results"][0]?.properties?.["URL"]?.url === url) {
      res.status(400).send("URL already exists");
      return;
    }

    const response = await client.pages.create({
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
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

notionRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const page = await client.pages.retrieve({
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
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

notionRouter.get("/", async (req: Request, res: Response) => {
  let { url } = req.query;
  url = decodeURIComponent(url as string);
  console.log({ url });

  try {
    const isPresent = await client.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        property: "URL",
        url: {
          equals: url,
        },
      },
    });

    if (isPresent["results"][0]?.properties?.["URL"]?.url === url) {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      data: null,
    });
  }
});
export default notionRouter;
