import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { StatCard } from '../components/common/StatCard';
import { BudgetProgressCard } from '../components/budget/BudgetProgressCard';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { MonthlyBarChart } from '../components/charts/MonthlyBarChart';
import { ExpenseTable } from '../components/expenses/ExpenseTable';
import { ExpenseFormModal } from '../components/expenses/ExpenseFormModal';
import { formatCurrency } from '../utils/currencyFormatter';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  CreditCard,
  PlusCircle,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { stats, addExpense, selectedMonth, setSelectedMonth, monthlyHistory } = useExpenses();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Financial Overview
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Track your spending habits and manage your monthly allocations
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="month"
              className="form-input"
              style={{ padding: '0.5rem 0.85rem', colorScheme: 'dark', fontSize: '0.85rem' }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-gradient"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <PlusCircle size={18} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid-stats">
        <StatCard
          title="Total Spent This Month"
          value={formatCurrency(stats.totalSpent)}
          subtitle={`${stats.percentageUsed}% of budget utilized`}
          icon={TrendingDown}
          color="#ef4444"
          badge={stats.isOverBudget ? { text: 'Over Budget', bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171' } : { text: 'On Track', bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}
        />

        <StatCard
          title="Remaining Balance"
          value={formatCurrency(Math.max(0, stats.remainingBudget))}
          subtitle={stats.isOverBudget ? `Exceeded by ${formatCurrency(Math.abs(stats.remainingBudget))}` : 'Available to spend'}
          icon={DollarSign}
          color="#10b981"
        />

        <StatCard
          title="Monthly Budget Target"
          value={formatCurrency(stats.budgetLimit)}
          subtitle="Fixed spending allowance"
          icon={CreditCard}
          color="#6366f1"
        />

        <StatCard
          title="Total Transactions"
          value={stats.expenseCount.toString()}
          subtitle="Logged in this cycle"
          icon={TrendingUp}
          color="#06b6d4"
        />
      </div>

      {/* Budget Progress & Category Breakdown Charts */}
      <div className="grid-2col">
        {/* Left Column: Budget Progress Card & Monthly Bar Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <BudgetProgressCard />

          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <BarChart3 size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                6-Month Spending vs Budget (Limit: {formatCurrency(stats.budgetLimit)})
              </h3>
            </div>
            <MonthlyBarChart data={monthlyHistory} />
          </div>
        </div>

        {/* Right Column: Recharts Category Breakdown Pie Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <PieIcon size={20} color="var(--accent-secondary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Expenses by Category
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Visual distribution of spending across categories for the active month
            </p>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CategoryPieChart data={stats.categoryData} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Recent Transactions
          </h3>
          <Link to="/expenses" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
            View All & Filter →
          </Link>
        </div>
        <ExpenseTable />
      </div>

      <ExpenseFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={addExpense}
      />
    </div>
  );
};
