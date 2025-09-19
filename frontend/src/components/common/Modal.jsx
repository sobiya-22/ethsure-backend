// Modal.jsx
import * as React from "react";

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl shadow-xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">✕</button>
        <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
        {children}
      </div>
    </div>
  );
}
