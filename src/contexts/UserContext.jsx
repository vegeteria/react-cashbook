import React, { createContext, useState } from 'react';

export const UserContext = createContext();

const apiUrl = import.meta.env.VITE_API_BASE_URL || '';

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser({ username, userId: data.userId, sheets: [] });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (username, password) => {
    try {
      const response = await fetch(`${apiUrl}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser({ username, userId: data.userId, sheets: [] });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUser = (user) => {
    // This function may need to be updated to sync with the backend if needed
    console.log('updateUser called with:', user);
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, login, signup, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
