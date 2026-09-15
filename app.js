// Beginner College Project: Finly Expense Tracker in React (No node_modules!)
const { useState, useEffect } = React;

const CATEGORIES = [
  { name: 'Food', color: '#10b981' },
  { name: 'Rent', color: '#3b82f6' },
  { name: 'Transport', color: '#f59e0b' },
  { name: 'Tech', color: '#8b5cf6' },
  { name: 'Entertainment', color: '#ec4899' },
  { name: 'Other', color: '#6b7280' }
];

function App() {
  // 1. Budget and Expenses from LocalStorage
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('college_budget');
    return saved ? Number(saved) : 2000;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('college_expenses');
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, title: 'Groceries', amount: 65, category: 'Food' },
          { id: 2, title: 'Bus Pass', amount: 30, category: 'Transport' },
          { id: 3, title: 'Wi-Fi Bill', amount: 50, category: 'Tech' }
        ];
  });

  // 2. Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');

  // 3. Save to localStorage
  useEffect(() => {
    localStorage.setItem('college_budget', budget);
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('college_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // 4. Calculations
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = budget - totalSpent;
  const percentSpent = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;

  // Category totals for visual bars
  const categoryTotals = CATEGORIES.map((cat) => {
    const total = expenses
      .filter((item) => item.category === cat.name)
      .reduce((sum, item) => sum + item.amount, 0);
    const percent = totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0;
    return { name: cat.name, color: cat.color, total, percent };
  }).filter((item) => item.total > 0);

  // 5. Add expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    const newExpense = {
      id: Date.now(),
      title: title.trim(),
      amount: Number(amount),
      category
    };

    setExpenses([newExpense, ...expenses]);
    setTitle('');
    setAmount('');
  };

  // 6. Delete expense
  const handleDelete = (id) => {
    setExpenses(expenses.filter((item) => item.id !== id));
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Finly <span>Tracker</span></h1>
        <p>Simple Expense & Budgeting (College Project)</p>
      </header>

      {/* --- BUDGET CARD --- */}
      <section className="card">
        <div className="budget-controls">
          <label>Monthly Budget ($):</label>
          <input
            type="number"
            min="0"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
        </div>

        <div className="stats-row">
          <div>
            <span className="stat-label">Spent</span>
            <h2 className="stat-value">${totalSpent}</h2>
          </div>
          <div>
            <span className="stat-label">Remaining</span>
            <h2 className={`stat-value ${remaining < 0 ? 'text-danger' : 'text-success'}`}>
              ${remaining}
            </h2>
          </div>
          <div>
            <span className="stat-label">Used</span>
            <h2 className="stat-value">{percentSpent}%</h2>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-bg">
          <div
            className={`progress-bar-fill ${
              percentSpent >= 100 ? 'bg-danger' : percentSpent >= 80 ? 'bg-warning' : 'bg-success'
            }`}
            style={{ width: `${percentSpent}%` }}
          />
        </div>

        {/* Threshold alerts */}
        {percentSpent >= 100 && (
          <p className="alert text-danger">⚠️ Alert: You have exceeded your monthly budget limit!</p>
        )}
        {percentSpent >= 80 && percentSpent < 100 && (
          <p className="alert text-warning">⚠️ Warning: You have used over 80% of your budget.</p>
        )}
      </section>

      {/* --- ADD EXPENSE FORM --- */}
      <section className="card">
        <h3>Add Expense</h3>
        <form onSubmit={handleAddExpense} className="expense-form">
          <input
            type="text"
            placeholder="Expense title (e.g. Lunch)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Amount ($)"
            min="0.01"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-add">
            + Add Expense
          </button>
        </form>
      </section>

      {/* --- VISUAL CATEGORY BREAKDOWN --- */}
      {categoryTotals.length > 0 && (
        <section className="card">
          <h3>Category Breakdown</h3>
          <div className="category-bars">
            {categoryTotals.map((cat) => (
              <div key={cat.name} className="category-bar-row">
                <div className="category-bar-info">
                  <span>{cat.name}</span>
                  <strong>${cat.total} ({cat.percent}%)</strong>
                </div>
                <div className="category-track">
                  <div
                    className="category-fill"
                    style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- EXPENSES LIST --- */}
      <section className="card">
        <h3>Recent Expenses ({expenses.length})</h3>
        {expenses.length === 0 ? (
          <p className="empty-text">No expenses added yet.</p>
        ) : (
          <ul className="expense-list">
            {expenses.map((item) => (
              <li key={item.id} className="expense-item">
                <div className="expense-left">
                  <span className="badge">{item.category}</span>
                  <strong>{item.title}</strong>
                </div>
                <div className="expense-right">
                  <span className="expense-amount">-${item.amount}</span>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(item.id)}
                    title="Delete expense"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// Render React to root div
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
