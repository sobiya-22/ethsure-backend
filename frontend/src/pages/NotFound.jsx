// NotFound.jsx
import React from 'react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <h1 className="text-6xl font-extrabold mb-4">404</h1>
      <p className="text-xl text-gray-300 mb-8">Page Not Found</p>
      <a href="/" className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">Go Home</a>
    </div>
  );
};

export default NotFound;
