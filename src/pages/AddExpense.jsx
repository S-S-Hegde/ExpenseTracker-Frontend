import { useState } from "react";

function AddExpense() {
  const [form, setForm] = useState({
    date: "",
    category: "",
    description: "",
    amount: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Expense Added:", form);
    alert("Expense added (for now just logged in console)");
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-xl">
      <h2 className="text-xl font-semibold mb-4">Add Expense</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="date"
          name="date"
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="description"
          placeholder="Description"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Expense
        </button>

      </form>
    </div>
  );
}

export default AddExpense;
