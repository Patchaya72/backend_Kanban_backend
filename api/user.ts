import express from "express";
import mysql from "mysql";
import util from "util";
import { conn } from "../connectdb";
import bcrypt from "bcrypt";
import { UserPostRequest } from "../model/userPostRequest";
const saltRounds = 10; // จำนวนรอบในการเข้ารหัส

export const router = express.Router();

router.get("/", (req, res) => {
  conn.query("select * from user", (err, result, fields) => {
    res.json(result);
  });
});

router.get("/:email", (req, res) => {
  let email = req.params.email;
  conn.query("select user_id from user WHERE user.email='"+email+"'", (err, result, fields) => {
    res.json(result);
  });
});

//เพิ่ม User  ✔
router.post("/", async (req, res) => {
  console.log(req.body);
  let user: UserPostRequest = req.body;

  try {
    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    // สร้างคำสั่ง SQL
    let sql = "INSERT INTO `user`(`name`, `email`, `password`) VALUES (?,?,?)";
    sql = mysql.format(sql, [
      user.name,
      user.email,
      hashedPassword, // ใช้รหัสผ่านที่เข้ารหัสแล้ว
    ]);

    // ดำเนินการคำสั่ง SQL
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(202)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
  } catch (error) {
    console.log("จัดการข้อผิดพลาด");

    // จัดการข้อผิดพลาด
    res.status(500).json({ error: "Error hashing password" });
  }
});

///ลบ User ✔
router.delete("/:id", (req, res) => {
  let id = req.params.id;
  let sql = "DELETE FROM `user` WHERE user_id=" + id;
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res
      .status(202)
      .json({ affected_row: result.affectedRows, last_idx: result.insertId });
  });
});

///login User ✔
router.post("/login", (req, res) => {
  let user: UserPostRequest = req.body;

  console.log(user.email);
  console.log(user.password);

  conn.query(
    `SELECT * FROM user WHERE email = ?`,
    [user.email],
    (err, resultEmail) => {
      if (err) {
        res.status(500).json("เกิดข้อผิดพลาดในการเข้าถึงฐานข้อมูล");
        return;
      }
      if (resultEmail.length > 0) {
        const hashedPassword = resultEmail[0].password;
        bcrypt.compare(user.password, hashedPassword, (err, isMatch) => {
          if (err) {
            res.status(500).json("เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน");
            return;
          }
          if (isMatch) {
            res.status(202).json(resultEmail);
          } else {
            res.status(203).json("รหัสไม่ถูกต้อง");
          }
        });
      } else {
        res.status(203).json("อีเมลไม่ถูกต้อง");
      }
    }
  );
});

export default router;
