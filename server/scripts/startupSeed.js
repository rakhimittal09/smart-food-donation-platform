/**
 * Startup Seed — Seeds essential demo data automatically when server starts
 * with an in-memory MongoDB (no local MongoDB installed).
 *
 * Seeds:
 *  - Admin account      (admin@nourish.demo      / Admin@123 & admin@fooddonation.org / admin123)
 *  - Donor account      (donor@nourish.demo      / Donor@123 & donor@tajkitchen.com   / donor123)
 *  - Receiver NGO       (ngo@nourish.demo        / Ngo@1234  & receiver@feedingindia.org / ngo123)
 *  - Volunteer account  (volunteer@nourish.demo  / Volunteer@123)
 *  - 6 Food Categories
 *  - Sample Food Donations with statuses: Available, Pending, Accepted, Picked Up, Delivered
 *  - Sample Food Requests with statuses: Pending, Accepted, Picked Up, Delivered
 */

const User = require('../models/User');
const Category = require('../models/Category');
const FoodDonation = require('../models/FoodDonation');
const FoodRequest = require('../models/FoodRequest');

const DEMO_USERS = [
  {
    name: 'Priya Sharma (Admin)',
    email: 'admin@nourish.demo',
    password: 'Admin@123',
    phone: '9000000001',
    role: 'admin',
    organizationName: 'NourishLink Platform HQ',
    address: 'Platform HQ, Connaught Place',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    status: 'active',
  },
  {
    name: 'Rajesh Kumar (Donor)',
    email: 'donor@nourish.demo',
    password: 'Donor@123',
    phone: '9000000002',
    role: 'donor',
    organizationName: 'Taj Imperial Kitchen',
    address: '14 MG Road, Marine Drive',
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
    organizationName: 'Hope Foundation Relief',
    address: 'Dharavi Community Center, Sector 3',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400017',
    status: 'active',
  },
  {
    name: 'Kavita Singh (Volunteer)',
    email: 'volunteer@nourish.demo',
    password: 'Volunteer@123',
    phone: '9000000004',
    role: 'volunteer',
    organizationName: 'Green Route Food Rescuers',
    address: '24 Bandra Hill Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    status: 'active',
  },
  // Secondary demo aliases
  {
    name: 'Admin Chief',
    email: 'admin@fooddonation.org',
    password: 'admin123',
    phone: '9876543210',
    role: 'admin',
    organizationName: 'FoodCare Central Command',
    address: 'Plot 42, Green Park Avenue',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    status: 'active',
  },
  {
    name: 'Rajesh Malhotra',
    email: 'donor@tajkitchen.com',
    password: 'donor123',
    phone: '9812345678',
    role: 'donor',
    organizationName: 'Taj Imperial Kitchen & Banquets',
    address: '14 MG Road, Near City Center',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    status: 'active',
  },
  {
    name: 'Ananya Deshmukh',
    email: 'receiver@feedingindia.org',
    password: 'ngo123',
    phone: '9834567890',
    role: 'receiver',
    organizationName: 'Feeding India Community NGO',
    address: 'Sector 5, Community Hall Building',
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
    // 1. Seed categories
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany(DEMO_CATEGORIES);
      console.log(`✅ Seeded ${DEMO_CATEGORIES.length} food categories.`);
    }

    // 2. Seed users
    for (const userData of DEMO_USERS) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        const u = new User(userData);
        await u.save();
      }
    }

    // Fetch primary users for donations and requests
    const donor = await User.findOne({ email: 'donor@nourish.demo' });
    const ngo = await User.findOne({ email: 'ngo@nourish.demo' });
    const volunteer = await User.findOne({ email: 'volunteer@nourish.demo' });

    if (!donor || !ngo || !volunteer) {
      return;
    }

    // 3. Seed Food Donations & Requests if none exist
    const donationCount = await FoodDonation.countDocuments();
    if (donationCount === 0) {
      console.log('🌱 Seeding demo Food Donations with full lifecycle statuses...');
      const today = new Date();
      const expiry1 = new Date(today.getTime() + 14 * 60 * 60 * 1000);
      const expiry2 = new Date(today.getTime() + 48 * 60 * 60 * 1000);
      const expiry3 = new Date(today.getTime() + 72 * 60 * 60 * 1000);

      // Donation 1: Available
      const donAvailable = await FoodDonation.create({
        donor: donor._id,
        foodName: 'Fresh Veg Biryani & Paneer Gravy',
        description: 'Surplus delicious Shahi Paneer with Dum Veg Biryani packed in hygienic food-grade stainless containers.',
        category: 'Cooked Meals',
        quantity: 45,
        unit: 'servings',
        foodType: 'Veg',
        preparationDate: new Date(),
        expiryDate: expiry1,
        pickupDate: today,
        pickupTime: '04:00 PM - 07:00 PM',
        pickupAddress: '14 MG Road, Back Entrance Kitchen, Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        contactName: 'Chef Rajesh',
        contactPhone: '9000000002',
        specialInstructions: 'Please bring clean insulated food containers for smooth transit.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=60',
        status: 'Available',
      });

      // Donation 2: Pending (Requested by NGO, awaiting donor approval)
      const donPending = await FoodDonation.create({
        donor: donor._id,
        foodName: 'Assorted Bakery Breads, Buns & Croissants',
        description: 'Fresh morning bake items from artisan ovens, perfectly good for evening tea or community distribution.',
        category: 'Bakery & Bread',
        quantity: 80,
        unit: 'packets',
        foodType: 'Veg',
        preparationDate: new Date(),
        expiryDate: expiry2,
        pickupDate: today,
        pickupTime: '06:00 PM - 08:30 PM',
        pickupAddress: '14 MG Road, Bakery Counter, Ground Floor',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        contactName: 'Rajesh Kumar',
        contactPhone: '9000000002',
        specialInstructions: 'Packed in ready-to-carry cardboard cartons.',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=60',
        status: 'Pending',
      });

      // Donation 3: Accepted (Donor approved, ready for volunteer pickup)
      const donAccepted = await FoodDonation.create({
        donor: donor._id,
        foodName: 'Fresh Organic Apples & Bananas Crates',
        description: 'High quality surplus farm fresh fruit crates from exhibition catering.',
        category: 'Fruits & Vegetables',
        quantity: 60,
        unit: 'kg',
        foodType: 'Vegan',
        preparationDate: new Date(),
        expiryDate: expiry3,
        pickupDate: today,
        pickupTime: '03:00 PM - 06:00 PM',
        pickupAddress: '14 MG Road, Warehouse Section C',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        contactName: 'Rajesh Kumar',
        contactPhone: '9000000002',
        image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=60',
        status: 'Accepted',
      });

      // Donation 4: Picked Up (In Transit with Volunteer)
      const donPickedUp = await FoodDonation.create({
        donor: donor._id,
        foodName: 'Sealed Whole Wheat Atta & Rice Bags',
        description: 'Unopened manufacturer-sealed 10kg bags of premium long grain basmati rice and flour.',
        category: 'Grains & Pulses',
        quantity: 100,
        unit: 'kg',
        foodType: 'Vegan',
        preparationDate: new Date(),
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        pickupDate: today,
        pickupTime: '01:00 PM - 04:00 PM',
        pickupAddress: '14 MG Road, Dispatch Gate 1',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        contactName: 'Chef Rajesh',
        contactPhone: '9000000002',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=60',
        status: 'Picked Up',
      });

      // Donation 5: Delivered (Completed handover to beneficiaries)
      const donDelivered = await FoodDonation.create({
        donor: donor._id,
        foodName: 'Chana Masala & Jeera Rice Lunch Packs',
        description: 'Single-serve sealed hot meal boxes prepared by professional chefs. Distributed hot.',
        category: 'Cooked Meals',
        quantity: 50,
        unit: 'boxes',
        foodType: 'Veg',
        preparationDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 8 * 60 * 60 * 1000),
        pickupDate: today,
        pickupTime: '12:00 PM - 02:30 PM',
        pickupAddress: '14 MG Road, Kitchen Counter',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        contactName: 'Chef Rajesh',
        contactPhone: '9000000002',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=60',
        status: 'Delivered',
      });

      console.log('🌱 Seeding demo Food Requests (Pending, Accepted, Picked Up, Delivered)...');

      // Request 1: Pending Order
      await FoodRequest.create({
        donation: donPending._id,
        receiver: ngo._id,
        requestedQuantity: 50,
        message: 'We will distribute these bakery items to the local shelter home during evening snack outreach.',
        status: 'Pending',
        requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        pickupDetails: {
          scheduledDate: today,
          scheduledTime: '06:30 PM',
          pickupPersonName: 'Field Team',
          pickupPersonPhone: '9000000003',
          timeline: [
            {
              status: 'Pending',
              title: 'Pickup Requested',
              description: 'Hope Foundation requested 50 packets of bakery items.',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              updatedBy: ngo._id,
            },
          ],
        },
      });

      // Request 2: Accepted Order (Ready for Volunteer Pickup)
      await FoodRequest.create({
        donation: donAccepted._id,
        receiver: ngo._id,
        requestedQuantity: 60,
        message: 'Fresh fruits will be served to children in our daily community center program.',
        status: 'Accepted',
        requestedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        pickupDetails: {
          scheduledDate: today,
          scheduledTime: '03:30 PM',
          pickupPersonName: '',
          pickupPersonPhone: '',
          timeline: [
            {
              status: 'Pending',
              title: 'Pickup Requested',
              description: 'Requested 60 kg fresh fruits.',
              timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
              updatedBy: ngo._id,
            },
            {
              status: 'Accepted',
              title: 'Pickup Approved',
              description: 'Donor accepted pickup request. Ready for volunteer claim.',
              timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
              updatedBy: donor._id,
            },
          ],
        },
      });

      // Request 3: Picked Up Order (Assigned to Volunteer, In Transit)
      await FoodRequest.create({
        donation: donPickedUp._id,
        receiver: ngo._id,
        volunteer: volunteer._id,
        requestedQuantity: 100,
        message: 'Dry rations to be stocked at community kitchen pantry.',
        status: 'Picked Up',
        requestedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        pickupDetails: {
          scheduledDate: today,
          scheduledTime: '01:30 PM',
          pickupPersonName: volunteer.name,
          pickupPersonPhone: volunteer.phone,
          vehicleNumber: 'MH-01-AB-1234',
          notes: 'Volunteer van en route to Dharavi distribution center',
          timeline: [
            {
              status: 'Pending',
              title: 'Pickup Requested',
              description: 'Requested 100 kg dry rations',
              timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
              updatedBy: ngo._id,
            },
            {
              status: 'Accepted',
              title: 'Pickup Accepted',
              description: 'Donor approved collection',
              timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
              updatedBy: donor._id,
            },
            {
              status: 'Picked Up',
              title: 'Food Picked Up',
              description: `Volunteer ${volunteer.name} collected items and is in transit.`,
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
              updatedBy: volunteer._id,
            },
          ],
        },
      });

      // Request 4: Delivered Order (Completed Order assigned to volunteer)
      await FoodRequest.create({
        donation: donDelivered._id,
        receiver: ngo._id,
        volunteer: volunteer._id,
        requestedQuantity: 50,
        message: 'Distributed directly to daily wage workers and homeless families.',
        status: 'Delivered',
        requestedAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        pickupDetails: {
          scheduledDate: today,
          scheduledTime: '12:30 PM',
          pickupPersonName: volunteer.name,
          pickupPersonPhone: volunteer.phone,
          vehicleNumber: 'MH-01-AB-1234',
          notes: 'Delivered hot and on schedule.',
          timeline: [
            {
              status: 'Pending',
              title: 'Pickup Requested',
              description: 'Requested 50 hot meal boxes',
              timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
              updatedBy: ngo._id,
            },
            {
              status: 'Accepted',
              title: 'Pickup Accepted',
              description: 'Donor approved collection',
              timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
              updatedBy: donor._id,
            },
            {
              status: 'Picked Up',
              title: 'Food Picked Up',
              description: `Volunteer ${volunteer.name} loaded food packages.`,
              timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
              updatedBy: volunteer._id,
            },
            {
              status: 'Delivered',
              title: 'Food Delivered',
              description: `Meals successfully delivered to community beneficiaries.`,
              timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
              updatedBy: volunteer._id,
            },
          ],
        },
      });

      console.log('✅ Demo food donations & requests seeded with Pending, Accepted, Picked Up, Delivered statuses!');
    }

    console.log('✅ Demo accounts ready:');
    console.log('   👑 Admin     : admin@nourish.demo     / Admin@123');
    console.log('   🍱 Donor     : donor@nourish.demo     / Donor@123');
    console.log('   🤝 NGO       : ngo@nourish.demo       / Ngo@1234');
    console.log('   🚚 Volunteer : volunteer@nourish.demo / Volunteer@123');
  } catch (error) {
    console.error('⚠️  Startup seed warning:', error.message);
  }
};

module.exports = runStartupSeed;
