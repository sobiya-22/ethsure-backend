// Sidebar.jsx
import React from 'react';

const Sidebar = () => {
  return (
    <aside className="h-full w-64 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6 hidden md:block">
      {/* Sidebar links based on role */}
      <div className="space-y-4">
        <span className="text-gray-300">[Sidebar Links]</span>
      </div>
    </aside>
  );
};

export default Sidebar;
