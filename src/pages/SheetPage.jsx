import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSheets from '../hooks/useSheets';
import TransactionList from '../components/TransactionList';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { currencies } from '../currencies';
import { UserContext } from '../contexts/UserContext';

const apiUrl = import.meta.env.VITE_API_BASE_URL || '';

const SheetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sheets, addTransaction, updateTransaction, deleteTransaction } = useSheets();
  const { currentUser } = useContext(UserContext);
  const sheet = sheets.find((sheet) => sheet._id === id);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(currencies[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleAddTransaction = (type) => {
    if (description.trim() !== '' && amount.trim() !== '') {
      addTransaction(id, {
        id: Date.now(),
        date,
        description,
        amount: type === 'in' ? parseFloat(amount) : -parseFloat(amount),
        currency,
      });
      setDescription('');
      setAmount('');
    }
  };

  const generatePdf = () => {
    try {
      console.log('Generating PDF...');
      console.log('Sheet data:', sheet);

      const doc = new jsPDF();

      // Add a title
      doc.setFontSize(20);
      doc.text(`Cashbook - ${sheet.sheetName}`, 14, 22);

      // Add a table of transactions
      doc.autoTable({
        startY: 30,
        head: [['Date', 'Description', 'Amount', 'Currency']],
        body: sheet.transactions.map(tx => [tx.date, tx.description, tx.amount.toFixed(2), tx.currency]),
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] },
      });

      // Add the total balance
      const totalBalance = sheet.transactions.reduce((acc, tx) => acc + tx.amount, 0);
      const finalY = doc.lastAutoTable.finalY;
      doc.setFontSize(12);
      doc.text(`Total Balance: ${totalBalance.toFixed(2)}`, 14, finalY + 10);

      // Open the PDF in a new tab
      doc.output('dataurlnewwindow');
      console.log('PDF generated successfully.');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  const handleSave = async () => {
    if (!currentUser || !sheet) {
      alert('Cannot save. User or sheet not found.');
      return;
    }

    const totalBalance = sheet.transactions.reduce((acc, tx) => acc + tx.amount, 0);

    try {
      const response = await fetch(`${apiUrl}/api/sheets/${sheet._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheetName: sheet.sheetName,
          transactions: sheet.transactions,
          totals: {
            balance: totalBalance,
          },
        }),
      });

      if (response.ok) {
        alert('Sheet saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to save sheet: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error saving sheet:', error);
      alert('An error occurred while saving the sheet.');
    }
  };

  if (!sheet) {
    return <div>Loading sheet...</div>;
  }

  const totalBalance = sheet.transactions.reduce((acc, tx) => acc + tx.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-4 md:mb-0">{sheet.sheetName}</h2>
        <div className="flex flex-col md:flex-row items-center">
          <div className="stat mb-4 md:mb-0">
            <div className="stat-title">Total Balance</div>
            <div className="stat-value">{totalBalance.toFixed(2)}</div>
          </div>
          <button onClick={() => navigate('/')} className="btn btn-secondary mb-2 md:mb-0 md:ml-4">Back to Sheets</button>
          <button onClick={generatePdf} className="btn btn-success mb-2 md:mb-0 md:ml-4">Generate PDF</button>
          <button onClick={handleSave} className="btn btn-primary md:ml-4">Save</button>
        </div>
      </div>
      <div className="form-control grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input input-bordered"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="input input-bordered"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="input input-bordered"
        />
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="select select-bordered">
          {currencies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="btn-group">
          <button onClick={() => handleAddTransaction('in')} className="btn btn-success">Cash In</button>
          <button onClick={() => handleAddTransaction('out')} className="btn btn-error">Cash Out</button>
        </div>
      </div>
      <TransactionList transactions={sheet.transactions} updateTransaction={updateTransaction} deleteTransaction={deleteTransaction} sheetId={sheet._id} />
    </div>
  );
};

export default SheetPage;
