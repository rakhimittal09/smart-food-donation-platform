# 🍱 NourishLink — Smart Food Donation Platform (MERN Stack)

> A modern, full-stack web ecosystem built on the **MERN (MongoDB, Express.js, React.js, Node.js)** stack to eliminate surplus food waste and connect food donors (restaurants, caterers, banquets, individuals) directly with verified receiving NGOs, community shelters, and distribution networks.

---

## 🌟 Executive Summary

* **Project Title:** Smart Food Donation Platform (NourishLink)
* **Problem Addressed:** Over 40% of prepared food in urban hospitality and catering goes to waste daily while millions suffer from acute food insecurity. Lack of transparent, real-time logistics prevents surplus edible food from reaching community beneficiaries before expiration.
* **Core Solution:** A responsive, real-time web application that allows verified Donors to list surplus edible meals with expiration countdowns and pickup slots, enables certified NGOs to discover and claim food near them, facilitates secure OTP-verified handovers with step-by-step pickup tracking, and gives Administrators comprehensive oversight, audit trails, and impact analytics.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend SPA** | React.js (v18), React Router DOM (v6), Pure CSS3 Design System, Lucide React, Axios, Canvas Confetti |
| **Backend REST API** | Node.js, Express.js (v4), Multer (Image uploads), Express-Validator, Morgan |
| **Database & ODM** | MongoDB, Mongoose ODM (8 Models: Users, Roles, FoodDonations, Categories, FoodRequests, ActivityLogs, Notifications, Settings) |
| **Authentication & Security** | JSON Web Tokens (JWT), BCrypt Password Hashing, Role-Based Access Control (RBAC) Middleware |
| **Tooling & Build** | Vite (Client Bundler), Nodemon (Dev Server) |

---

## 👥 User Roles & Capabilities

### 1. 🍱 Food Donor (Restaurants, Caterers, Banquets, Individuals)
* **Authentication & Profile:** Register, login, manage contact & address info, change password.
* **Donation Management (CRUD):** List surplus food with real-time preview card, category, quantity, Veg/Non-Veg/Vegan/Egg dietary specs, preparation date, expiration countdown, pickup time slot, and photos.
* **Incoming Request Coordination:** Accept or decline NGO food requests with customizable notes.
* **Pickup Oversight:** Monitor volunteer assignment, verify pickup OTP codes, and confirm handover completion.
* **Donor Dashboard:** Key metrics (Total Listed, Active, Completed, Pending Requests), recent listings, and live activity stream.

### 2. 🤝 Food Receiver / NGO (Shelters, Charities, Food Banks)
* **Catalog Discovery:** Search and multi-filter surplus food by keyword, category, city, dietary type, and expiration urgency.
* **Food Request Workflow:** Submit requests for available quantities with distribution plan notes.
* **Interactive Pickup Tracking:** Real-time multi-stage stepper (`Requested` ➔ `Approved` ➔ `Pickup Scheduled` ➔ `Picked Up` ➔ `Completed`), 4-digit handover OTP, driver & vehicle info updates.
* **Receiver Dashboard:** Nearby food inventory, active request monitor, approved pickup cards, and delivery records.

### 3. 👑 Administrator (System Chief / Platform Manager)
* **User Directory:** Full search, role filtering, account status toggles (`Active` / `Suspended / Blocked`), and user deletion.
* **Donation Moderation:** Oversight over all food listings across all statuses with one-click status transitions and removal of invalid listings.
* **Food Category Manager:** Add, edit, and delete food categories with custom emoji icons.
* **Analytics & Reports:** Visual SVG bar charts and donut breakdown by category, city, dietary type, and monthly donation volumes, plus Top Donors Leaderboard.
* **Activity Audit Logs:** Immutable security audit stream capturing logins, registrations, listing creation/edits, approvals, and handovers with IP records.

---

## 📁 Repository Structure

