function StatCard({ title, amount }) {
    return (
      <div className="bg-white rounded-lg shadow p-6 w-full">
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <p className="text-2xl font-bold mt-2">₹ {amount}</p>
      </div>
    );
  }
  
  export default StatCard;
   