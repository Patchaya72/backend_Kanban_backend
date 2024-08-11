import express from "express";
import mysql from "mysql";
import util from "util";
import { conn } from "../connectdb";
import { NotificationGetRespons } from "../model/notificationGetRespons";
export const router = express.Router();

router.get("/", (req, res) => {
    conn.query("select * from notification", (err, result, fields) => {
      res.json(result);
    });
  });

  router.get("/:id", (req, res) => {
    let id = req.params.id;
    conn.query("select * from notification WHERE notification.user_id="+id, (err, result, fields) => {
      res.json(result);
    });
  });
  
  router.get("/count/:id", (req, res) => {
    let id = req.params.id;
    conn.query(
        "SELECT COUNT(*) AS unread_count FROM notification WHERE user_id = ? AND is_read = 0",
        [id], //
        (err, results, fields) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ error: "Database query error" });
            }
            res.json(results[0]); 
        }
    );
});


//เพิ่ม notification  ✔
router.post("/", async (req, res) => {
    console.log(req.body);
  
    let  data: NotificationGetRespons = req.body;
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // "2024-08-08"

    try {
        
      let sql = "INSERT INTO `notification`(`notification_text`, `is_read`,`created_date` ,`user_id`) VALUES (?,?,?,?)";
      sql = mysql.format(sql, [
        data.notification_text,
        data.is_read,
        formattedDate,
        data.user_id 
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


  ///ลบ  ✔
router.delete("/:id", (req, res) => {
    let id = req.params.id;
    let sql = "DELETE FROM `notification` WHERE notification_id=" + id;
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(202)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
  });

 export default router;

 ///แก้ไข  ✔
router.put("/:id", async (req, res) => {
    let id = req.params.id;
    let notification: NotificationGetRespons = req.body;
  
    let notificationOriginal: NotificationGetRespons;
    const queryAsync = util.promisify(conn.query).bind(conn);
  
    let sql = mysql.format("select * from notification where notification_id = ?", [id]);
  
    let result = await queryAsync(sql);
    const rawData = JSON.parse(JSON.stringify(result));
    notificationOriginal = rawData[0] as NotificationGetRespons;
  
    console.log(rawData);
    notificationOriginal = rawData[0] as NotificationGetRespons;
    console.log(notificationOriginal);
    try {
      conn.query(sql, (err, result) => {
        let updateNotification_id= { ...notificationOriginal, ...notification };
        console.log(updateNotification_id);
        sql =
          "update  `notification` set  `notification_text`=?, `created_date`=?, `is_read`=? , `user_id`=?    where `notification_id`=?";
        sql = mysql.format(sql, [
            updateNotification_id.notification_text,
            updateNotification_id.created_date,
            updateNotification_id.is_read,
            updateNotification_id.user_id,
          id,
        ]);
        conn.query(sql, (err, result) => {
          if (err) throw err;
          res.status(201).json({ affected_row: result.affectedRows });
        });
      });
    } catch (error) {}
  });

 
 ///แก้ไข is_read ✔
  router.put("/is_read/:id", (req, res) => {
    const id = req.params.id;
  
    // คำสั่ง SQL สำหรับอัปเดตค่า is_read
    const sql = `
      UPDATE notification
      SET is_read = 1
      WHERE user_id = ? AND is_read = 0;
    `;
  
    conn.query(sql, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      // ส่งผลลัพธ์กลับไปยัง client
      res.status(202).json({
        affected_rows: result.affectedRows,
      });
    });
  });
  