import { config } from './config.js';
import { app } from './app.js';
import { seedDemoData } from './seed.js';
import { deleteExpiredSessions } from './models/sessionModel.js';

seedDemoData();
deleteExpiredSessions();
setInterval(deleteExpiredSessions, 60 * 60 * 1000).unref(); // tidy up hourly

app.listen(config.port, () => {
  console.log(`Server running on ${config.port}`);
});