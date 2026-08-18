# Software Requirements Specification (SRS)
## Smart Food Donation Platform (NourishLink)

---

## 1. Introduction

### 1.1 Purpose
This document provides the complete Software Requirements Specification (SRS) for the **Smart Food Donation Platform (NourishLink)**. The system is designed to streamline surplus food redistribution by connecting food donors (restaurants, caterers, banquet halls, and individual donors) with verified recipient organizations (NGOs, community kitchens, charitable trusts, and orphanages) to eradicate food waste and alleviate community hunger.

### 1.2 Scope
The web application encompasses:
- User registration and JWT-based authentication with Role-Based Access Control (RBAC).
- Comprehensive CRUD management of food donation listings with categorization, dietary tags, expiration tracking, and pickup windows.
- Food discovery, multi-criteria filtering, and claiming by recipient NGOs.
- Interactive multi-stage pickup tracking with OTP-based verification.
- In-app notification delivery and immutable security audit logs.
- Administrative console for user moderation, listing governance, category management, and impact analytics.

### 1.3 Definitions, Acronyms, and Abbreviations
- **MERN:** MongoDB, Express.js, React.js, Node.js.
- **RBAC:** Role-Based Access Control.
- **JWT:** JSON Web Token for stateless authentication.
- **OTP:** One-Time Password used for physical food handover verification.
- **NGO:** Non-Governmental Organization.

---

## 2. Overall Description

### 2.1 Product Perspective
NourishLink operates as a responsive Single Page Application (SPA) communicating over HTTPS with a centralized RESTful API gateway backed by a NoSQL MongoDB document database.

```text
[ React SPA (Vite: Port 5173) ]
             ↕ (JSON / REST APIs)
[ Express.js + Node.js API (Port 5000) ]
             ↕ (Mongoose ODM)
[ MongoDB Database Engine (Port 27017) ]
```

### 2.2 User Classes & Characteristics
1. **Donor (Food Provider):** Commercial and domestic food preparers seeking to list surplus food rather than disposing of it.
2. **Receiver / NGO (Distribution Partner):** Verified organizations that collect surplus meals and distribute them directly to needy individuals.
3. **Administrator (System Operator):** High-privilege operators monitoring user integrity, resolving disputes, modifying system categories, and tracking platform metrics.

### 2.3 Operating Environment
- **Client:** Modern web browsers (Chrome, Firefox, Safari, Edge) on Desktop, Tablet, and Mobile devices.
- **Server:** Node.js v18+ runtime on Linux/Windows/macOS.
- **Database:** MongoDB Community Server 6.0+ or MongoDB Atlas cluster.

---

## 3. Functional Requirements

### 3.1 Module 1: Authentication & Authorization
- **FR-1.1:** The system shall allow users to register as either a `Donor` or a `Receiver` with name, email, mobile number, organization details, and physical address.
- **FR-1.2:** The system shall hash user passwords using bcrypt with a salt factor of 10 prior to storage.
- **FR-1.3:** The system shall issue a signed JSON Web Token (JWT) upon successful authentication.
- **FR-1.4:** The system shall restrict access to protected API endpoints according to the user's role.
- **FR-1.5:** The system shall prevent blocked/suspended users from authenticating.

### 3.2 Module 2: Dashboard Module
- **FR-2.1:** Donors shall see a tailored dashboard displaying Total Donations, Active Listings, Pending Requests, Delivered Meals, and recent activity logs.
- **FR-2.2:** Receivers shall see an NGO dashboard showing Available Food Nearby, Active Requests, Approved Pickups, and Urgent Expiring Meals.
- **FR-2.3:** Administrators shall see system-wide KPI metrics, user distribution, and audit feeds.

### 3.3 Module 3: Food Donation Management
- **FR-3.1:** Donors shall be able to create food listings specifying title, description, category, quantity, unit, dietary type (`Veg`, `Non-Veg`, `Vegan`, `Egg`), preparation time, expiry date/time, pickup window, address, contact number, and special handling instructions.
- **FR-3.2:** Donors shall be able to edit or delete their active listings.
- **FR-3.3:** The system shall automatically compute remaining shelf-life and display countdown indicators.

### 3.4 Module 4: Food Discovery & Search
- **FR-4.1:** Users shall be able to search listings by keyword across food title, description, city, and address.
- **FR-4.2:** Users shall be able to filter by Category, Dietary Type, City, and Status.
- **FR-4.3:** The system shall support server-side pagination with custom limits.

### 3.5 Module 5: Food Request & Handover Workflow
- **FR-5.1:** Receivers shall be able to request available donations by specifying required quantity and community distribution rationale.
- **FR-5.2:** Donors shall be notified and able to Approve or Reject incoming requests.
- **FR-5.3:** Upon approval, the system shall generate a secure 4-digit verification OTP.
- **FR-5.4:** The system shall provide an interactive stepper (`Requested` ➔ `Approved` ➔ `Pickup Scheduled` ➔ `Completed`).

### 3.6 Module 6: Notification & Audit Center
- **FR-6.1:** The system shall dispatch real-time in-app notifications for status transitions.
- **FR-6.2:** Users shall be able to mark notifications as read or delete them.
- **FR-6.3:** The system shall maintain an immutable `ActivityLogs` collection documenting all major operations with timestamps and IP addresses.

### 3.7 Module 7: Administrative Governance & Reports
- **FR-7.1:** Administrators shall be able to view, search, activate, suspend, or delete user accounts.
- **FR-7.2:** Administrators shall be able to moderate any food listing or category.
- **FR-7.3:** The system shall generate visual reports of donation volumes by category, city, dietary type, and monthly trends.

---

## 4. Non-Functional Requirements

### 4.1 Performance
- API response times shall not exceed 250ms under normal operating conditions.
- Client initial paint time shall be under 1.5 seconds via Vite optimized bundling.

### 4.2 Security
- Plaintext passwords shall never be logged or transmitted in response payloads.
- All mutating endpoints shall require valid JWT Bearer tokens in headers.
- Input validation shall be enforced on both client and server via `express-validator`.

### 4.3 Reliability & Availability
- Platform uptime target of 99.9%.
- Automated database indexing for high-frequency queries on status, city, and expiry timestamps.

### 4.4 Usability & Responsiveness
- Accessible UI compatible with WCAG 2.1 AA standards.
- Fully responsive layout adapting across screen widths from 320px to 4K displays.
