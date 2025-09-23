// Profile.jsx
import React from 'react';

const Profile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>
        {/* Profile form placeholder */}
        <form className="space-y-4">
          <input className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white" placeholder="Name" />
          <input className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white" placeholder="Email" />
          <button className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">Update</button>
        </form>
        <div className="mt-6 text-gray-400">Wallet: <span className="text-white">[Wallet Address]</span></div>
      </div>
    </div>
  );
};

export default Profile;
