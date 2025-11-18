# API Documentation

Complete API reference for the EV CMS Brand Admin Dashboard.

## Base URL

```
Development: http://localhost:5000/api/v1
Production: https://api.evcms.com/api/v1
```

## Authentication

All API requests (except authentication endpoints) require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Expiration
- Access Token: 7 days (configurable)
- Refresh Token: 30 days (configurable)

---

## Endpoints

### Authentication

#### POST `/auth/login`
Login with username/email and password.

**Request Body:**
```json
{
  "identifier": "admin001",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "username": "admin001",
    "email": "admin@example.com",
    "role": "admin",
    "fullName": "System Administrator"
  }
}
```

---

#### POST `/auth/send-otp`
Request OTP for login or password reset.

**Request Body:**
```json
{
  "phone": "+1234567890",
  "type": "login"
}
```
or
```json
{
  "email": "user@example.com",
  "type": "password_reset"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

---

#### POST `/auth/verify-otp`
Verify OTP and complete authentication.

**Request Body:**
```json
{
  "identifier": "+1234567890",
  "otp": "123456",
  "type": "login"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "username": "admin001",
    "phone": "+1234567890"
  }
}
```

---

#### POST `/auth/reset-password`
Reset password using OTP.

**Request Body:**
```json
{
  "identifier": "user@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

#### GET `/auth/check`
Validate current authentication token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "username": "admin001",
    "role": "admin"
  }
}
```

---

#### POST `/auth/logout`
Logout and invalidate token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Users

#### GET `/users`
Get list of all users (paginated).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role
- `status` (optional): Filter by status (active/blocked)
- `search` (optional): Search by name, email, or username

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "username": "user001",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "customer",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

#### GET `/users/:id`
Get user details by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "username": "user001",
    "email": "user@example.com",
    "phone": "+1234567890",
    "fullName": "John Doe",
    "role": "customer",
    "isActive": true,
    "kyc": {
      "status": "verified",
      "documents": []
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  }
}
```

---

#### POST `/users`
Create a new user.

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "phone": "+1234567890",
  "fullName": "New User",
  "role": "customer",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "username": "newuser",
    "email": "newuser@example.com"
  },
  "message": "User created successfully"
}
```

---

#### PUT `/users/:id`
Update user details.

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "phone": "+9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "fullName": "Updated Name"
  },
  "message": "User updated successfully"
}
```

---

#### POST `/users/:id/block`
Block a user account.

**Response:**
```json
{
  "success": true,
  "message": "User blocked successfully"
}
```

---

#### POST `/users/:id/unblock`
Unblock a user account.

**Response:**
```json
{
  "success": true,
  "message": "User unblocked successfully"
}
```

---

### Chargers

#### GET `/chargers`
Get list of all chargers.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status (available, charging, offline, faulted)
- `location`: Filter by location ID
- `search`: Search by name or ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ch_001",
      "name": "Station Alpha - Charger 1",
      "status": "available",
      "location": {
        "id": "loc_001",
        "name": "Downtown Hub",
        "address": "123 Main St"
      },
      "connectors": [
        {
          "id": "conn_001",
          "type": "Type 2",
          "status": "available",
          "power": 22
        }
      ],
      "lastActivity": "2024-11-18T10:00:00Z"
    }
  ]
}
```

---

#### GET `/chargers/:id`
Get charger details by ID.

---

#### POST `/chargers`
Add a new charger.

**Request Body:**
```json
{
  "name": "New Charger",
  "locationId": "loc_001",
  "model": "Model X",
  "serialNumber": "SN123456",
  "connectors": [
    {
      "type": "Type 2",
      "power": 22,
      "voltage": 220
    }
  ]
}
```

---

#### PUT `/chargers/:id`
Update charger details.

---

#### POST `/chargers/:id/start`
Start a charging session.

**Request Body:**
```json
{
  "connectorId": "conn_001",
  "userId": "user_123",
  "vehicleId": "vehicle_456"
}
```

---

#### POST `/chargers/:id/stop`
Stop a charging session.

**Request Body:**
```json
{
  "sessionId": "session_789"
}
```

---

### Sessions

#### GET `/sessions`
Get charging sessions.

**Query Parameters:**
- `status`: active, completed, failed
- `userId`: Filter by user
- `chargerId`: Filter by charger
- `startDate`, `endDate`: Date range

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "session_001",
      "user": {
        "id": "user_123",
        "name": "John Doe"
      },
      "charger": {
        "id": "ch_001",
        "name": "Station Alpha"
      },
      "status": "completed",
      "startTime": "2024-11-18T10:00:00Z",
      "endTime": "2024-11-18T11:30:00Z",
      "energyConsumed": 25.5,
      "cost": 150.00,
      "payment": {
        "status": "completed",
        "method": "card"
      }
    }
  ]
}
```

---

### Analytics

#### GET `/analytics/dashboard`
Get dashboard analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalChargers": 150,
    "activeChargers": 120,
    "totalSessions": 5000,
    "activeSessions": 25,
    "revenue": {
      "today": 25000,
      "thisWeek": 150000,
      "thisMonth": 600000
    },
    "utilization": {
      "current": 75.5,
      "average": 68.2
    }
  }
}
```

---

#### GET `/analytics/revenue`
Get revenue analytics.

**Query Parameters:**
- `period`: daily, weekly, monthly, yearly
- `startDate`, `endDate`: Date range

---

#### GET `/analytics/utilization`
Get charger utilization statistics.

---

### Pricing

#### GET `/pricing/rules`
Get all pricing rules.

---

#### POST `/pricing/rules`
Create a new pricing rule.

**Request Body:**
```json
{
  "name": "Peak Hour Pricing",
  "type": "time_based",
  "baseRate": 10,
  "timeSlots": [
    {
      "start": "18:00",
      "end": "22:00",
      "multiplier": 1.5
    }
  ],
  "active": true
}
```

---

#### POST `/pricing/calculate`
Calculate pricing for a session.

**Request Body:**
```json
{
  "energy": 25.5,
  "duration": 90,
  "timeSlot": "18:30",
  "locationId": "loc_001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "baseCost": 255,
    "multiplier": 1.5,
    "totalCost": 382.50,
    "breakdown": {
      "energyCost": 255,
      "timeCost": 0,
      "peakHourSurcharge": 127.50
    }
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Invalid or missing token
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (422): Invalid input data
- `SERVER_ERROR` (500): Internal server error

---

## Rate Limiting

- **Free tier**: 100 requests per minute
- **Premium tier**: 1000 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1639651200
```

---

## WebSocket Events

Connect to: `ws://localhost:5000`

### Events

#### `charger_status_update`
Real-time charger status changes.

```json
{
  "chargerId": "ch_001",
  "status": "charging",
  "connector": 1,
  "timestamp": "2024-11-18T10:00:00Z"
}
```

#### `session_update`
Session progress updates.

```json
{
  "sessionId": "session_001",
  "energyConsumed": 15.5,
  "cost": 155.00,
  "duration": 45
}
```

---

## SDKs and Libraries

- **JavaScript/TypeScript**: Use Axios or Fetch API
- **Authentication**: JWT tokens in Authorization header
- **Date Format**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Currency**: All amounts in base currency units (e.g., paise for INR)

---

## Support

For API support, contact: support@evcms.com
