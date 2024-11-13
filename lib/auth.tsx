"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import Cookies from "js-cookie";

interface User {
  _id: string;
  email: string;
  nombre: string;
  rol: "vendedor" | "bodega" | "admin";
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data when component mounts
    const storedUser = Cookies.get("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const logout = () => {
    setUser(null);
    Cookies.remove("user"); // Remove the cookie on logout
  };

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      Cookies.set("user", JSON.stringify(newUser), { expires: 7 }); // Store for 7 days
    } else {
      Cookies.remove("user");
    }
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}