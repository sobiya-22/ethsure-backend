// AdminDashboard.jsx
import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg p-6">User Management [Table Placeholder]</div>
        <div className="bg-gray-800 rounded-lg p-6">Claim Approval [Table Placeholder]</div>
      </div>
      <div className="mt-8 bg-gray-800 rounded-lg p-6">Analytics [Charts Placeholder]</div>
    </div>
  );
};

export default AdminDashboard;