```text
smart-food-donation-platform/
│
├── client/                               # Frontend React Application (Vite)
│   ├── src/
│   │   ├── components/                   # Reusable UI Components
│   │   │   ├── Navbar.jsx                # Responsive Top Navigation & Mobile Menu
│   │   │   ├── Sidebar.jsx               # Role-Adaptive Dashboard Navigation
│   │   │   ├── Footer.jsx                # Mission, Links & Contact Footer
│   │   │   ├── DashboardLayout.jsx       # Layout Wrapper with Persistent Sidebar
│   │   │   ├── ProtectedRoute.jsx        # JWT Authentication Guard
│   │   │   ├── RoleProtectedRoute.jsx    # Role-Based Authorization Guard
│   │   │   ├── FoodCard.jsx              # Food Listing Card with Countdown & Badges
│   │   │   ├── SearchBar.jsx             # Live Search Input
│   │   │   ├── FilterPanel.jsx           # Multi-Criteria Filter Dropdowns
│   │   │   ├── StatisticsCard.jsx        # KPI Card with Trend & Variant Colors
│   │   │   ├── Timeline.jsx              # Multi-Stage Interactive Stepper
│   │   │   ├── Modal.jsx                 # Accessible Modal Dialog
│   │   │   ├── ConfirmationModal.jsx     # Action Confirmation Prompt
│   │   │   ├── NotificationDropdown.jsx  # Unread Popover Notifications
│   │   │   ├── Pagination.jsx            # Responsive Page Navigation
│   │   │   ├── Charts.jsx                # SVG Bar & Donut Visualization Charts
│   │   │   ├── LoadingSpinner.jsx        # Animated Loading Indicator
│   │   │   └── EmptyState.jsx            # Zero-State Fallback Display
│   │   ├── pages/                        # Application Route Views
│   │   │   ├── HomePage.jsx              # Landing Page with Live Stats & FAQs
│   │   │   ├── LoginPage.jsx             # Login with 1-Click Demo Selectors
│   │   │   ├── RegisterPage.jsx          # Role Registration (Donor vs NGO)
│   │   │   ├── DonorDashboard.jsx        # Donor KPI & Request Management
│   │   │   ├── ReceiverDashboard.jsx     # NGO Catalog & Request Hub
│   │   │   ├── AdminDashboard.jsx        # Platform KPIs & Overview
│   │   │   ├── DonationsPage.jsx         # Searchable & Filterable Catalog
│   │   │   ├── DonationDetailsPage.jsx   # Rich Food Info & Request Modal
│   │   │   ├── CreateDonationPage.jsx    # Food Listing Form with Real-Time Preview
│   │   │   ├── EditDonationPage.jsx      # Edit Existing Donation Details
│   │   │   ├── RequestsPage.jsx          # Role-Unified Request & Action Hub
│   │   │   ├── PickupTrackingPage.jsx    # Live Handover Stepper & OTP PIN Box
│   │   │   ├── ProfilePage.jsx           # User Profile & Password Security
│   │   │   ├── NotificationsPage.jsx     # Full Notification Center
│   │   │   ├── AdminUsersPage.jsx        # User Moderation & Status Toggles
│   │   │   ├── AdminDonationsPage.jsx    # Platform Listing Moderation
│   │   │   ├── AdminCategoriesPage.jsx   # Food Category Management
│   │   │   ├── AdminReportsPage.jsx      # Impact Analytics & Top Donors
│   │   │   ├── AdminActivityLogsPage.jsx # Immutable Audit Trail Logs
│   │   │   └── NotFoundPage.jsx          # Custom 404 Route
│   │   ├── context/                      # State Management Providers
│   │   │   ├── AuthContext.jsx           # JWT Session & Role State
│   │   │   ├── NotificationContext.jsx   # Real-Time Notifications & Unread Count
│   │   │   └── ToastContext.jsx          # Animated Toast Notifications System
│   │   ├── services/                     # Axios API Service Modules
│   │   │   ├── api.js                    # Base Axios Instance & Interceptors
│   │   │   ├── authService.js            # Authentication Endpoints
│   │   │   ├── donationService.js        # Food Donation CRUD & Filters
│   │   │   ├── requestService.js         # Request Creation & Status Changes
│   │   │   ├── userService.js            # Profiles & Dashboard Statistics
│   │   │   ├── adminService.js           # Users, Moderation, Reports & Categories
│   │   │   └── notificationService.js    # Notification Reads & Deletions
│   │   ├── index.css                     # Master CSS Design System
│   │   ├── App.jsx                       # Master Routing Tree
│   │   └── main.jsx                      # Client Entry Point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                               # Backend Node.js & Express REST API
│   ├── config/
│   │   └── db.js                         # MongoDB & Memory Server Connection
│   ├── controllers/
│   │   ├── authController.js             # Register, Login, Me, Logout
│   │   ├── donationController.js         # Donation CRUD, Filters, Search
│   │   ├── requestController.js          # Request Workflow & Pickup Updates
│   │   ├── userController.js             # Profile & Role-Specific Stats
│   │   ├── adminController.js            # Users Moderation, Reports, Logs
│   │   ├── categoryController.js         # Category CRUD
│   │   └── notificationController.js     # Notification Queries & Status
│   ├── middleware/
│   │   ├── auth.js                       # JWT Verification Guard
│   │   ├── role.js                       # Role-Based Access Control Guard
│   │   ├── validator.js                  # Express-Validator Schema Rules
│   │   ├── upload.js                     # Multer Image Upload Config
│   │   └── errorHandler.js               # Centralized HTTP Error Middleware
│   ├── models/                           # Mongoose Schemas (8 Collections)
│   │   ├── User.js                       # User Accounts & Credentials
│   │   ├── Role.js                       # System Roles & Permissions
│   │   ├── FoodDonation.js               # Surplus Food Listing Schema
│   │   ├── FoodRequest.js                # Claim Requests & Stepper Timeline
│   │   ├── Category.js                   # Meal Classification Categories
│   │   ├── Notification.js               # In-App User Notifications
│   │   ├── ActivityLog.js                # Security & Event Audit Logs
│   │   └── Setting.js                    # Dynamic System Configuration
│   ├── routes/                           # Express REST Endpoints
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── donationRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── notificationRoutes.js
│   ├── services/
│   │   ├── logService.js                 # Audit Log Helper
│   │   └── notificationService.js        # User Notification Dispatcher
│   ├── scripts/
│   │   └── seed.js                       # Comprehensive Demo Database Seeder
│   ├── app.js                            # Express App & Route Setup
│   ├── server.js                         # Server Bootstrap
│   ├── .env                              # Environment Variables
│   ├── .env.example
│   └── package.json
│
├── README.md                             # Main Project Documentation
├── SRS.md                                # Software Requirements Specification
├── API_DOCUMENTATION.md                  # Comprehensive REST API Reference
├── DATABASE_DESIGN.md                    # Database Schema & ER Documentation
└── .env.example                          # Root Environment Template
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** (v9 or higher)
* **MongoDB** (Local instance or MongoDB Atlas URI, or built-in auto-fallback)

### 2. Backend Setup
```bash
# Navigate to server directory
cd smart-food-donation-platform/server

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env

