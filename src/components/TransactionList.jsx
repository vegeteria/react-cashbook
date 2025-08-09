import React from 'react';

const TransactionList = ({ transactions, updateTransaction, deleteTransaction, sheetId }) => {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.date}</td>
              <td>{transaction.description}</td>
              <td>{transaction.amount}</td>
              <td>{transaction.currency}</td>
              <td>
                <div className="btn-group">
                  <button onClick={() => {
                    const newDescription = prompt('Enter new description', transaction.description);
                    const newAmount = prompt('Enter new amount', transaction.amount);
                    if (newDescription && newAmount) {
                      updateTransaction(sheetId, transaction.id, { ...transaction, description: newDescription, amount: parseFloat(newAmount) });
                    }
                  }} className="btn btn-warning">Edit</button>
                  <button onClick={() => deleteTransaction(sheetId, transaction.id)} className="btn btn-error">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
