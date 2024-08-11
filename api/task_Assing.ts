import express from "express";
import mysql from "mysql";
import { conn } from "../connectdb";
import { TaskAssingGetRespons } from "../model/task_AssingGetRespons";
export const router = express.Router();
import util from "util";

router.get("/", (req, res) => {
  conn.query("select * from task_assignment", (err, result, fields) => {
    res.json(result);
  });
});

router.get("/assing/:id", (req, res) => {
  let id = req.params.id;
  conn.query("select  task_assignment.task_assignment_id,task_assignment.task_id, user.name,task_assignment.assigned_date FROM task_assignment JOIN `user` ON user.user_id=task_assignment.user_id  WHERE task_assignment.task_id = "+id, (err, result, fields) => {
    res.json(result);
  });
});

//เพิ่ม task_assignment  
router.post("/", async (req, res) => {
    console.log(req.body);
    let  Task: TaskAssingGetRespons = req.body;
    const currentDate = new Date(); 
    const formattedDate = currentDate.toISOString().split('T')[0]; // "2024-08-08"
  try {
    let sql =
      "INSERT INTO `task_assignment`(`task_id`,`user_id`,`assigned_date`) VALUES (?,?,?)";
    sql = mysql.format(sql, [Task.task_id, Task.user_id,formattedDate]);
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

///ลบ task_assignment ✔
router.delete("/:id", (req, res) => {
  let id = req.params.id;
  let sql = "DELETE FROM `task_assignment` WHERE task_assignment_id=" + id;
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res
      .status(202)
      .json({ affected_row: result.affectedRows, last_idx: result.insertId });
  });
});

