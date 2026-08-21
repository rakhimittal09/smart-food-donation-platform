require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const Category = require('../models/Category');
const FoodDonation = require('../models/FoodDonation');
const FoodRequest = require('../models/FoodRequest');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-food-donation';
    console.log(`🌱 Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected. Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Role.deleteMany({}),
      Category.deleteMany({}),
      FoodDonation.deleteMany({}),
      FoodRequest.deleteMany({}),
      ActivityLog.deleteMany({}),
      Notification.deleteMany({}),
      Setting.deleteMany({}),
    ]);

    console.log('🧹 Existing data wiped.');

    // 1. Create Roles
    console.log('📌 Seeding Roles...');
    const roles = await Role.insertMany([
      {
        name: 'donor',
        displayName: 'Food Donor',
        description: 'Individuals, restaurants, hotels, and businesses sharing surplus food.',
        permissions: ['create_donation', 'edit_donation', 'manage_requests', 'view_history'],
      },
      {
        name: 'receiver',
        displayName: 'NGO / Food Receiver',
        description: 'Non-profit organizations, charities, and community distribution networks.',
        permissions: ['browse_donations', 'request_food', 'track_pickup', 'view_history'],
      },
      {
        name: 'admin',
        displayName: 'Platform Administrator',
        description: 'System admin with full oversight, moderation, reports, and settings.',
        permissions: ['manage_users', 'manage_donations', 'manage_categories', 'view_reports', 'manage_settings'],
      },
    ]);

    // 2. Create Categories
    console.log('📌 Seeding Categories...');
    const categories = await Category.insertMany([
      { name: 'Cooked Meals', description: 'Freshly prepared rice, curries, roti, biryani, pasta etc.', icon: '🍲', status: 'active' },
      { name: 'Packaged Food', description: 'Sealed snacks, biscuits, canned goods, ready-to-eat packets', icon: '🥫', status: 'active' },
      { name: 'Fruits & Vegetables', description: 'Fresh farm produce, whole fruits, raw vegetables', icon: '🥦', status: 'active' },
      { name: 'Bakery & Bread', description: 'Fresh loaves, buns, croissants, dry cakes, pastries', icon: '🥖', status: 'active' },
      { name: 'Dairy & Beverages', description: 'Milk packets, paneer, curd, packaged juices, buttermilk', icon: '🥛', status: 'active' },
      { name: 'Grains & Pulses', description: 'Rice bags, wheat flour, lentils, chickpeas, dry rations', icon: '🌾', status: 'active' },
    ]);

    // 3. Create Users
    console.log('📌 Seeding Users...');
    // Note: Plain password is automatically hashed via userSchema.pre('save')
    const adminUser = new User({
      name: 'Priya Sharma (Admin)',
      email: 'admin@fooddonation.org',
      password: 'admin123',
      phone: '9876543210',
      role: 'admin',
      organizationName: 'FoodCare Central Command',
      address: 'Plot 42, Green Park Avenue',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110016',
      status: 'active',
    });
    await adminUser.save();

    const donor1 = new User({
      name: 'Rajesh Malhotra',
      email: 'donor@tajkitchen.com',
      password: 'donor123',
      phone: '9812345678',
      role: 'donor',
      organizationName: 'Taj Imperial Kitchen & Banquets',
      address: '14 MG Road, Near City Center',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      status: 'active',
    });
    await donor1.save();

    const donor2 = new User({
      name: 'Sunil Grover',
      email: 'sharma.caterers@gmail.com',
      password: 'donor123',
      phone: '9823456789',
      role: 'donor',
      organizationName: 'Sharma Gourmet Catering',
      address: '88 Link Road, Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
      status: 'active',
    });
    await donor2.save();

    const receiver1 = new User({
      name: 'Ananya Deshmukh',
      email: 'hope.foundation@ngo.org',
      password: 'receiver123',
      phone: '9834567890',
      role: 'receiver',
      organizationName: 'Hope For All Food Relief NGO',
      address: 'Sector 5, Community Hall Building',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110025',
      status: 'active',
    });
    await receiver1.save();

    const receiver2 = new User({
      name: 'Vikram Mehta',
      email: 'annadaan.trust@ngo.org',
      password: 'receiver123',
      phone: '9845678901',
      role: 'receiver',
      organizationName: 'Annadaan Seva Trust',
      address: '22 Bandra Reclamation',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      status: 'active',
    });
    await receiver2.save();

    // 4. Create Food Donations
    console.log('📌 Seeding Food Donations...');
    const today = new Date();
    
    // Future dates
    const expiry1 = new Date(today);
    expiry1.setHours(today.getHours() + 12);

    const expiry2 = new Date(today);
    expiry2.setDate(today.getDate() + 2);

    const expiry3 = new Date(today);
    expiry3.setDate(today.getDate() + 3);

    const expiry4 = new Date(today);
    expiry4.setHours(today.getHours() + 8);

    const donations = await FoodDonation.insertMany([
      {
        donor: donor1._id,
        foodName: 'Fresh Veg Biryani & Paneer Gravy',
        description: 'Surplus delicious Shahi Paneer with Dum Veg Biryani prepared for a corporate event. Packed in hygienic food-grade stainless containers.',
        category: 'Cooked Meals',
        quantity: 45,
        unit: 'servings',
        foodType: 'Veg',
        preparationDate: new Date(),
        expiryDate: expiry1,
        pickupDate: today,
        pickupTime: '04:00 PM - 07:00 PM',
        pickupAddress: '14 MG Road, Back Entrance Kitchen, Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        contactName: 'Chef Rajesh',
        contactPhone: '9812345678',
        specialInstructions: 'Please bring clean insulated food containers for smooth transit.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=60',
        status: 'Available',
      },
      {
        donor: donor1._id,
        foodName: 'Assorted Bakery Breads, Buns & Croissants',
        description: 'Fresh morning bake items from artisan ovens, perfectly good for evening tea or community dinner distribution.',
        category: 'Bakery & Bread',
        quantity: 80,
        unit: 'packets',
        foodType: 'Veg',
        preparationDate: new Date(),
        expiryDate: expiry2,
        pickupDate: today,
        pickupTime: '06:00 PM - 09:00 PM',
        pickupAddress: '14 MG Road, Ground Floor Bakery Counter',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        contactName: 'Rajesh Malhotra',
        contactPhone: '9812345678',
        specialInstructions: 'Ready-to-carry cardboard cartons.',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=60',
        status: 'Pending',
      },
      {
        donor: donor2._id,
        foodName: 'Fresh Organic Apples & Bananas Crates',
        description: 'High quality surplus farm fresh fruit crates from exhibition catering. Rich in vitamins and ready for immediate consumption.',
        category: 'Fruits & Vegetables',
        quantity: 60,
        unit: 'kg',
        foodType: 'Vegan',
        preparationDate: new Date(),
        expiryDate: expiry3,
        pickupDate: today,
        pickupTime: '02:00 PM - 06:00 PM',
        pickupAddress: '88 Link Road, Andheri West Warehouse',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053',
        contactName: 'Sunil Grover',
        contactPhone: '9823456789',
        specialInstructions: 'Please bring a mini-van or auto for easy transport.',
        image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=60',
        status: 'Accepted',
      },
      {
        donor: donor2._id,
        foodName: 'Sealed Whole Wheat Atta & Basmati Rice Bags',
        description: 'Unopened manufacturer-sealed 10kg bags of premium long grain basmati rice and premium flour.',
        category: 'Grains & Pulses',
        quantity: 120,
        unit: 'kg',
        foodType: 'Vegan',
        preparationDate: new Date(),
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        pickupDate: today,
        pickupTime: '10:00 AM - 05:00 PM',
        pickupAddress: '88 Link Road, Andheri West Storage Room #3',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053',
        contactName: 'Sunil Grover',
        contactPhone: '9823456789',
        specialInstructions: 'Heavy lifting assistance available on site.',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=60',
        status: 'Available',
      },
      {
        donor: donor1._id,
        foodName: 'Chana Masala & Jeera Rice Lunch Packs',
        description: 'Single-serve sealed meal boxes prepared by professional chefs. Steam packed and hot.',
        category: 'Cooked Meals',
        quantity: 50,
        unit: 'boxes',
        foodType: 'Veg',
        preparationDate: new Date(),
        expiryDate: expiry4,
        pickupDate: today,
        pickupTime: '01:00 PM - 03:30 PM',
        pickupAddress: '14 MG Road, Dispatch Bay 2',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        contactName: 'Chef Rajesh',
        contactPhone: '9812345678',
        specialInstructions: 'Ready for direct handover to individuals.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=60',
        status: 'Delivered',
      },
    ]);

    // 5. Create Food Requests & Pickup Timelines
    console.log('📌 Seeding Food Requests & Pickup Tracking...');
    const req1 = await FoodRequest.create({
      donation: donations[1]._id,
      receiver: receiver1._id,
      requestedQuantity: 50,
      message: 'We will distribute these bakery items to the local shelter home during evening snack time.',
      status: 'Pending',
      requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      pickupDetails: {
        scheduledDate: today,
        scheduledTime: '06:30 PM',
        pickupPersonName: 'Kavita Singh (Field Volunteer)',
        pickupPersonPhone: '9834567899',
        vehicleNumber: 'DL-01-AB-1234',
        notes: 'Volunteer van will reach dispatch counter at 6:30 PM',
        timeline: [
          {
            status: 'Pending',
            title: 'Pickup Requested',
            description: 'NGO submitted request for 50 packets of bakery items.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            updatedBy: receiver1._id,
          },
        ],
      },
    });

    const req2 = await FoodRequest.create({
      donation: donations[2]._id,
      receiver: receiver2._id,
      requestedQuantity: 60,
      message: 'Fresh fruits will be served to children in our daily nourishment outreach in Dharavi.',
      status: 'Accepted',
      requestedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      pickupDetails: {
        scheduledDate: today,
        scheduledTime: '03:30 PM',
        pickupPersonName: 'Ramesh Kadam (Driver)',
        pickupPersonPhone: '9845678999',
        vehicleNumber: 'MH-02-XY-9876',
        notes: 'Electric mini tempo booked for transport.',
        timeline: [
          {
            status: 'Pending',
            title: 'Pickup Requested',
            description: 'Requested 60 kg fresh fruit crates.',
            timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
            updatedBy: receiver2._id,
          },
          {
            status: 'Accepted',
            title: 'Pickup Accepted',
            description: 'Donor accepted pickup for today afternoon.',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            updatedBy: donor2._id,
          },
        ],
      },
    });

    const req3 = await FoodRequest.create({
      donation: donations[4]._id,
      receiver: receiver1._id,
      requestedQuantity: 50,
      message: 'Distributed directly to daily wage workers and homeless families near Old Delhi station.',
      status: 'Delivered',
      requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
      pickupDetails: {
        scheduledDate: today,
        scheduledTime: '02:00 PM',
        pickupPersonName: 'Ananya Deshmukh',
        pickupPersonPhone: '9834567890',
        vehicleNumber: 'DL-03-CD-5678',
        notes: 'All 50 boxes received hot and distributed within 1 hour.',
        timeline: [
          {
            status: 'Pending',
            title: 'Pickup Requested',
            description: 'Requested 50 lunch boxes',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            updatedBy: receiver1._id,
          },
          {
            status: 'Accepted',
            title: 'Pickup Accepted',
            description: 'Donor accepted immediate handover',
            timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
            updatedBy: donor1._id,
          },
          {
            status: 'Picked Up',
            title: 'Food Picked Up',
            description: 'NGO collected 50 meal packs from the donor kitchen',
            timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
            updatedBy: receiver1._id,
          },
          {
            status: 'Delivered',
            title: 'Food Delivered',
            description: '50 meal packs delivered to beneficiaries',
            timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000),
            updatedBy: donor1._id,
          },
        ],
      },
    });

    // 6. Create Notifications
    console.log('📌 Seeding Notifications...');
    await Notification.insertMany([
      {
        user: donor1._id,
        title: 'New Food Request Received',
        message: 'Hope For All Food Relief NGO requested 50 packets of Assorted Bakery Breads.',
        type: 'info',
        isRead: false,
        link: '/requests',
      },
      {
        user: receiver2._id,
        title: 'Pickup Request Accepted',
        message: 'Your request for Fresh Organic Apples & Bananas Crates was accepted by Sharma Gourmet Catering.',
        type: 'success',
        isRead: false,
        link: `/pickup-tracking/${req2._id}`,
      },
      {
        user: adminUser._id,
        title: 'Platform Milestone Reached',
        message: 'Over 200+ meals successfully rescued and redistributed this week!',
        type: 'success',
        isRead: true,
        link: '/admin/reports',
      },
    ]);

    // 7. Create Activity Logs
    console.log('📌 Seeding Activity Logs...');
    await ActivityLog.insertMany([
      {
        user: donor1._id,
        action: 'DONATION_CREATED',
        description: 'Created food donation: Fresh Veg Biryani & Paneer Gravy (45 servings)',
        module: 'DONATION',
      },
      {
        user: receiver1._id,
        action: 'REQUEST_CREATED',
        description: 'Requested 50 packets of "Assorted Bakery Breads, Buns & Croissants"',
        module: 'REQUEST',
      },
      {
        user: donor2._id,
        action: 'PICKUP_ACCEPTED',
        description: 'Accepted pickup request for "Fresh Organic Apples & Bananas Crates"',
        module: 'PICKUP',
      },
      {
        user: adminUser._id,
        action: 'ADMIN_CATEGORY_CREATED',
        description: 'Added category "Cooked Meals"',
        module: 'CATEGORY',
      },
    ]);

    // 8. Create Platform Settings
    console.log('📌 Seeding Settings...');
    await Setting.insertMany([
      {
        key: 'platform_name',
        value: 'Smart Food Donation Platform',
        description: 'Application branding name',
      },
      {
        key: 'auto_expire_hours',
        value: 24,
        description: 'Hours after listed expiry when status automatically flips to Expired',
      },
      {
        key: 'contact_support_email',
        value: 'support@fooddonation.org',
        description: 'Official support address',
      },
      {
        key: 'emergency_helpline',
        value: '+91 1800-FOOD-CARE',
        description: 'Toll-free emergency helpline number',
      },
    ]);

    console.log('🎉 Database Seeding Completed Successfully!');
    console.log('--------------------------------------------------');
    console.log('🔑 DEMO LOGIN CREDENTIALS:');
    console.log('   Admin:    admin@fooddonation.org / admin123');
    console.log('   Donor 1:  donor@tajkitchen.com   / donor123');
    console.log('   Donor 2:  sharma.caterers@gmail.com / donor123');
    console.log('   NGO 1:    hope.foundation@ngo.org / receiver123');
    console.log('   NGO 2:    annadaan.trust@ngo.org  / receiver123');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
