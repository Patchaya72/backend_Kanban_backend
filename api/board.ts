import express from "express";
import mysql from "mysql";
import util from "util";
import { conn } from "../connectdb";
import { BoardGetResspones } from "../model/boardGetResspones";
export const router = express.Router();

router.get("/", (req, res) => {
    conn.query("select * from board", (err, result, fields) => {
      res.json(result);
    });
  });

//เพิ่ม board  ✔
router.post("/", async (req, res) => {
    console.log(req.body);
  
    let  Board: BoardGetResspones = req.body;
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // "2024-08-08"

    try {
        
      let sql = "INSERT INTO `board`(`board_name`, `description`, `created_date`, `user_id`) VALUES (?,?,?,?)";
      sql = mysql.format(sql, [
        Board.board_name,
        Board.description,
        formattedDate,
        Board.user_id 
      ]);
  
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


  ///ลบ board ✔
router.delete("/:id", (req, res) => {
    let id = req.params.id;
    let sql = "DELETE FROM `board` WHERE board_id=" + id;
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(202)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
  });

 export default router;

 ///แก้ไข board ✔
router.put("/:id", async (req, res) => {
    let id = req.params.id;
    let user: BoardGetResspones = req.body;
  
    let userOriginal: BoardGetResspones;
    const queryAsync = util.promisify(conn.query).bind(conn);
  
    let sql = mysql.format("select * from board where board_id = ?", [id]);
  
    let result = await queryAsync(sql);
    const rawData = JSON.parse(JSON.stringify(result));
    userOriginal = rawData[0] as BoardGetResspones;
  
    console.log(rawData);
    userOriginal = rawData[0] as BoardGetResspones;
    console.log(userOriginal);
    try {
      conn.query(sql, (err, result) => {
        let updateBoard= { ...userOriginal, ...user };
        console.log(updateBoard);
        sql =
          "update  `board` set  `board_name`=?, `description`=?  where `board_id`=?";
        sql = mysql.format(sql, [
            updateBoard.board_name,
            updateBoard.description,

          id,
        ]);
        conn.query(sql, (err, result) => {
          if (err) throw err;
          res.status(201).json({ affected_row: result.affectedRows });
        });
      });
    } catch (error) {}
  });
  