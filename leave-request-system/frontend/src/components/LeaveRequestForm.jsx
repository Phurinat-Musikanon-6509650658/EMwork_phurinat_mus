import React, { useState } from 'react';
import axios from 'axios';

const LeaveRequestForm = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [leaveType, setLeaveType] = useState('อื่นๆ');
    const [reason, setReason] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ตรวจสอบเงื่อนไข
        const today = new Date().toISOString().split('T')[0];
        if (startDate < today) {
            alert('ไม่สามารถลาย้อนหลังได้');
            return;
        }

        if (leaveType === 'พักร้อน') {
            const diffDays = (new Date(startDate) - new Date(today)) / (1000 * 60 * 60 * 24);
            const leaveDays = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
            if (diffDays < 3) {
                alert('ต้องขอลาพักร้อนล่วงหน้าอย่างน้อย 3 วัน');
                return;
            }
            if (leaveDays > 2) {
                alert('ลาพักร้อนติดต่อกันได้ไม่เกิน 2 วัน');
                return;
            }
        }

        try {
            const response = await axios.post('http://localhost:5000/leaves', {
                name,
                phone,
                leaveType,
                reason,
                startDate,
                endDate
            });

            alert(response.data.message);
            setName('');
            setPhone('');
            setLeaveType('อื่นๆ');
            setReason('');
            setStartDate('');
            setEndDate('');
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="ชื่อ - นามสกุล" 
                required 
            />
            <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="เบอร์โทรศัพท์" 
                required 
            />
            <select 
                value={leaveType} 
                onChange={(e) => setLeaveType(e.target.value)} 
                required
            >
                <option value="ลาป่วย">ลาป่วย</option>
                <option value="ลากิจ">ลากิจ</option>
                <option value="พักร้อน">พักร้อน</option>
                <option value="อื่นๆ">อื่นๆ</option>
            </select>
            <textarea 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                placeholder="สาเหตุการลา" 
                required 
            />
            <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                required 
            />
            <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                required 
            />
            <button type="submit">บันทึกคำขอลา</button>
        </form>
    );
};

export default LeaveRequestForm;
