/**
 * Startup Seed — Seeds essential demo data automatically when server starts
 * with an in-memory MongoDB (no local MongoDB installed).
 *
 * Seeds:
 *  - 1 Admin account  (admin@nourish.demo / Admin@123)
 *  - 1 Donor account  (donor@nourish.demo / Donor@123)
 *  - 1 Receiver NGO   (ngo@nourish.demo   / Ngo@1234)
 *  - 6 Food Categories
 *
 * NOTE: This only runs when no users exist yet (idempotent).
 */

const User = require('../models/User');
const Category = require('../models/Category');

const DEMO_USERS = [
  {
    name: 'Admin (NourishLink)',
    email: 'admin@nourish.demo',
    password: 'Admin@123',
    phone: '9000000001',
    role: 'admin',
    organizationName: 'NourishLink Platform',
    address: 'Platform HQ, Block A',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    status: 'active',
  },
  {
    name: 'Rajesh Kumar (Donor)',
    email: 'donor@nourish.demo',
    password: 'Donor@123',
    phone: '9000000002',
    role: 'donor',
    organizationName: 'Taj Imperial Kitchen',
    address: '14 MG Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    status: 'active',
  },
  {
    name: 'Seema Pandey (NGO)',
    email: 'ngo@nourish.demo',
    password: 'Ngo@1234',
    phone: '9000000003',
    role: 'receiver',
    organizationName: 'Hope Foundation',
    address: 'Dharavi Community Center',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400017',
    status: 'active',
  },
];

const DEMO_CATEGORIES = [
  { name: 'Cooked Meals', description: 'Freshly prepared food like rice, roti, biryani, curry etc.', icon: '🍲', status: 'active' },
  { name: 'Packaged Food', description: 'Sealed biscuits, snacks, canned goods, ready-to-eat packets', icon: '🥫', status: 'active' },
  { name: 'Fruits & Vegetables', description: 'Fresh farm produce, whole fruits, raw vegetables', icon: '🥦', status: 'active' },
  { name: 'Bakery & Bread', description: 'Fresh loaves, buns, pastries, dry cakes', icon: '🥖', status: 'active' },
  { name: 'Dairy & Beverages', description: 'Milk, paneer, curd, packaged juices, buttermilk', icon: '🥛', status: 'active' },
  { name: 'Grains & Pulses', description: 'Rice bags, wheat flour, lentils, chickpeas, dry rations', icon: '🌾', status: 'active' },
];

const runStartupSeed = async () => {
  try {
    // Check if already seeded
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      console.log(`ℹ️  Startup seed skipped: ${existingCount} user(s) already exist in database.`);
      return;
    }

    console.log('🌱 Seeding demo data for in-memory MongoDB...');

    // Seed categories
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany(DEMO_CATEGORIES);
      console.log(`✅ Seeded ${DEMO_CATEGORIES.length} food categories.`);
    }

    // Seed users (passwords auto-hashed by User model pre-save hook)
    for (const userData of DEMO_USERS) {
      const u = new User(userData);
      await u.save();
    }

    console.log('✅ Demo accounts seeded successfully!');
    console.log('   👤 Admin  : admin@nourish.demo  / Admin@123');
    console.log('   🍽️  Donor  : donor@nourish.demo  / Donor@123');
    console.log('   🏥 NGO    : ngo@nourish.demo    / Ngo@1234');
    console.log('   ⚠️  NOTE: In-memory DB — data resets when server restarts!');
  } catch (error) {
    console.error('⚠️  Startup seed warning:', error.message);
    // Non-fatal — server still starts even if seed fails
  }
};

module.exports = runStartupSeed;
