import express from "express";
import { router as index } from "./api/index";
import { router as user } from "./api/user";
import { router as board } from "./api/board";
import {router as column} from "./api/column"
import {router as task} from "./api/task"
import {router as board_member} from "./api/board_member"
import {router as task_assing} from "./api/task_Assing"
import {router as notification} from "./api/notification"

import cors from "cors"
import bodyParser from "body-parser";

export const app = express();

app.use(
    cors({
      origin: "*",
    })
  );
app.use(bodyParser.json());
app.use("/", index);
app.use("/user", user);
app.use("/board", board);
app.use("/column", column);
app.use("/task", task);
app.use("/board_member", board_member);
app.use("/task_assignment", task_assing);
app.use("/notification", notification);

  