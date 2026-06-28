// Load environment variables before any other module imports
require('dotenv').config();

const config = require('./src/config/env');
const connectDB = require('./src/config/db');
const app = require('./src/app');
const { startOverdueChecker } = require('./src/jobs/overdue.job');

const PORT = config.port;

// Connect to Database
connectDB().then(() => {
  // Register automated cron jobs
  startOverdueChecker();

  // Start HTTP Server
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections outside Express context
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Fatal Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
});
