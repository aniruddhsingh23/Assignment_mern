import React from "react";

const TransactionsTable = ({ transactions, search, setSearch, page, setPage }) => {
  return (
    <div className="transactions-table">
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search transactions"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Date of Sale</th>
              <th>Sold</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{transaction.title}</td>
                  <td>{transaction.description}</td>
                  <td>${transaction.price}</td>
                  <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                  <td>{transaction.sold ? "Yes" : "No"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((prev) => prev + 1)}>Next</button>
      </div>
    </div>
  );
};

export default TransactionsTable;
