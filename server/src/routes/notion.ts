import { Request, Response, Router } from "express";
import { client } from "../notion-client";

const notionRouter = Router();

notionRouter.get("/list", async (req: Request, res: Response) => {
  try {
    const list = await client.databases.query({
      database_id: "11f3ca336816800d917dc8ac6273f56f",
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
  const { status } = req.body;
  const { id } = req.params;

  try {
    const response = await client.pages.update({
      page_id: id,
      properties: {
        "Reading status": {
          type: "status",
          status: {
            name: status,
            color:
              status === "Not started"
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
      response: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

notionRouter.get("/", async (req: Request, res: Response) => {
  const { url } = req.body;
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
        present: true,
      });
      return;
    }

    res.status(200).json({
      message: "URL does not exist",
      success: true,
      present: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
});
export default notionRouter;
