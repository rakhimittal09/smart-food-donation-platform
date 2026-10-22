// Load environment variables from server/.env (explicit path for reliability)
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// ── Startup environment checks ──────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('\n❌ FATAL: JWT_SECRET is not set in server/.env');
  console.error('   Create server/.env using server/.env.example as a template.\n');
  process.exit(1);
}

const app = require('./app');
const connectDB = require('./config/db');
const runStartupSeed = require('./scripts/startupSeed');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, seed demo data, then start server
connectDB().then(async () => {
  // Auto-seed demo accounts when DB is fresh (idempotent — skipped if data exists)
  await runStartupSeed();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔑 JWT_SECRET: [set]`);
    console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
  });
});
