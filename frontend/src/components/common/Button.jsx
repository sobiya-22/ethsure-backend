// Button.jsx
import * as React from "react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 text-white ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
