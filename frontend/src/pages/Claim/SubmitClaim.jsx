// SubmitClaim.jsx
import React from 'react';

const SubmitClaim = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Submit Claim</h2>
        {/* Claim form placeholder */}
        <form className="space-y-4">
          <input className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white" placeholder="Claim Title" />
          <textarea className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white" placeholder="Claim Details" />
          <input type="file" className="w-full text-gray-300" />
          <button className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default SubmitClaim;
