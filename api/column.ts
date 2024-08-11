import express from "express";
import mysql from "mysql";
import { conn } from "../connectdb";
import { ColumnGetResspones, Task } from "../model/columnGetResspones";
import util from "util";
import { ColumnPutResspones } from "../model/columnPutResspones";
export const router = express.Router();

router.get("/:id", (req, res) => {
    let id = req.params.id;
    const query = `
      SELECT 
    c.column_id, 
    c.column_name, 
    c.board_id,
    COALESCE(t.task_id) AS task_id, 
    t.task_title, 
    t.description, 
    t.due_date
FROM 
    board_column c
LEFT JOIN 
    task t ON c.column_id = t.column_id
WHERE 
    c.board_id =`+id;
  
    conn.query(query, (err, result: any) => {
      if (err) {
        return res.status(500).json({ error: "Database query error" });
      }
  
      const columns: ColumnGetResspones[] = [];
      console.log(result);
      
      result.forEach((row: any) => {
        let column = columns.find(c => c.column_id === row.column_id);
  
        if (!column) {
          column = {
            column_id: row.column_id,
            column_name: row.column_name,
            board_id: row.board_id,
            tasks: []
          };
          columns.push(column);
        }
  
        if (row.task_id !== null) {
          const task: Task = {
            task_id: row.task_id,
            task_title: row.task_title,
            description: row.description,
            due_date: row.due_date,
            column_id: row.column_id
          };
          column.tasks.push(task);
        }
      });
  
      res.json(columns);
    });
  });

//เพิ่ม column  ✔
router.post("/", async (req, res) => {
  console.log(req.body);
  let column: ColumnGetResspones = req.body;
  try {
    let sql =
      "INSERT INTO `board_column`(`column_name`, `board_id`) VALUES (?,?)";
    sql = mysql.format(sql, [column.column_name, column.board_id]);

    // ดำเนินการคำสั่ง SQL
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

///ลบ column ✔
router.delete("/:id", (req, res) => {
  let id = req.params.id;
  let sql = "DELETE FROM `board_column` WHERE column_id=" + id;
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res
      .status(202)
      .json({ affected_row: result.affectedRows, last_idx: result.insertId });
  });
});

///แก้ไข column ✔
router.put("/:id", async (req, res) => {
    let id = req.params.id;
    let column: ColumnPutResspones = req.body;
  
    let columnOriginal: ColumnPutResspones;
    const queryAsync = util.promisify(conn.query).bind(conn);
  
    let sql = mysql.format("select * from board_column where column_id = ?", [id]);
  
    let result = await queryAsync(sql);
    const rawData = JSON.parse(JSON.stringify(result));
    columnOriginal = rawData[0] as ColumnPutResspones;
  
    console.log(rawData);
    columnOriginal = rawData[0] as ColumnPutResspones;
    console.log(columnOriginal);
    try {
      conn.query(sql, (err, result) => {
        let updateColumn= { ...columnOriginal, ...column };
        console.log(updateColumn);
        sql =
          "update  `board_column` set  `column_name`=?, `board_id`=?  where `column_id`=?";
        sql = mysql.format(sql, [
            updateColumn.column_name,
            updateColumn.board_id,
          id,
        ]);
        conn.query(sql, (err, result) => {
          if (err) throw err;
          res.status(201).json({ affected_row: result.affectedRows });
        });
      });
    } catch (error) {}
  });
  