import React from 'react';
import LeaveRequestForm from './components/LeaveRequestForm';
import LeaveList from './components/LeaveList';

const App = () => {
    return (
        <div>
            <h1>ระบบขออนุญาตลาหยุด</h1>
            <LeaveRequestForm />
            <LeaveList />
        </div>
    );
};

export default App;
