// Card.jsx (ShadCN UI style)
import * as React from "react";

export function Card({ className = "", ...props }) {
  return (
    <div className={`rounded-2xl border border-gray-700 bg-gray-800/50 shadow-lg ${className}`} {...props} />
  );
}

export function CardHeader({ className = "", ...props }) {
  return <div className={`p-6 pb-0 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }) {
  return <h3 className={`text-xl font-bold ${className}`} {...props} />;
}

export function CardDescription({ className = "", ...props }) {
  return <p className={`text-gray-300 ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }) {
  return <div className={`p-6 pt-2 ${className}`} {...props} />;
}
