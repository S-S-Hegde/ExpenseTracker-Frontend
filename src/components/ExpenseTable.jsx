function ExpenseTable() {
    const expenses = [
      { id: 1, date: "2026-02-01", category: "Food", description: "Lunch", amount: 250 },
      { id: 2, date: "2026-02-02", category: "Transport", description: "Uber", amount: 180 },
      { id: 3, date: "2026-02-03", category: "Shopping", description: "T-shirt", amount: 900 }
    ];
  
    return (
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
  
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Date</th>
              <th className="p-2">Category</th>
              <th className="p-2">Description</th>
              <th className="p-2">Amount</th>
            </tr>
          </thead>
  
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{expense.date}</td>
                <td className="p-2">{expense.category}</td>
                <td className="p-2">{expense.description}</td>
                <td className="p-2 font-semibold">₹ {expense.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  export default ExpenseTable;
  