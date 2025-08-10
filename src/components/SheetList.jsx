import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

const apiUrl = import.meta.env.VITE_API_BASE_URL || '';

const SheetList = ({ sheets, deleteSheet, updateSheet }) => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(UserContext);

  useEffect(() => {
    const fetchSheets = async () => {
      if (currentUser && currentUser.userId) {
        try {
          const response = await fetch(`${apiUrl}/api/sheets/${currentUser.userId}`, { credentials: 'include' });
          if (response.ok) {
            const fetchedSheets = await response.json();
            setCurrentUser({ ...currentUser, sheets: fetchedSheets });
          }
        } catch (error) {
          console.error('Error fetching sheets:', error);
        }
      }
    };

    fetchSheets();
  }, [currentUser?.userId, setCurrentUser]);

  return (
    <div className="grid grid-cols-1 gap-4">
      {sheets.map((sheet) => (
        <div
          key={sheet._id}
          className="card bg-base-100 shadow-xl"
        >
          <div className="card-body">
            <h2 className="card-title">{sheet.sheetName}</h2>
            <div className="card-actions justify-end">
              <button
                onClick={() => navigate(`/sheet/${sheet._id}`)}
                className="btn btn-primary"
              >
                Open
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newName = prompt('Enter new sheet name', sheet.sheetName);
                  if (newName) {
                    updateSheet(sheet._id, newName);
                  }
                }}
                className="btn btn-warning"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSheet(sheet._id);
                }}
                className="btn btn-error"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SheetList;
