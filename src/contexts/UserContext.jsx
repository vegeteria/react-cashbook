import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

const apiUrl = import.meta.env.VITE_API_BASE_URL || '';

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSheetsForUser = async (userId, username) => {
    try {
      const response = await fetch(`${apiUrl}/api/sheets/${userId}`, {
        credentials: 'include',
      });
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
      try {
        const response = await fetch(`${apiUrl}/api/me`, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          await fetchSheetsForUser(data.userId, data.username);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setCurrentUser(null);
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
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
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
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchSheetsForUser(data.userId, username);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${apiUrl}/api/logout`, { method: 'POST', credentials: 'include' });
    } catch (_) {}
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider value={{ currentUser, loading, login, signup, logout, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};
