require("dotenv").config({ path: "../.env" });
import express from "express";
import notionRouter from "./routes/notion";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/notion", notionRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
