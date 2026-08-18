import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

// add database and data layer 