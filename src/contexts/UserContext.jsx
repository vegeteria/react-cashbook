import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

const apiUrl = import.meta.env.VITE_API_BASE_URL || '';

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSheetsForUser = async (userId, username) => {
    try {
      const response = await fetch(`${apiUrl}/api/sheets/${userId}`);
      if (response.ok) {
        const sheets = await response.json();
        setCurrentUser({ username, userId, sheets });
      } else {
        // Handle case where sheets couldn't be fetched
        setCurrentUser({ username, userId, sheets: [] });
      }
    } catch (error) {
      console.error('Error fetching sheets:', error);
      setCurrentUser({ username, userId, sheets: [] });
    }
  };

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${apiUrl}/api/verify-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            const data = await response.json();
            await fetchSheetsForUser(data.userId, data.username);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Token verification error:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        await fetchSheetsForUser(data.userId, username);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        return await login(username, password);
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider value={{ currentUser, loading, login, signup, logout, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};
