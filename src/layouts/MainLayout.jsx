import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { UserContext } from '../contexts/UserContext';

const MainLayout = ({ children }) => {
  const { toggleTheme } = useContext(ThemeContext);
  const { currentUser, logout } = useContext(UserContext);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h1 className="text-4xl font-bold">Cashbook</h1>
        <div className="flex items-center">
          {currentUser && <span className="mr-4">Welcome, {currentUser.username}</span>}
          <button className="btn btn-square" onClick={toggleTheme}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          </button>
          {currentUser && <button className="btn btn-primary ml-4" onClick={logout}>Logout</button>}
        </div>
      </div>
      {children}
    </div>
  );
};

export default MainLayout;
