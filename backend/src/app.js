import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import authRoutes from './routes/auth.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import budgetRoutes from './routes/budget.routes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Builds the app but does NOT start listening, so tests can import it.
export const app = express();
app.set('trust proxy', 1); // we're behind Render's proxy

app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Expenz Backend Running Successfully');
});
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Expenz backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budget', budgetRoutes);

// These two must come last.
app.use(notFoundHandler);
app.use(errorHandler);
