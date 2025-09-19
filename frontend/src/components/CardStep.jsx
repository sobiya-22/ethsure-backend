// CardStep.jsx
import React from 'react';

const CardStep = ({ icon, title, description }) => {
  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-transform hover:scale-105">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
};

export default CardStep;
