import express from "express";
import mysql from "mysql";
import util from "util";
import { conn } from "../connectdb";
import { BoardGetResspones } from "../model/boardGetResspones";
import { Board_memberGetResspones } from "../model/board_member";
export const router = express.Router();


router.get("/", (req, res) => {
    conn.query(
      "select * from board_member;",
      (err, result, fields) => {
        res.json(result);
        console.log("select ");
      }
    );
  });

//หา board_member by board id  ✔
router.get("/user/:id", (req, res) => {
 let id = req.params.id;
  conn.query(
    "SELECT user.user_id,user.name ,board_member.joined_date FROM board_member JOIN  `user` ON board_member.user_id =  user.user_id WHERE  board_member.board_id ="+id,
    (err, result, fields) => {
      res.json(result);
      console.log("by board ID ");
    }
  );
});

// หา board_member by User id ✔
router.get("/board/:id", (req, res) => {
    let id = req.params.id;
    conn.query(
        `SELECT 
            b.board_id,
            b.board_name,
            b.user_id,
           GREATEST(COUNT(bm.user_id), 1) AS user_count
        FROM 
            board b
        LEFT JOIN 
            board_member bm ON bm.board_id = b.board_id
        WHERE 
            b.board_id IN (
                SELECT board_id 
                FROM board_member 
                WHERE user_id = ?
            )
            OR 
            b.user_id = ?  -- Assuming there's a column 'user_id' in the 'board' table that represents the board creator
        GROUP BY 
            b.board_id;`,
        [id, id], 
        (err, result, fields) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(result);
            }
            console.log("by user ID" + id);
        }
    );
});



//เพิ่ม board_member  ✔
router.post("/", async (req, res) => {

  let Board: Board_memberGetResspones = req.body;
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0]; // "2024-08-08"
  try {
    let sql =
      "INSERT INTO `board_member`(`board_id`, `user_id`, `joined_date`) VALUES (?,?,?)";
    sql = mysql.format(sql, [
      Board.board_id,
      Board.user_id,
      formattedDate,
    ]);
    // ดำเนินการคำสั่ง SQL
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(202)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
        console.log(result);
    });
  } catch (error) {
    // จัดการข้อผิดพลาด
    res.status(500).json({ error: "Error " });
  }
});

///ลบ board ✔
router.delete("/:id", (req, res) => {
  let id = req.params.id;
  let sql = "DELETE FROM `board_member` WHERE board_member_id=" + id;
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res
      .status(202)
      .json({ affected_row: result.affectedRows, last_idx: result.insertId });
  });
});

export default router;
