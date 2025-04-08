"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Check for existing user data in localStorage or sessionStorage on initial load
    const checkExistingAuth = () => {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear invalid data
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('token');
        }
      }
    };

    checkExistingAuth();
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    // Clear user data from state
    setUser(null);
    setIsLoggedIn(false);
    
    // Clear storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 