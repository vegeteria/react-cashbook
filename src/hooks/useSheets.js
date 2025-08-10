import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

const apiUrl = import.meta.env.VITE_API_BASE_URL || '';

const useSheets = () => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const sheets = currentUser ? currentUser.sheets : [];

  const addSheet = async (name) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${apiUrl}/api/sheets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sheetName: name,
          transactions: [],
          totals: { balance: 0 },
        }),
      });
      if (response.ok) {
        const newSheet = await response.json();
        // Manually refetch or update the context
        const refetchResponse = await fetch(`${apiUrl}/api/sheets/${currentUser.userId}`, { credentials: 'include' });
        const fetchedSheets = await refetchResponse.json();
        setCurrentUser({ ...currentUser, sheets: fetchedSheets });
      }
    } catch (error) {
      console.error('Error adding sheet:', error);
    }
  };

  const updateSheet = async (id, newName) => {
    try {
      const response = await fetch(`${apiUrl}/api/sheets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sheetName: newName }),
      });
      if (response.ok) {
        setCurrentUser(prevUser => ({
          ...prevUser,
          sheets: prevUser.sheets.map((sheet) =>
            sheet._id === id ? { ...sheet, sheetName: newName } : sheet
          ),
        }));
      }
    } catch (error) {
      console.error('Error updating sheet:', error);
    }
  };

  const deleteSheet = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/api/sheets/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setCurrentUser(prevUser => ({
          ...prevUser,
          sheets: prevUser.sheets.filter((sheet) => sheet._id !== id),
        }));
      }
    } catch (error) {
      console.error('Error deleting sheet:', error);
    }
  };

  const addTransaction = (sheetId, transaction) => {
    setCurrentUser(prevUser => ({
      ...prevUser,
      sheets: prevUser.sheets.map((sheet) =>
        sheet._id === sheetId
          ? { ...sheet, transactions: [...sheet.transactions, transaction] }
          : sheet
      ),
    }));
  };

  const updateTransaction = (sheetId, transactionId, newTransaction) => {
    setCurrentUser(prevUser => ({
      ...prevUser,
      sheets: prevUser.sheets.map((sheet) =>
        sheet._id === sheetId
          ? {
              ...sheet,
              transactions: sheet.transactions.map((t) =>
                t.id === transactionId ? newTransaction : t
              ),
            }
          : sheet
      ),
    }));
  };

  const deleteTransaction = (sheetId, transactionId) => {
    setCurrentUser(prevUser => ({
      ...prevUser,
      sheets: prevUser.sheets.map((sheet) =>
        sheet._id === sheetId
          ? {
              ...sheet,
              transactions: sheet.transactions.filter(
                (t) => t.id !== transactionId
              ),
            }
          : sheet
      ),
    }));
  };

  return {
    sheets,
    addSheet,
    updateSheet,
    deleteSheet,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
};

export default useSheets;
