import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { db } from '../src/db.js';

// Start every test with empty tables.
beforeEach(() => {
  db.exec('DELETE FROM sessions; DELETE FROM expenses; DELETE FROM budgets; DELETE FROM users;');
});

// Registers a user and returns an "agent": a client that remembers the session cookie.
const loggedInAgent = async (email = 'a@test.com') => {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({ name: 'Test User', email, password: 'secret123' }).expect(201);
  return agent;
};

const payload = { title: 'Lunch', amount: 250.5, category: 'Food & Dining', date: '2026-10-02', notes: 'Thali' };

describe('auth', () => {
  it('registers a user and logs them in', async () => {
    const agent = request.agent(app);
    const res = await agent
      .post('/api/auth/register')
      .send({ name: 'Asha', email: 'asha@test.com', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ name: 'Asha', email: 'asha@test.com' });
    expect(res.body.user.password_hash).toBeUndefined();

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe('asha@test.com');
  });

  it('stores a bcrypt hash, never the password', async () => {
    await loggedInAgent('hash@test.com');
    const row = db.prepare('SELECT password_hash FROM users WHERE email = ?').get('hash@test.com');
    expect(row.password_hash).not.toContain('secret123');
    expect(row.password_hash.startsWith('$2')).toBe(true);
  });

  it('rejects a short password', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'X', email: 'x@test.com', password: '123' });
    expect(res.status).toBe(400);
  });

  it('rejects a duplicate email, ignoring letter case', async () => {
    await loggedInAgent('dup@test.com');
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Other', email: 'DUP@test.com', password: 'secret123' });
    expect(res.status).toBe(409);
  });

  it('rejects a wrong password and accepts the right one', async () => {
    await loggedInAgent('login@test.com');

    const bad = await request(app).post('/api/auth/login').send({ email: 'login@test.com', password: 'wrong-pass' });
    expect(bad.status).toBe(401);

    const good = await request(app).post('/api/auth/login').send({ email: 'login@test.com', password: 'secret123' });
    expect(good.status).toBe(200);
  });

  it('blocks protected routes without a session', async () => {
    expect((await request(app).get('/api/expenses')).status).toBe(401);
    expect((await request(app).get('/api/budget')).status).toBe(401);
  });

  it('logout invalidates the session on the server', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Out', email: 'out@test.com', password: 'secret123' });
    const cookie = res.headers['set-cookie'][0].split(';')[0]; // "sessionId=..."

    await request(app).get('/api/auth/me').set('Cookie', cookie).expect(200);
    await request(app).post('/api/auth/logout').set('Cookie', cookie).expect(200);
    // Even if someone kept the old cookie, it no longer works:
    await request(app).get('/api/auth/me').set('Cookie', cookie).expect(401);
  });
});

describe('expenses', () => {
  it('creates and lists expenses', async () => {
    const agent = await loggedInAgent();

    const created = await agent.post('/api/expenses').send(payload);
    expect(created.status).toBe(201);
    expect(created.body.expense).toMatchObject({ title: 'Lunch', amount: 250.5, date: '2026-10-02' });

    const list = await agent.get('/api/expenses');
    expect(list.body).toHaveLength(1);
    expect(list.body[0].id).toBe(created.body.expense.id);
  });

  it('rejects invalid expenses', async () => {
    const agent = await loggedInAgent();
    const badOnes = [
      { ...payload, amount: -5 },
      { ...payload, title: '   ' },
      { ...payload, date: 'yesterday' },
      { ...payload, date: '2026-02-30' },
    ];
    for (const bad of badOnes) {
      const res = await agent.post('/api/expenses').send(bad);
      expect(res.status).toBe(400);
    }
    expect((await agent.get('/api/expenses')).body).toHaveLength(0);
  });

  it('ignores id and userId sent in an update (the mass-assignment bug)', async () => {
    const agent = await loggedInAgent();
    const { expense } = (await agent.post('/api/expenses').send(payload)).body;

    const res = await agent
      .put(`/api/expenses/${expense.id}`)
      .send({ id: '999', userId: 'someone-else', title: 'Dinner' });

    expect(res.status).toBe(200);
    expect(res.body.expense.id).toBe(expense.id); // id unchanged
    expect(res.body.expense.title).toBe('Dinner'); // allowed field changed

    // Still ours: it didn't get handed to someone else.
    expect((await agent.get('/api/expenses')).body).toHaveLength(1);
  });

  it('rejects an invalid amount on update', async () => {
    const agent = await loggedInAgent();
    const { expense } = (await agent.post('/api/expenses').send(payload)).body;

    const res = await agent.put(`/api/expenses/${expense.id}`).send({ amount: -5 });
    expect(res.status).toBe(400);
  });

  it("does not let one user see or change another user's expenses", async () => {
    const alice = await loggedInAgent('alice@test.com');
    const bob = await loggedInAgent('bob@test.com');
    const { expense } = (await alice.post('/api/expenses').send(payload)).body;

    expect((await bob.get('/api/expenses')).body).toEqual([]);
    expect((await bob.put(`/api/expenses/${expense.id}`).send({ title: 'Hacked' })).status).toBe(404);
    expect((await bob.delete(`/api/expenses/${expense.id}`)).status).toBe(404);

    // Alice's expense is untouched.
    const aliceList = (await alice.get('/api/expenses')).body;
    expect(aliceList).toHaveLength(1);
    expect(aliceList[0].title).toBe('Lunch');
  });

  it('deletes an expense', async () => {
    const agent = await loggedInAgent();
    const { expense } = (await agent.post('/api/expenses').send(payload)).body;

    expect((await agent.delete(`/api/expenses/${expense.id}`)).status).toBe(200);
    expect((await agent.get('/api/expenses')).body).toHaveLength(0);
    expect((await agent.delete(`/api/expenses/${expense.id}`)).status).toBe(404); // already gone
  });

  it('filters by month and by search text', async () => {
    const agent = await loggedInAgent();
    await agent.post('/api/expenses').send({ ...payload, title: 'Coffee', date: '2026-10-05' });
    await agent.post('/api/expenses').send({ ...payload, title: 'Rent', notes: '', date: '2026-09-01' });

    const october = await agent.get('/api/expenses').query({ month: '2026-10' });
    expect(october.body.map((e) => e.title)).toEqual(['Coffee']);

    const search = await agent.get('/api/expenses').query({ search: 'rEnT' }); // case-insensitive
    expect(search.body.map((e) => e.title)).toEqual(['Rent']);
  });
});

describe('budget', () => {
  it('returns null until a budget is set, then saves it', async () => {
    const agent = await loggedInAgent();
    expect((await agent.get('/api/budget')).body.limit).toBeNull();

    await agent.post('/api/budget').send({ limit: 80000 }).expect(200);
    expect((await agent.get('/api/budget')).body.limit).toBe(80000);
  });

  it('rejects a zero or invalid budget', async () => {
    const agent = await loggedInAgent();
    expect((await agent.post('/api/budget').send({ limit: 0 })).status).toBe(400);
    expect((await agent.post('/api/budget').send({ limit: 'lots' })).status).toBe(400);
  });
});