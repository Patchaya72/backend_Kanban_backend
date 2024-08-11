import express from "express";
import mysql from "mysql";
import { conn } from "../connectdb";
import { ColumnGetResspones } from "../model/columnGetResspones";
import { TaskGetResspones } from "../model/taskGetResspones";
export const router = express.Router();
import util from "util";

router.get("/", (req, res) => {
  conn.query("select * from task", (err, result, fields) => {
    res.json(result);
  });
});

//เพิ่ม task  
router.post("/", async (req, res) => {
    console.log(req.body);
    let  Task: TaskGetResspones = req.body;
    const currentDate = new Date(); 
    const formattedDate = currentDate.toISOString().split('T')[0]; // "2024-08-08"
  try {
    let sql =
      "INSERT INTO `task`(`task_title`,`column_id`,`due_date`) VALUES (?,?,?)";
    sql = mysql.format(sql, [Task.task_title, Task.column_id,formattedDate]);
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(202)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
  } catch (error) {
    // จัดการข้อผิดพลาด
    res.status(500).json({ error: "Error " });
  }
});

///ลบ task ✔
router.delete("/:id", (req, res) => {
  let id = req.params.id;
  let sql = "DELETE FROM `task` WHERE task_id=" + id;
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res
      .status(202)
      .json({ affected_row: result.affectedRows, last_idx: result.insertId });
  });
});

///แก้ไข task ✔
router.put("/:id", async (req, res) => {
  let id = req.params.id;
  let user: TaskGetResspones = req.body;

  let userOriginal: TaskGetResspones;
  const queryAsync = util.promisify(conn.query).bind(conn);

  let sql = mysql.format("select * from task where task_id = ?", [id]);

  let result = await queryAsync(sql);
  const rawData = JSON.parse(JSON.stringify(result));
  userOriginal = rawData[0] as TaskGetResspones;

  console.log(rawData);
  userOriginal = rawData[0] as TaskGetResspones;
  console.log(userOriginal);
  try {
    conn.query(sql, (err, result) => {
      let updateUser = { ...userOriginal, ...user };
      console.log(updateUser);
      sql =
        "update  `task` set `task_title`=?, `description`=?, `column_id`=?  where `task_id`=?";
      sql = mysql.format(sql, [
        updateUser.task_title,
        updateUser.description,
        updateUser.column_id,
        id,
      ]);
      conn.query(sql, (err, result) => {
        if (err) throw err;
        res.status(201).json({ affected_row: result.affectedRows });
      });
    });
  } catch (error) {}
});
