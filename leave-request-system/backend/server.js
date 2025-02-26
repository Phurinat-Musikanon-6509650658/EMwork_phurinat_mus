require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); // ใช้ mysql2/promise เพื่อรองรับ async/await
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// เชื่อมต่อกับ MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// 📌 API: ดึงรายการขอลาหยุดทั้งหมด
app.get('/leaves', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM leave_requests ORDER BY createdAt DESC');
        res.json(rows);
    } catch (err) {
        console.error('❌ Error fetching data:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
});

// 📌 API: เพิ่มคำขอลาหยุด
app.post('/leaves', async (req, res) => {
    const { name, phone, leaveType, reason, startDate, endDate } = req.body;

    // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (!name || !phone || !leaveType || !reason || !startDate || !endDate) {
        return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const today = new Date().toISOString().split('T')[0];
    if (startDate < today) {
        return res.status(400).json({ error: "ไม่สามารถลาย้อนหลังได้" });
    }
    if (leaveType === 'พักร้อน') {
        const diffDays = (new Date(startDate) - new Date(today)) / (1000 * 60 * 60 * 24);
        const leaveDays = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
        if (diffDays < 3) {
            return res.status(400).json({ error: "ต้องขอลาพักร้อนล่วงหน้าอย่างน้อย 3 วัน" });
        }
        if (leaveDays > 2) {
            return res.status(400).json({ error: "ลาพักร้อนติดต่อกันได้ไม่เกิน 2 วัน" });
        }
    }

    try {
        const sql = 'INSERT INTO leave_requests (name, phone, leaveType, reason, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [name, phone, leaveType, reason, startDate, endDate]);
        
        res.json({
            message: "บันทึกคำขอลาสำเร็จ",
            leave: {
                id: result.insertId,
                name,
                phone,
                leaveType,
                reason,
                startDate,
                endDate,
                status: 'รอพิจารณา', // สถานะเริ่มต้น
                createdAt: today
            }
        });
    } catch (err) {
        console.error('❌ Error inserting data:', err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
    }
});

// 📌 API: อัปเดตสถานะการพิจารณา
app.put('/leaves/:id/status', async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    // ตรวจสอบข้อมูลก่อน
    if (!status || !['อนุมัติ', 'ไม่อนุมัติ'].includes(status)) {
        return res.status(400).json({ error: "สถานะไม่ถูกต้อง" });
    }

    try {
        const sql = 'UPDATE leave_requests SET status = ? WHERE id = ?';
        const [result] = await db.execute(sql, [status, id]);
        
        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "ไม่พบคำขอลานี้ หรือสถานะไม่สามารถเปลี่ยนแปลงได้" });
        }

        res.json({ message: "อัปเดตสถานะสำเร็จ" });
    } catch (err) {
        console.error('❌ Error updating status:', err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" });
    }
});

// 📌 API: ลบรายการใบลาหยุด
app.delete('/leaves/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const sql = 'DELETE FROM leave_requests WHERE id = ?';
        const [result] = await db.execute(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "ไม่พบคำขอลานี้" });
        }

        res.json({ message: "ลบสำเร็จ" });
    } catch (err) {
        console.error('❌ Error deleting data:', err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" });
    }
});

// 📌 เริ่มเซิร์ฟเวอร์
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
