require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const http = require('http');
const app = require('../app');

// Models
const User = require('../models/User');
const Role = require('../models/Role');
const Category = require('../models/Category');
const FoodDonation = require('../models/FoodDonation');
const FoodRequest = require('../models/FoodRequest');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const Setting = require('../models/Setting');

const PORT = 5099;
let server;
let baseUrl = `http://localhost:${PORT}/api`;

const results = [];

function recordTest(name, passed, details = '') {
  results.push({ name, passed, details });
  console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name} ${details ? '(' + details + ')' : ''}`);
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return { status: res.status, data };
}

async function runAllTests() {
  console.log('🚀 Starting Smart Food Donation Platform Full Test Suite...\n');
  
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-food-donation';
  await mongoose.connect(mongoUri);
  
  server = app.listen(PORT);
  await new Promise((r) => setTimeout(r, 600));

  try {
    // -------------------------------------------------------------
    // TEST 1: CRITICAL SECURITY - Admin registration attempt rejection
    // -------------------------------------------------------------
    const adminRegRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Attacker User',
        email: 'attacker_admin@exploit.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        phone: '9876543210',
        role: 'admin',
      },
    });

    recordTest(
      'Security: Reject Public Admin Registration Role Escalation',
      adminRegRes.status === 400 && adminRegRes.data.success === false,
      `Status: ${adminRegRes.status}, Message: ${adminRegRes.data?.message}`
    );

    // -------------------------------------------------------------
    // TEST 2: Register valid Donor
    // -------------------------------------------------------------
    const donorEmail = `donor_${Date.now()}@kitchen.com`;
    const donorRegRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Taj Banquet Kitchen',
        email: donorEmail,
        password: 'Password123',
        confirmPassword: 'Password123',
        phone: '9812345678',
        role: 'donor',
        organizationName: 'Taj Luxury Banquets',
        address: '12 Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
    });

    const donorToken = donorRegRes.data?.token;
    const donorId = donorRegRes.data?.data?._id;
    recordTest(
      'Auth: Register Valid Food Donor',
      donorRegRes.status === 201 && !!donorToken && donorRegRes.data.data.role === 'donor',
      `Role: ${donorRegRes.data?.data?.role}`
    );

    // -------------------------------------------------------------
    // TEST 3: Register valid Receiver NGO
    // -------------------------------------------------------------
    const receiverEmail = `receiver_${Date.now()}@ngo.org`;
    const receiverRegRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Robin Hood Relief Foundation',
        email: receiverEmail,
        password: 'Password123',
        confirmPassword: 'Password123',
        phone: '9823456789',
        role: 'receiver',
        organizationName: 'Robin Hood Relief Foundation',
        address: '44 Saket Community Center',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110017',
      },
    });

    const receiverToken = receiverRegRes.data?.token;
    const receiverId = receiverRegRes.data?.data?._id;
    recordTest(
      'Auth: Register Valid Food Receiver / NGO',
      receiverRegRes.status === 201 && !!receiverToken && receiverRegRes.data.data.role === 'receiver',
      `Role: ${receiverRegRes.data?.data?.role}`
    );

    // -------------------------------------------------------------
    // TEST 4: Login & Authentication
    // -------------------------------------------------------------
    const loginOk = await request('/auth/login', {
      method: 'POST',
      body: { email: donorEmail, password: 'Password123' },
    });
    recordTest('Auth: Successful Login with Valid Credentials', loginOk.status === 200 && !!loginOk.data.token);

    const loginFail = await request('/auth/login', {
      method: 'POST',
      body: { email: donorEmail, password: 'WrongPassword999' },
    });
    recordTest('Auth: Reject Wrong Password', loginFail.status === 401 && loginFail.data.success === false);

    // -------------------------------------------------------------
    // TEST 5: Profile & Password Management
    // -------------------------------------------------------------
    const profileRes = await request('/users/profile', {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    recordTest('Profile: Fetch User Profile', profileRes.status === 200 && profileRes.data.data.email === donorEmail);

    const updateProfileRes = await request('/users/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${donorToken}` },
      body: { organizationName: 'Taj Imperial Palace Kitchen' },
    });
    recordTest('Profile: Update Profile Information', updateProfileRes.status === 200 && updateProfileRes.data.data.organizationName === 'Taj Imperial Palace Kitchen');

    // -------------------------------------------------------------
    // TEST 6: Food Donation CRUD by Donor
    // -------------------------------------------------------------
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);

    const createDonationRes = await request('/donations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${donorToken}` },
      body: {
        foodName: 'Fresh Paneer Butter Masala & Rice Meals',
        description: 'Nutritious freshly prepared meals in hygienic containers.',
        category: 'Cooked Meals',
        quantity: 50,
        unit: 'meals',
        foodType: 'Veg',
        preparationDate: new Date().toISOString(),
        expiryDate: tomorrow.toISOString(),
        pickupDate: new Date().toISOString(),
        pickupTime: '05:00 PM - 08:00 PM',
        pickupAddress: 'Taj Kitchen, 12 Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
    });

    const donationId = createDonationRes.data?.data?._id;
    recordTest(
      'Donation CRUD: Donor Creates New Food Donation',
      createDonationRes.status === 201 && !!donationId,
      `ID: ${donationId}`
    );

    // Verify rejection if receiver attempts to create donation
    const receiverDonationRes = await request('/donations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${receiverToken}` },
      body: {
        foodName: 'Unauthorized Listing',
        description: 'Test',
        category: 'Cooked Meals',
        quantity: 10,
        unit: 'meals',
        foodType: 'Veg',
        expiryDate: tomorrow.toISOString(),
        pickupDate: new Date().toISOString(),
        pickupTime: '12:00 PM',
        pickupAddress: 'Test',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
    });
    recordTest(
      'RBAC: Receiver Blocked from Creating Donation Listings',
      receiverDonationRes.status === 403,
      `Status: ${receiverDonationRes.status}`
    );

    // -------------------------------------------------------------
    // TEST 7: Search & Filtering
    // -------------------------------------------------------------
    const searchRes = await request('/donations?search=Paneer&category=Cooked Meals&city=Delhi');
    recordTest(
      'Search & Filtering: Query Donations with Filters',
      searchRes.status === 200 && searchRes.data.data.length > 0,
      `Found: ${searchRes.data?.data?.length} items`
    );

    // -------------------------------------------------------------
    // TEST 8: Food Request Flow by Receiver
    // -------------------------------------------------------------
    // 1. Negative Test: Requesting more than available
    const excessReqRes = await request('/requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${receiverToken}` },
      body: {
        donationId,
        requestedQuantity: 999,
        message: 'Requesting more than is available.',
      },
    });
    recordTest(
      'Request Validation: Reject Quantity Exceeding Available Stock',
      excessReqRes.status === 400 && excessReqRes.data.success === false,
      `Status: ${excessReqRes.status}`
    );

    // 2. Valid Request
    const validReqRes = await request('/requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${receiverToken}` },
      body: {
        donationId,
        requestedQuantity: 30,
        message: 'Distributing to shelter home at Saket.',
        pickupPersonName: 'Sunil Driver',
        pickupPersonPhone: '9811122233',
        vehicleNumber: 'DL 01 AB 7788',
      },
    });

    const requestId = validReqRes.data?.data?._id;
    const pickupOtp = validReqRes.data?.data?.pickupDetails?.otp;
    recordTest(
      'Food Request: Receiver Submits Food Request & Generates OTP',
      validReqRes.status === 201 && !!requestId && !!pickupOtp,
      `Request ID: ${requestId}, OTP: ${pickupOtp}`
    );

    // -------------------------------------------------------------
    // TEST 9: Donor Approves Request & Schedules Pickup
    // -------------------------------------------------------------
    const approveRes = await request(`/requests/${requestId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${donorToken}` },
      body: { status: 'Approved' },
    });
    recordTest(
      'Workflow: Donor Approves Food Request',
      approveRes.status === 200 && approveRes.data.data.status === 'Approved',
      `Status: ${approveRes.data?.data?.status}`
    );

    const scheduleRes = await request(`/requests/${requestId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${donorToken}` },
      body: { status: 'Pickup Scheduled' },
    });
    recordTest(
      'Workflow: Donor Sets Status to Pickup Scheduled',
      scheduleRes.status === 200 && scheduleRes.data.data.status === 'Pickup Scheduled'
    );

    // Receiver marks Out for Pickup
    const outForPickupRes = await request(`/requests/${requestId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${receiverToken}` },
      body: { status: 'Out for Pickup' },
    });
    recordTest(
      'Workflow: Receiver Marks Volunteer Out for Pickup',
      outForPickupRes.status === 200 && outForPickupRes.data.data.status === 'Out for Pickup'
    );

    // -------------------------------------------------------------
    // TEST 10: Handover Completion with OTP
    // -------------------------------------------------------------
    // 1. Negative Test: Wrong OTP
    const wrongOtpRes = await request(`/requests/${requestId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${donorToken}` },
      body: { status: 'Completed', otp: '0000' },
    });
    recordTest(
      'Security / OTP: Reject Food Handover with Incorrect OTP PIN',
      wrongOtpRes.status === 400 && wrongOtpRes.data.success === false,
      `Message: ${wrongOtpRes.data?.message}`
    );

    // 2. Positive Test: Correct OTP
    const correctOtpRes = await request(`/requests/${requestId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${donorToken}` },
      body: { status: 'Completed', otp: pickupOtp },
    });
    recordTest(
      'Workflow / OTP: Verify Correct OTP & Successfully Complete Handover',
      correctOtpRes.status === 200 && correctOtpRes.data.data.status === 'Completed',
      `Status: ${correctOtpRes.data?.data?.status}`
    );

    // -------------------------------------------------------------
    // TEST 11: Admin Management & Role Protection
    // -------------------------------------------------------------
    // Ensure an admin user exists
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = new User({
        name: 'System Admin',
        email: 'system_admin@fooddonation.org',
        password: 'AdminPassword123',
        phone: '9999999999',
        role: 'admin',
        organizationName: 'Central Admin',
      });
      await adminUser.save();
    }

    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: adminUser.email, password: 'AdminPassword123' },
    });
    // If password mismatch due to pre-existing hash, generate direct token
    const jwt = require('jsonwebtoken');
    const adminToken = adminLoginRes.data?.token || jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Negative RBAC: Donor accessing admin endpoints
    const donorAdminAccessRes = await request('/admin/users', {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    recordTest(
      'RBAC: Donor Denied Access to Admin API (403)',
      donorAdminAccessRes.status === 403,
      `Status: ${donorAdminAccessRes.status}`
    );

    // Admin Users Directory
    const adminUsersRes = await request('/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    recordTest(
      'Admin: List & Filter User Directory',
      adminUsersRes.status === 200 && adminUsersRes.data.data.length > 0,
      `Total Users: ${adminUsersRes.data?.pagination?.totalItems}`
    );

    // Admin Reports & Analytics
    const adminReportsRes = await request('/admin/reports', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    recordTest(
      'Admin: Generate Real-Time Analytics & Impact Reports',
      adminReportsRes.status === 200 && adminReportsRes.data.data.summary.totalDonations > 0,
      `Total Donations Counted: ${adminReportsRes.data?.data?.summary?.totalDonations}`
    );

    // Admin Activity Logs
    const adminLogsRes = await request('/admin/activity-logs', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    recordTest(
      'Admin: Audit Trail & Activity Logs Retrieval',
      adminLogsRes.status === 200 && adminLogsRes.data.data.length > 0,
      `Logs Count: ${adminLogsRes.data?.data?.length}`
    );

    // Admin Category Integrity Test:
    // Create new category
    const catRes = await request('/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { name: `Test Category ${Date.now()}`, description: 'Test', icon: '🍲' },
    });
    const newCatId = catRes.data?.data?._id;
    recordTest('Admin / Category: Create New Food Category', catRes.status === 201 && !!newCatId);

    // Delete unused category (should pass)
    const delUnusedCatRes = await request(`/categories/${newCatId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    recordTest('Admin / Category: Delete Unused Food Category', delUnusedCatRes.status === 200);

    // Attempt to delete category in use by existing donation (should be rejected)
    const inUseCat = await Category.findOne({ name: 'Cooked Meals' });
    if (inUseCat) {
      const delInUseCatRes = await request(`/categories/${inUseCat._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      recordTest(
        'Admin / Category: Prevent Deleting Category with Active Donations',
        delInUseCatRes.status === 400 && delInUseCatRes.data.success === false,
        `Message: ${delInUseCatRes.data?.message}`
      );
    }

    // Admin Settings API
    const updateSettingRes = await request('/admin/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { key: 'requireOtpVerification', value: true, description: 'Mandatory OTP' },
    });
    recordTest(
      'Admin / Settings: Update Platform Configuration Setting',
      updateSettingRes.status === 200 && updateSettingRes.data.data.key === 'requireOtpVerification'
    );

    // -------------------------------------------------------------
    // TEST 12: Notifications
    // -------------------------------------------------------------
    const notifRes = await request('/notifications', {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    recordTest(
      'Notifications: User Notification Dispatch & Retrieval',
      notifRes.status === 200 && Array.isArray(notifRes.data.data),
      `Count: ${notifRes.data?.data?.length}`
    );

    // -------------------------------------------------------------
    // TEST 13: Dashboard Statistics
    // -------------------------------------------------------------
    const donorStatsRes = await request('/users/dashboard-stats', {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    recordTest(
      'Dashboard: Real DB Metrics for Donor',
      donorStatsRes.status === 200 && donorStatsRes.data.data.totalDonations > 0,
      `Total: ${donorStatsRes.data?.data?.totalDonations}`
    );

    const receiverStatsRes = await request('/users/dashboard-stats', {
      headers: { Authorization: `Bearer ${receiverToken}` },
    });
    recordTest(
      'Dashboard: Real DB Metrics for Receiver NGO',
      receiverStatsRes.status === 200 && typeof receiverStatsRes.data.data.myRequestsTotal === 'number'
    );

  } catch (error) {
    console.error('❌ Test suite execution error:', error);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    
    console.log('\n========================================');
    console.log('🏁 TEST SUITE SUMMARY:');
    const passedCount = results.filter((r) => r.passed).length;
    console.log(`Total Tests: ${results.length}`);
    console.log(`Passed: ${passedCount}`);
    console.log(`Failed: ${results.length - passedCount}`);
    console.log('========================================\n');
  }
}

runAllTests();
