// Badge.jsx (ShadCN UI style)
import * as React from "react";

export function Badge({ className = "", color = "blue", ...props }) {
  const colorMap = {
    blue: "bg-blue-600 text-white",
    green: "bg-green-600 text-white",
    purple: "bg-purple-600 text-white",
    gray: "bg-gray-700 text-gray-300",
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colorMap[color] || colorMap.blue} ${className}`} {...props} />
  );
}
