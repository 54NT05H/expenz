# 💳 Expenz — Expense Tracker & Budgeting App

A responsive expense tracker with budgeting, built with **React 19**, **Vite**, **Recharts** and an **Express** backend.

> ⚠️ **Portfolio / learning project.** Data is stored in a local SQLite file (backend/data/expenz.db)

## Features

- 🔐 **Authentication:** register, log in and log out using HTTP-only session cookies. Passwords are hashed with **bcrypt**.
- 📊 **Charts:** spending by category (donut chart) and the last 6 months of spending versus your budget (bar chart).
- 💰 **Budget planner:** set a monthly limit, see a live progress bar (on track / approaching / over budget) and per-category usage.
- 🏷️ **Expense management:** add, edit and delete expenses; search by title or notes; filter by category and month.
- 📥 **CSV export** of the expenses currently shown.
- 🔔 **Toast notifications** and inline error messages when something fails.
- 📱 Responsive layout.

## Tech stack

| Area     | Tools                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------- |
| Frontend | React 19, Vite, React Router v7, Recharts, Axios, date-fns, Lucide icons                              |
| Backend  | Node.js, Express, SQLite (better-sqlite3), cookie-parser, cors, bcryptjs, helmet, express-rate-limit  |
| Styling  | Vanilla CSS with custom properties                                                                    |
| Tooling  | ESLint, Prettier, Vitest + Supertest                                                                  |

## Requirements

- **Node.js 20.19+** (or 22.12+). Check with `node -v`.
- npm

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/54NT05H/expenz.git
cd expenz
```

### 2. Start the backend (terminal 1)

```bash
cd backend
npm install
npm run dev
```

The API runs on **http://localhost:5001**. Check it at http://localhost:5001/api/health.

### 3. Start the frontend (terminal 2, from the project root)

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. Requests to `/api` are proxied to the backend by Vite.

### 4. Log in

|          |                    |
| -------- | ------------------ |
| Email    | `demo@fintrack.io` |
| Password | `demo123`          |

You can also click **Quick Demo Login**, or register your own account.

## Configuration

Both `.env` files are optional. The defaults work out of the box.

| File           | Variable            | Default                 | Purpose                                                                          |
| -------------- | ------------------- | ----------------------- | -------------------------------------------------------------------------------- |
| `backend/.env` | `PORT`              | `5001`                  | Backend port (if you change it, update the proxy target in `vite.config.js` too) |
| `backend/.env` | `CLIENT_URL`        | `http://localhost:5173` | Frontend origin allowed by CORS                                                  |
| `.env`         | `VITE_API_BASE_URL` | `/api`                  | API base URL used by the frontend                                                |

Copy the templates with `Copy-Item .env.example .env` (PowerShell) or `cp .env.example .env` (macOS/Linux).

## Scripts

| Command                  | What it does                         |
| ------------------------ | ------------------------------------ |
| `npm run dev`            | Start the frontend dev server        |
| `npm run build`          | Create a production build in `dist/` |
| `npm run preview`        | Preview the production build         |
| `npm run lint`           | Check the code with ESLint           |
| `npm run format`         | Format the code with Prettier        |
| `cd backend && npm test` |  Run the backend tests               |

## Project structure

```text
expenz/
├── backend/
|      ├── package.json
|      ├── vitest.config.js
|      ├── data/                    ← the database file appears here (gitignored)
|      ├── tests/
|      └── src/
|           ├── server.js            # starts listening on a port
|           ├── app.js               # builds the Express app (no listening, so tests can use it)
|           ├── config.js            # reads environment variables
|           ├── db.js                # opens the database and creates the tables
|           ├── seed.js              # demo user and sample expenses
|           ├── middleware/          # auth.js, errorHandler.js
|           ├── routes/              # HTTP layer: auth, expenses, budget
|           ├── models/              # SQL layer: user, session, expense, budget
|           └── utils/               # money.js, validators.js, asyncHandler.js   
└── src/
    ├── api/             # Axios client and API functions (auth, expenses, budget)
    ├── components/      # budget/, charts/, common/, expenses/, layout/
    ├── context/         # Auth, Toast, Filter, Expense and Budget providers
    ├── hooks/           # useFilteredExpenses, useExpenseStats, useExpenseModal
    ├── pages/           # Dashboard, Expenses, Budget, auth pages, 404
    ├── styles/          # Global CSS and design tokens
    └── utils/           # Constants, currency and date helpers, error helper
```

## Known limitations

- There is no automated test suite yet for Frontend.

## License

Released under the [MIT License](LICENSE).
