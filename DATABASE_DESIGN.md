# Database Design & Schema Documentation
## Smart Food Donation Platform (NourishLink)

NourishLink utilizes **MongoDB** with **Mongoose ODM** structured into **8 distinct collections** optimized with indexes and references.

---

## 1. Entity Relationship (ER) Model

```text
User (Donors, Receivers, Admins)
 │
 ├── (1:N) ──> FoodDonations (Listed surplus items)
 │                  │
 │                  └── (1:N) ──> FoodRequests (Claims by NGOs)
 │                                     │
 ├── (1:N) ──> FoodRequests (Claims by this Receiver)
 │
 ├── (1:N) ──> Notifications (Alerts sent to this User)
 │
 └── (1:N) ──> ActivityLogs (Events triggered by this User)

Category
 └── (1:N) ──> Categorizes FoodDonations

Role
 └── Defines permissions & scopes for User.role

Setting
 └── Global key-value operational flags
```

---

## 2. Collection Schemas

### 1. `users` Collection
Stores user accounts, contact details, organization affiliations, and hashed credentials.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `_id` | ObjectId | Yes | Auto | Unique user identifier |
| `name` | String | Yes | - | Full name (2-100 chars) |
| `email` | String | Yes | - | Unique, lowercase, indexed |
| `password` | String | Yes | - | Hashed with bcrypt (hidden by default) |
| `phone` | String | Yes | - | 10-digit mobile number |
| `role` | String | Yes | `'donor'` | Enum: `['donor', 'receiver', 'admin']` |
| `organizationName`| String | No | `''` | NGO or Restaurant entity name |
| `address` | String | No | `''` | Street address |
| `city` | String | No | `''` | City |
| `state` | String | No | `''` | State / Region |
| `pincode` | String | No | `''` | 6-digit postal code |
| `status` | String | Yes | `'active'` | Enum: `['active', 'blocked', 'inactive']` |
| `createdAt` | Date | Yes | `Date.now` | Timestamp |
| `updatedAt` | Date | Yes | `Date.now` | Timestamp |

---

### 2. `roles` Collection
Stores definitions and permission scopes for platform roles.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique role identifier |
| `name` | String | Yes | Enum: `['donor', 'receiver', 'admin']` |
| `displayName` | String | Yes | Human-readable role title |
| `description` | String | No | Role responsibilities |
| `permissions` | [String] | No | Array of permitted actions |

---

### 3. `foodlistings` Collection
Represents surplus food listings published by donors.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | Yes | Primary key |
| `donor` | ObjectId | Yes | Ref: `User` |
| `foodName` | String | Yes | Title of the food item (2-150 chars) |
| `description` | String | Yes | Detailed description (up to 1000 chars) |
| `category` | String | Yes | Ref / Name of category |
| `quantity` | Number | Yes | Positive integer |
| `unit` | String | Yes | Enum: `['kg', 'meals', 'boxes', 'packets', 'servings', 'litres']` |
| `foodType` | String | Yes | Enum: `['Veg', 'Non-Veg', 'Vegan', 'Egg']` |
| `preparationDate`| Date | Yes | When meals were cooked/packaged |
| `expiryDate` | Date | Yes | Expiration timestamp |
| `pickupDate` | Date | Yes | Target collection date |
| `pickupTime` | String | Yes | E.g. `'04:00 PM - 07:00 PM'` |
| `pickupAddress`| String | Yes | Physical collection location |
| `city` | String | Yes | Indexed for local discovery |
| `state` | String | Yes | State |
| `pincode` | String | Yes | 6-digit pincode |
| `contactName` | String | No | Contact person at pickup site |
| `contactPhone` | String | No | Phone number |
| `specialInstructions`| String | No | Handling, storage, container notes |
| `image` | String | No | Uploaded image path or URL |
| `status` | String | Yes | Enum: `['Available', 'Pending', 'Accepted', 'Picked Up', 'Delivered', 'Expired', 'Cancelled']` |

* **Indexes:** `{ foodName: 'text', description: 'text', city: 'text' }`, `{ status: 1, expiryDate: 1, city: 1, category: 1 }`


---

### 4. `foodrequests` Collection
Tracks requests made by NGOs to claim food donations and the subsequent pickup stepper.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique request ID |
| `donation` | ObjectId | Yes | Ref: `FoodDonation` |
| `receiver` | ObjectId | Yes | Ref: `User` (NGO) |
| `requestedQuantity`| Number | Yes | Positive integer |
| `message` | String | Yes | Distribution plan & rationale |
| `status` | String | Yes | Enum: `['Pending', 'Accepted', 'Picked Up', 'Delivered', 'Rejected', 'Cancelled']` |
| `pickupDetails` | Object | Yes | Embedded subdocument: |
| ↳ `scheduledDate` | Date | No | Confirmed pickup date |
| ↳ `scheduledTime` | String | No | Confirmed time slot |
| ↳ `pickupPersonName`| String | No | Volunteer / Driver name |
| ↳ `pickupPersonPhone`| String | No | Volunteer contact |
| ↳ `vehicleNumber` | String | No | Transport vehicle plate |
| ↳ `otp` | String | No | 4-digit verification code |
| ↳ `timeline` | Array | Yes | Array of `{ status, title, description, timestamp, updatedBy }` |
| `requestedAt` | Date | Yes | Timestamp |
| `approvedAt` | Date | No | Timestamp |
| `completedAt` | Date | No | Timestamp |
| `rejectionReason`| String | No | Decline explanation |

---

### 5. `categories` Collection
Stores food categorization tags.

| Field | Type | Required | Default |
|---|---|---|---|
| `_id` | ObjectId | Yes | Auto |
| `name` | String | Yes | Unique category name |
| `description` | String | No | Description of meal type |
| `icon` | String | No | Emoji or icon identifier |
| `status` | String | Yes | Enum: `['active', 'inactive']` |

---

### 6. `notifications` Collection
Stores notifications delivered to users.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | Yes | Primary key |
| `user` | ObjectId | Yes | Ref: `User` (Recipient) |
| `title` | String | Yes | Alert headline |
| `message` | String | Yes | Alert message text |
| `type` | String | Yes | Enum: `['info', 'success', 'warning', 'danger']` |
| `isRead` | Boolean | Yes | Default: `false` |
| `link` | String | No | Deep-link to resource |

---

### 7. `activitylogs` Collection
Immutable audit trail recording security and operational actions.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | Yes | Primary key |
| `user` | ObjectId | Yes | Ref: `User` |
| `action` | String | Yes | Action code (e.g. `'DONATION_CREATED'`) |
| `description` | String | Yes | Human-readable event description |
| `module` | String | Yes | Enum: `['AUTH', 'DONATION', 'REQUEST', 'PICKUP', 'USER', 'ADMIN', 'CATEGORY', 'PROFILE']` |
| `ipAddress` | String | No | Request client IP |
| `createdAt` | Date | Yes | Event timestamp |

---

### 8. `settings` Collection
Dynamic system configurations.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | Yes | Primary key |
| `key` | String | Yes | Unique setting key |
| `value` | Mixed | Yes | JSON or primitive value |
| `description` | String | No | Setting purpose |
