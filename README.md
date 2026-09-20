# 💳 Expenz — Smart Expense Tracker & Budgeting App

A modern, responsive, and feature-packed **Expense Tracker with Budgeting** frontend application built using **React 19**, **Vite**, **Recharts**, and **Vanilla CSS**.

---

## 🌟 Key Features

- 🔐 **Authentication Ready:** Integrated for JWT authentication with HTTP-only cookies and bcrypt-secured backend endpoints.
- ⚡ **Instant Demo Mode:** One-click demo login to test full functionality without waiting for a backend connection.
- 📊 **Interactive Recharts Visualizations:**
  - **Expenses by Category:** Interactive donut/pie chart with custom tooltips and legend.
  - **Monthly Comparison:** 6-month spending vs budget limit bar chart.
- 💰 **Budget Planner & Limits:**
  - Dynamic monthly budget cap adjuster (`+₹5k`, `-₹5k`, custom modal).
  - Real-time budget progress bar with warning states (On Track, Approaching, Over Budget).
  - 50/30/20 smart financial budgeting guidance.
- 🏷️ **Expense Management:**
  - Add expenses with title, category, date, amount (₹), and optional notes.
  - Search by keywords across titles and notes.
  - Filter by category and cycle month.
  - Instant transaction deletion.
  - 📥 **CSV Export:** One-click export of all filtered expenses to a CSV file.
- 🎨 **Lightweight & Catchy UI:**
  - Clean fintech aesthetic with crisp borders, soft shadows, and vibrant electric indigo/cyan gradients.
  - 📱 Fully responsive across desktop, tablet, and mobile screens.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router v7
- **Charts:** Recharts
- **HTTP Client:** Axios (with `withCredentials: true` for HTTP-only cookies)
- **Icons:** Lucide React
- **Date Utilities:** date-fns
- **Styling:** Modern Vanilla CSS with CSS Custom Properties

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
https://github.com/54NT05H/expenz.git
cd Expenz
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for production
```bash
npm run build
```

---

## 📂 Project Structure

```text
src/
├── api/             # Axios client & modular API endpoints (Auth, Expenses, Budget)
├── components/      # UI Components
│   ├── budget/      # Budget progress cards & limit setting modals
│   ├── charts/      # Recharts Pie & Bar charts
│   ├── common/      # StatCards, Modals, Badges
│   ├── expenses/    # Expense forms, tables, filters
│   └── layout/      # Navbar, Sidebar, ProtectedRoute, DashboardLayout
├── context/         # AuthContext & ExpenseContext state providers
├── pages/           # DashboardPage, ExpensesPage, BudgetPage, Auth pages
├── styles/          # Design system & CSS custom properties
└── utils/           # Formatters, constants, and date helpers
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
