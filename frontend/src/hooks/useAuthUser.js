// useAuthUser.js
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
export const useAuthUser = () => useContext(AuthContext);
