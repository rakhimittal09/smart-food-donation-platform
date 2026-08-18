# REST API Documentation
## Smart Food Donation Platform (NourishLink)

Base URL: `http://localhost:5000/api`

---

## 1. Response Standard

### Success Response (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response (`400 Bad Request` / `401 Unauthorized` / `403 Forbidden` / `404 Not Found`)
```json
{
  "success": false,
  "message": "Detailed error message describing the failure",
  "errors": []
}
```

---

## 2. Authentication APIs

### `POST /auth/register`
* **Access:** Public
* **Description:** Register a new Donor or NGO Receiver.
* **Request Body:**
```json
{
  "name": "Rajesh Malhotra",
  "email": "donor@tajkitchen.com",
  "password": "donor123",
  "phone": "9812345678",
  "role": "donor",
  "organizationName": "Taj Imperial Kitchen",
  "address": "14 MG Road",
  "city": "New Delhi",
  "state": "Delhi",
  "pincode": "110001"
}
```
* **Response (201):** Returns JWT token and created user object.

### `POST /auth/login`
* **Access:** Public
* **Description:** Authenticate user and receive JWT.
* **Request Body:**
```json
{
  "email": "donor@tajkitchen.com",
  "password": "donor123"
}
```
* **Response (200):** Returns JWT token and user profile.

### `POST /auth/logout`
* **Access:** Private
* **Headers:** `Authorization: Bearer <token>`
* **Description:** Logs out user and records audit log.

### `GET /auth/me`
* **Access:** Private
* **Headers:** `Authorization: Bearer <token>`
* **Description:** Returns profile of the currently logged-in user.

---

## 3. User & Profile APIs

### `GET /users/profile`
* **Access:** Private
* **Description:** Fetch user account details.

### `PUT /users/profile`
* **Access:** Private
* **Request Body:**
```json
{
  "name": "Rajesh Malhotra",
  "phone": "9812345678",
  "organizationName": "Taj Imperial Kitchen & Banquets",
  "address": "Plot 14 MG Road",
  "city": "New Delhi",
  "state": "Delhi",
  "pincode": "110001"
}
```

### `PUT /users/change-password`
* **Access:** Private
* **Request Body:**
```json
{
  "currentPassword": "donor123",
  "newPassword": "newDonorSecret123",
  "confirmPassword": "newDonorSecret123"
}
```

### `GET /users/dashboard-stats`
* **Access:** Private
* **Description:** Returns role-specific KPI numbers, recent donations/requests, and activity history.

---

## 4. Food Donation APIs

### `GET /donations`
* **Access:** Public
* **Query Parameters:** `page`, `limit`, `search`, `category`, `foodType`, `city`, `status`, `includeExpired`
* **Response (200):** Paginated array of donations with populated donor info.

### `GET /donations/my`
* **Access:** Private (Donor)
* **Description:** Returns listings created by the authenticated donor with pending request counters.

### `GET /donations/:id`
* **Access:** Public / Authenticated
* **Description:** Returns single donation details and associated requests if donor/admin.

### `POST /donations`
* **Access:** Private (Donor)
* **Request Body (JSON or multipart/form-data):**
```json
{
  "foodName": "50 Plates Hyderabadi Biryani",
  "description": "Freshly prepared vegetable biryani with raita packets from lunch banquet.",
  "category": "Cooked Meals",
  "quantity": 50,
  "unit": "servings",
  "foodType": "Veg",
  "preparationDate": "2026-08-15T10:00:00.000Z",
  "expiryDate": "2026-08-15T22:00:00.000Z",
  "pickupDate": "2026-08-15T16:00:00.000Z",
  "pickupTime": "04:00 PM - 07:00 PM",
  "pickupAddress": "14 MG Road, City Center",
  "city": "New Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "specialInstructions": "Hygienically packaged in sealable foil boxes."
}
```

### `PUT /donations/:id`
* **Access:** Private (Donor / Admin)
* **Description:** Update editable parameters of a donation.

### `PUT /donations/:id/status`
* **Access:** Private (Donor / Admin)
* **Request Body:** `{ "status": "Approved" }`

### `DELETE /donations/:id`
* **Access:** Private (Donor / Admin)
* **Description:** Delete donation and automatically cancel pending requests.

---

## 5. Food Request & Pickup APIs

### `POST /requests`
* **Access:** Private (Receiver)
* **Request Body:**
```json
{
  "donationId": "65b...",
  "requestedQuantity": 30,
  "message": "Distribution to local shelter children.",
  "pickupPersonName": "Ramesh Kumar",
  "pickupPersonPhone": "9812345678",
  "vehicleNumber": "DL 01 AB 1234"
}
```

### `GET /requests`
* **Access:** Private
* **Description:** List requests. Auto-filtered by role (Donor sees received requests, Receiver sees own requests).

### `GET /requests/:id`
* **Access:** Private
* **Description:** Retrieve full details, pickup status, and 4-digit OTP.

### `PUT /requests/:id/status`
* **Access:** Private (Donor, Receiver, Admin)
* **Request Body:**
```json
{
  "status": "Approved",
  "rejectionReason": "",
  "pickupPersonName": "Ramesh Kumar",
  "pickupPersonPhone": "9812345678",
  "vehicleNumber": "DL 01 AB 1234"
}
```

---

## 6. Notification APIs

### `GET /notifications`
* **Access:** Private
* **Description:** Returns list of notifications and `unreadCount`.

### `PUT /notifications/:id/read`
* **Access:** Private
* **Description:** Mark single notification as read.

### `PUT /notifications/read-all`
* **Access:** Private
* **Description:** Mark all user notifications as read.

### `DELETE /notifications/:id`
* **Access:** Private
* **Description:** Delete notification.

---

## 7. Admin APIs

### `GET /admin/users`
* **Access:** Private (Admin)
* **Query Parameters:** `page`, `limit`, `role`, `status`, `search`

### `PUT /admin/users/:id/status`
* **Access:** Private (Admin)
* **Request Body:** `{ "status": "blocked" }`

### `DELETE /admin/users/:id`
* **Access:** Private (Admin)
* **Description:** Permanently delete a user account.

### `GET /admin/reports`
* **Access:** Private (Admin)
* **Description:** Aggregates donations by category, city, dietary type, monthly volume, and top donors leaderboard.

### `GET /admin/activity-logs`
* **Access:** Private (Admin)
* **Query Parameters:** `page`, `limit`, `module`
* **Description:** Returns system audit logs.

### `GET /categories` & `POST /categories` & `PUT /categories/:id` & `DELETE /categories/:id`
* **Access:** Public for GET, Admin for mutating actions.
