// Badge.jsx
import * as React from "react";

export function Badge({ children, color = "blue", className = "" }) {
  const colorMap = {
    blue: "bg-blue-600 text-white",
    green: "bg-green-600 text-white",
    purple: "bg-purple-600 text-white",
    gray: "bg-gray-700 text-gray-300",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorMap[color] || colorMap.blue} ${className}`}>
      {children}
    </span>
  );
}