# Seed sample data (Admin, Donors, NGOs, Listings, Requests)
npm run seed

# Start development backend (Runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
```bash
# Navigate to client directory in a new terminal
cd smart-food-donation-platform/client

# Install dependencies
npm install

# Start Vite React development server (Runs on http://localhost:5173)
npm run dev
```

---

## 🔑 Default Evaluation Demo Credentials

For instant evaluation, the Login page (`/login`) includes **1-Click Quick Fill** buttons for all 3 roles:

| Role | Email Address | Password | Organization / Entity |
|---|---|---|---|
| 👑 **Administrator** | `admin@fooddonation.org` | `admin123` | FoodCare Central Command |
| 🍱 **Food Donor** | `donor@tajkitchen.com` | `donor123` | Taj Imperial Kitchen & Banquets |
| 🍱 **Food Donor 2** | `donor@freshbakes.com` | `donor123` | Fresh Bakes & Confectionery |
| 🤝 **NGO / Receiver** | `receiver@feedingindia.org` | `ngo123` | Feeding India Foundation |
| 🤝 **NGO / Receiver 2**| `receiver@hopefoundation.org`| `ngo123` | Hope Children Shelter Home |

---

## 📡 REST API Summary (20+ Endpoints)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new Donor or NGO account |
| `POST` | `/api/auth/login` | Public | Login with email/password & receive JWT |
| `POST` | `/api/auth/logout` | Private | Clear active authentication session |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user profile |
| `GET` | `/api/users/profile` | Private | Fetch user account information |
| `PUT` | `/api/users/profile` | Private | Update contact details & address |
| `PUT` | `/api/users/change-password`| Private | Change password with verification |
| `GET` | `/api/users/dashboard-stats`| Private | Role-specific KPI metrics and recent actions |
| `GET` | `/api/donations` | Public | List food donations with filters & search |
| `POST` | `/api/donations` | Donor | Create food donation listing |
| `GET` | `/api/donations/my` | Donor | Fetch user's own listed food items |
| `GET` | `/api/donations/:id` | Public | Fetch detailed donation specs |
| `PUT` | `/api/donations/:id` | Donor/Admin | Update food donation details |
| `DELETE`| `/api/donations/:id` | Donor/Admin | Delete food donation listing |
| `PUT` | `/api/donations/:id/status` | Donor/Admin | Transition donation status |
| `POST` | `/api/requests` | Receiver | Place a food claim request |
| `GET` | `/api/requests` | Private | Fetch requests (filtered by user role) |
| `GET` | `/api/requests/:id` | Private | Fetch single request & pickup timeline |
| `PUT` | `/api/requests/:id/status` | Private | Update request status / confirm pickup |
| `GET` | `/api/categories` | Public | List all active food categories |
| `POST` | `/api/categories` | Admin | Create new meal category |
| `PUT` | `/api/categories/:id` | Admin | Update category details |
| `DELETE`| `/api/categories/:id` | Admin | Remove food category |
| `GET` | `/api/admin/users` | Admin | User directory search & filter |
| `PUT` | `/api/admin/users/:id/status`| Admin | Block or unblock user account |
| `DELETE`| `/api/admin/users/:id` | Admin | Remove user account |
| `GET` | `/api/admin/reports` | Admin | Multi-metric system analytics |
| `GET` | `/api/admin/activity-logs` | Admin | Immutable event audit trail |
| `GET` | `/api/notifications` | Private | User alerts & unread counter |
| `PUT` | `/api/notifications/read-all`| Private | Mark all user alerts as read |
| `DELETE`| `/api/notifications/:id` | Private | Delete individual notification |

