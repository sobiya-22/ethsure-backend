
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthUser } from '../hooks/useAuthUser';

const Navbar = () => {
  const { user, token, logout } = useAuthUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg"></div>
            <span className="text-xl font-bold">EthSure</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
            <Link to="/services" className="text-gray-300 hover:text-white transition-colors">Services</Link>
            {user && user.role === 'admin' && (
              <Link to="/dashboard/admin" className="text-gray-300 hover:text-white transition-colors">Admin</Link>
            )}
            {user && user.role === 'agent' && (
              <Link to="/dashboard/agent" className="text-gray-300 hover:text-white transition-colors">Agent</Link>
            )}
            {user && user.role === 'customer' && (
              <Link to="/dashboard/customer" className="text-gray-300 hover:text-white transition-colors">Customer</Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {!token ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">Profile</Button>
                </Link>
                <Button onClick={handleLogout} variant="ghost" className="text-gray-300 hover:text-white">Logout</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
