import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaveList = () => {
    const [leaves, setLeaves] = useState([]);
    const [filteredLeaves, setFilteredLeaves] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // 📌 ฟังก์ชันดึงข้อมูลรายการขอลาหยุด
    const fetchLeaves = async () => {
        try {
            const response = await axios.get('http://localhost:5000/leaves');
            setLeaves(response.data);
            setFilteredLeaves(response.data);  // รีเซ็ตการกรองเมื่อดึงข้อมูล
        } catch (error) {
            console.error(error);
        }
    };

    // 📌 ฟังก์ชันกรองข้อมูลตามชื่อหรือวันที่ขอลา
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query === "") {
            setFilteredLeaves(leaves);
        } else {
            const result = leaves.filter(leave =>
                leave.name.toLowerCase().includes(query.toLowerCase()) ||
                leave.startDate.includes(query)
            );
            setFilteredLeaves(result);
        }
    };

    // 📌 เรียกฟังก์ชัน fetchLeaves เมื่อ component โหลด
    useEffect(() => {
        fetchLeaves();
    }, []);

    // 📌 ฟังก์ชันลบข้อมูล
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("คุณแน่ใจว่าต้องการลบข้อมูลนี้?");
        if (confirmDelete) {
            try {
                const response = await axios.delete(`http://localhost:5000/leaves/${id}`);
                alert(response.data.message);
                // รีเฟรชรายการขอลา
                fetchLeaves();
            } catch (error) {
                console.error(error);
                alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    // 📌 ฟังก์ชันปรับสถานะคำขอลา
    const handleApprove = async (id, newStatus) => {
        try {
            // ส่งคำขอปรับสถานะใหม่ไปยัง API
            const response = await axios.put(`http://localhost:5000/leaves/${id}`, {
                status: newStatus
            });

            // อัปเดตข้อมูลใน state ทันทีที่สถานะถูกเปลี่ยน
            const updatedLeaves = leaves.map((leave) => 
                leave.id === id ? { ...leave, status: newStatus } : leave
            );

            // ตั้งค่า state ใหม่
            setLeaves(updatedLeaves);
            setFilteredLeaves(updatedLeaves); // อัปเดตข้อมูลที่กรองด้วย

            alert(response.data.message); // แจ้งข้อความ
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการปรับสถานะ');
        }
    };

    return (
        <div>
            <h2>รายการขอลาหยุด</h2>
            
            {/* ค้นหาข้อมูล */}
            <input
                type="text"
                placeholder="ค้นหาตามชื่อหรือวันที่ขอลา"
                value={searchQuery}
                onChange={handleSearch}
            />

            <table>
                <thead>
                    <tr>
                        <th>ชื่อ</th>
                        <th>ประเภทการลา</th>
                        <th>วันที่ขอลา</th>
                        <th>สถานะ</th>
                        <th>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLeaves.length > 0 ? (
                        filteredLeaves.map((leave) => (
                            <tr key={leave.id}>
                                <td>{leave.name}</td>
                                <td>{leave.leaveType}</td>
                                <td>{leave.startDate} ถึง {leave.endDate}</td>
                                <td>{leave.status}</td>
                                <td>
                                    {/* ปุ่มลบ */}
                                    <button onClick={() => handleDelete(leave.id)}>ลบ</button>
                                    
                                    {/* ปุ่มปรับสถานะอนุมัติ/ไม่อนุมัติ */}
                                    {leave.status === "รอพิจารณา" && (
                                        <>
                                            <button onClick={() => handleApprove(leave.id, 'อนุมัติ')}>อนุมัติ</button>
                                            <button onClick={() => handleApprove(leave.id, 'ไม่อนุมัติ')}>ไม่อนุมัติ</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">ไม่มีข้อมูล</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default LeaveList;
