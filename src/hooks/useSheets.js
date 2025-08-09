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
        body: JSON.stringify({
          userId: currentUser.userId,
          sheetName: name,
          transactions: [],
          totals: { balance: 0 },
        }),
      });
      if (response.ok) {
        // Refetch sheets to update the list
        const refetchResponse = await fetch(`${apiUrl}/api/sheets/${currentUser.userId}`);
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
        body: JSON.stringify({ sheetName: newName }), // Ensure backend expects sheetName
      });
      if (response.ok) {
        const updatedSheets = sheets.map((sheet) =>
          sheet._id === id ? { ...sheet, sheetName: newName } : sheet
        );
        setCurrentUser({ ...currentUser, sheets: updatedSheets });
      }
    } catch (error) {
      console.error('Error updating sheet:', error);
    }
  };

  const deleteSheet = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/api/sheets/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updatedSheets = sheets.filter((sheet) => sheet._id !== id);
        setCurrentUser({ ...currentUser, sheets: updatedSheets });
      }
    } catch (error) {
      console.error('Error deleting sheet:', error);
    }
  };

  const addTransaction = (sheetId, transaction) => {
    const updatedSheets = sheets.map((sheet) =>
      sheet._id === sheetId
        ? { ...sheet, transactions: [...sheet.transactions, transaction] }
        : sheet
    );
    setCurrentUser({ ...currentUser, sheets: updatedSheets });
  };

  const updateTransaction = (sheetId, transactionId, newTransaction) => {
    const updatedSheets = sheets.map((sheet) =>
      sheet._id === sheetId
        ? {
            ...sheet,
            transactions: sheet.transactions.map((t) =>
              t.id === transactionId ? newTransaction : t
            ),
          }
        : sheet
    );
    setCurrentUser({ ...currentUser, sheets: updatedSheets });
  };

  const deleteTransaction = (sheetId, transactionId) => {
    const updatedSheets = sheets.map((sheet) =>
      sheet._id === sheetId
        ? {
            ...sheet,
            transactions: sheet.transactions.filter(
              (t) => t.id !== transactionId
            ),
          }
        : sheet
    );
    setCurrentUser({ ...currentUser, sheets: updatedSheets });
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
