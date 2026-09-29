function ExpenseList({ expenses }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">Expenses</h3>

      {expenses.length === 0 ? (
        <p>No expenses yet.</p>
      ) : (
        <ul className="space-y-2">
          {expenses.map((exp) => (
            <li key={exp.id} className="flex justify-between border-b pb-2">
              <span>{exp.description}</span>
              <span>₹ {exp.amount}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ExpenseList;
