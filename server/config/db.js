const mongoose = require('mongoose');

const connectDB = async () => {
  let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-food-donation';
  
  // Try connecting to the specified URI first
  try {
    console.log(`🔌 Attempting to connect to MongoDB: ${uri}`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000, // Timeout quickly if DB isn't running
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.warn(`⚠️ Could not connect to default MongoDB URI (${uri}): ${error.message}`);
  }

  // Fallback to mongodb-memory-server
  try {
    console.log('🚀 Starting In-Memory MongoDB Server for local testing...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ In-Memory MongoDB Connected Successfully: ${conn.connection.host}`);
    console.log(`👉 Connection string: ${mongoUri}`);
    
    // Save reference to server so it stays alive
    global.__MONGO_MEMORY_SERVER__ = mongoServer;
  } catch (error) {
    console.error(`\n❌ Failed to start In-Memory MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
