const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-food-donation';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Failed: ${error.message}`);
    console.error(`👉 Make sure your MongoDB service is running, or specify a valid MONGO_URI in server/.env (e.g. MongoDB Atlas cloud cluster).`);
    console.error(`👉 To start local MongoDB on Windows, open terminal and run: "net start MongoDB" or "mongod"\n`);
    process.exit(1);
  }
};

module.exports = connectDB;
