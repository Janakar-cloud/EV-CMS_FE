# Service Layer Documentation

Documentation for all service modules in the application.

## Auth Service

**Location**: `src/lib/auth-service.ts`

Handles all authentication-related operations.

### Methods

#### `login(credentials: LoginCredentials): Promise<AuthResponse>`
Authenticates user with username/email and password.

**Parameters:**
```typescript
{
  identifier: string; // username, email, or phone
  password: string;
}
```

**Returns:**
```typescript
{
  success: boolean;
  token?: string;
  user?: AuthUser;
  errors?: string[];
}
```

**Example:**
```typescript
const response = await authService.login({
  identifier: 'admin001',
  password: 'password123'
});

if (response.success) {
  localStorage.setItem('token', response.token);
  // Handle successful login
}
```

---

#### `requestOTP(request: OTPRequest): Promise<OTPResponse>`
Sends OTP to email or phone.

---

#### `verifyOTP(verification: OTPVerification): Promise<AuthResponse>`
Verifies OTP and completes authentication.

---

#### `resetPassword(resetData: PasswordReset): Promise<OTPResponse>`
Resets user password using OTP.

---

#### `checkAuth(token: string): Promise<AuthResponse>`
Validates authentication token.

---

#### `logout(token: string): Promise<OTPResponse>`
Logs out user and invalidates token.

---

## Charger Service

**Location**: `src/lib/charger-service.ts`

Manages charger operations and monitoring.

### Methods

#### `getChargers(filters?): Promise<Charger[]>`
Fetches list of chargers with optional filters.

**Filters:**
- `status`: Filter by charger status
- `location`: Filter by location ID
- `search`: Search term

---

#### `getChargerById(id: string): Promise<Charger>`
Fetches single charger details.

---

#### `createCharger(data: CreateChargerData): Promise<Charger>`
Creates new charger.

---

#### `updateCharger(id: string, data: UpdateChargerData): Promise<Charger>`
Updates charger information.

---

#### `startCharging(chargerId: string, data: StartChargingData): Promise<Session>`
Initiates charging session.

---

#### `stopCharging(sessionId: string): Promise<Session>`
Stops active charging session.

---

## User Service

**Location**: `src/lib/user-service.ts`

Handles user management operations.

### Methods

#### `getUsers(filters?): Promise<User[]>`
Fetches users with optional filters.

---

#### `getUserById(id: string): Promise<User>`
Fetches single user.

---

#### `createUser(data: CreateUserData): Promise<User>`
Creates new user.

---

#### `updateUser(id: string, data: UpdateUserData): Promise<User>`
Updates user details.

---

#### `blockUser(id: string): Promise<void>`
Blocks user account.

---

#### `unblockUser(id: string): Promise<void>`
Unblocks user account.

---

## Pricing Service

**Location**: `src/lib/pricing-service.ts`

Manages pricing rules and calculations.

### Methods

#### `getPricingRules(): Promise<PricingRule[]>`
Fetches all pricing rules.

---

#### `createPricingRule(data: CreatePricingRuleData): Promise<PricingRule>`
Creates new pricing rule.

---

#### `updatePricingRule(id: string, data: UpdatePricingRuleData): Promise<PricingRule>`
Updates pricing rule.

---

#### `calculatePrice(data: CalculatePriceData): Promise<PriceCalculation>`
Calculates price for a session.

**Parameters:**
```typescript
{
  energy: number;        // kWh consumed
  duration: number;      // Minutes
  timeSlot?: string;     // Time of charging
  locationId?: string;   // Location ID
}
```

---

## OCPP Service

**Location**: `src/lib/ocpp-service.ts`

Handles OCPP (Open Charge Point Protocol) operations.

### Methods

#### `sendCommand(chargerId: string, command: string, params?: any): Promise<any>`
Sends OCPP command to charger.

**Commands:**
- `RemoteStartTransaction`
- `RemoteStopTransaction`
- `Reset`
- `UnlockConnector`
- `GetConfiguration`
- `ChangeConfiguration`

---

#### `getChargerStatus(chargerId: string): Promise<ChargerStatus>`
Gets real-time charger status via OCPP.

---

## Gun Monitoring Service

**Location**: `src/lib/gun-monitoring-service.ts`

Monitors gun/connector level metrics.

### Methods

#### `getGunMetrics(chargerId: string, connectorId: number): Promise<GunMetrics>`
Gets detailed metrics for a specific gun/connector.

**Returns:**
```typescript
{
  voltage: number;
  current: number;
  power: number;
  energy: number;
  temperature: number;
  timestamp: Date;
}
```

---

#### `subscribeToGunUpdates(chargerId: string, callback: Function): void`
Subscribes to real-time gun monitoring updates.

---

## API Client

**Location**: `src/lib/api-client.ts`

Centralized HTTP client with interceptors.

### Features

- Automatic JWT token injection
- Request/response interceptors
- Global error handling
- Retry logic for failed requests
- Request timeout management

### Usage

```typescript
import { apiClient } from '@/lib/api-client';

// GET request
const users = await apiClient.get('/users');

// POST request
const newUser = await apiClient.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
const updated = await apiClient.put('/users/123', {
  name: 'Jane Doe'
});

// DELETE request
await apiClient.delete('/users/123');
```

### Interceptors

**Request Interceptor:**
- Adds Authorization header with JWT token
- Adds timestamp to requests
- Logs outgoing requests (development only)

**Response Interceptor:**
- Handles 401 errors (auto-logout)
- Shows toast notifications for errors
- Transforms response data
- Logs responses (development only)

### Error Handling

```typescript
try {
  const data = await apiClient.get('/users');
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized
  } else if (error.response?.status === 404) {
    // Handle not found
  } else {
    // Handle other errors
  }
}
```

---

## Best Practices

1. **Error Handling**: Always wrap service calls in try-catch
2. **Loading States**: Show loading indicators during API calls
3. **Caching**: Use TanStack Query for automatic caching
4. **Optimistic Updates**: Update UI before API confirmation when appropriate
5. **Type Safety**: Use TypeScript types for all service parameters and returns

---

## Environment Configuration

All services use centralized configuration from `src/config/constants.ts`:

```typescript
import { API_ENDPOINTS } from '@/config/constants';

// Use predefined endpoints
const response = await apiClient.get(API_ENDPOINTS.USERS.BASE);
```

---

## Testing Services

Example test for auth service:

```typescript
import { authService } from '@/lib/auth-service';

describe('AuthService', () => {
  it('should login successfully', async () => {
    const response = await authService.login({
      identifier: 'admin001',
      password: 'password123'
    });
    
    expect(response.success).toBe(true);
    expect(response.token).toBeDefined();
  });
});
```
