import { createContext, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const loginUser = async (payload) => {
    const res = await axios.post("http://localhost:5000/api/auth/login", payload);
    setUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem("token", res.data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  const updateRole = async (role) => {
    const res = await axios.put(
      "http://localhost:5000/api/auth/role",
      { role },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setUser(res.data.user);
    setToken(res.data.token);
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logout, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
};
