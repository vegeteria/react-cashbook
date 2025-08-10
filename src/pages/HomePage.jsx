import React, { useState } from 'react';
import useSheets from '../hooks/useSheets';
import SheetList from '../components/SheetList';

const HomePage = () => {
  const { sheets, addSheet, deleteSheet, updateSheet } = useSheets();
  const [newSheetName, setNewSheetName] = useState('');

  const handleAddSheet = async (e) => {
    e.preventDefault();
    if (newSheetName.trim() !== '') {
      await addSheet(newSheetName);
      setNewSheetName('');
    }
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome to Cashbook</h1>
          <p className="py-6">Create and manage your cash sheets with ease. Get started by creating a new sheet.</p>
          <form onSubmit={handleAddSheet} className="form-control">
            <div className="input-group">
              <input
                type="text"
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                placeholder="New sheet name"
                className="input input-bordered w-full"
              />
              <button type="submit" className="btn btn-primary">
                Add Sheet
              </button>
            </div>
          </form>
          <div className="divider">OR</div>
          <SheetList sheets={sheets} deleteSheet={deleteSheet} updateSheet={updateSheet} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