---

## 🔮 Future Enhancements & Scalability

1. **AI Demand Prediction & Route Optimization:** Predictive modeling using historical donation patterns to alert recipient shelters ahead of peak banquet and event timings.
2. **Interactive Map-Based Discovery:** Visual map integration with radius filtering (e.g. within 5 km, 10 km) to find nearest food donations and optimize transit times.
3. **SMS & WhatsApp Webhook Alerts:** Instant automated notifications to nearby NGO volunteers when perishable cooked food is posted.
4. **Barcode & QR Code Handover:** Instant mobile camera scanning of QR codes during physical pickup to replace manual OTP entry.

---

## 👥 Team Contribution (4-Student Capstone Team)

* **Student 1 (Backend & Database Architecture):** MongoDB schemas, JWT authentication, RBAC middleware, Express REST controllers, and database seeding.
* **Student 2 (Frontend Architecture & Design System):** React SPA scaffolding, pure CSS design tokens, responsive layouts, Navbar, Sidebar, and Footer.
* **Student 3 (Food Donation & Pickup Workflow):** Donation CRUD forms with real-time preview, catalog search/filtering, and interactive Pickup Tracking Stepper.
* **Student 4 (Admin Panel & Documentation):** Admin moderation views, User Directory, SVG Analytics Charts, Activity Audit Trail, SRS, API docs, and ER diagram design.
