# Frontend Quick Start Guide

**Date**: November 19, 2025  
**Frontend URL**: http://localhost:3001  
**Backend API**: http://localhost:5000/api/v1

---

## 🚀 Quick Access

1. **Open Browser**: Navigate to `http://localhost:3001`
2. **Login**: Use test credentials below
3. **Test Integration**: Check charger management features

---

## 🔐 Test Credentials

```javascript
// Admin Account (Full Access)
Email: admin@evcms.com
Password: password123

// Brand Partner Account
Email: brand@evcms.com  
Password: password123

// Regular User Account
Email: john@example.com
Password: password123
```

---

## ✅ What's Already Configured

### Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:5000
NEXT_PUBLIC_OCPP_WS_URL=ws://localhost:8080/ocpp
NEXT_PUBLIC_OCPI_URL=http://localhost:8081/ocpi/2.2.1
```

### Services Updated
- ✅ **ocpp-service.ts** - Uses REST API (port 5000), not direct WebSocket
- ✅ **useChargerSocket.ts** - Socket.IO hook for real-time updates
- ✅ **ChargerIntegrationExample.tsx** - Complete example component

### Dependencies
- ✅ **socket.io-client** (v4.8.1) - Already installed
- ✅ All required packages present

---

## 🔧 Correct Integration Architecture

```
┌─────────────────────────────────────────────────────┐
│  Browser (http://localhost:3001)                    │
│  - React Components                                 │
│  - ocppService.executeCommand()                     │
│  - useChargerSocket() hook                          │
└─────────────────────────────────────────────────────┘
           │                           │
           │ REST API                  │ Socket.IO
           │ (fetch)                   │ (io)
           ▼                           ▼
┌─────────────────────────────────────────────────────┐
│  Main API Service (http://localhost:5000)           │
│  - REST endpoints: /api/v1/chargers                 │
│  - Socket.IO server for real-time events            │
└─────────────────────────────────────────────────────┘
           │                           │
           │ OCPP Protocol             │ Events
           ▼                           ▼
┌─────────────────────────────────────────────────────┐
│  OCPP Service (ws://localhost:8080/ocpp)            │
│  - WebSocket server for charging stations ONLY      │
│  - OCPP 1.6 protocol handler                        │
└─────────────────────────────────────────────────────┘
           │
           │ WebSocket
           ▼
┌─────────────────────────────────────────────────────┐
│  Charging Stations / Simulator                      │
│  - Physical chargers or Python simulator            │
│  - SIM-CHARGER-001 (currently connected)            │
└─────────────────────────────────────────────────────┘
```

---

## ❌ Common Mistakes to Avoid

### WRONG ❌
```typescript
// DON'T: Connect browser directly to OCPP WebSocket
const ws = new WebSocket('ws://localhost:8080/ocpp');
// This will fail: "invalid Connection header: keep-alive"
```

### CORRECT ✅
```typescript
// DO: Use REST API for charger operations
const response = await fetch('http://localhost:5000/api/v1/chargers', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// DO: Use Socket.IO for real-time updates
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') }
});
```

---

## 🧪 Test in Browser Console

Open DevTools (F12) and run:

```javascript
// 1. Test Authentication
const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@evcms.com',
    password: 'password123'
  })
});
const { data } = await loginResponse.json();
console.log('✅ Login successful:', data);
localStorage.setItem('token', data.token);

// 2. Test Charger Listing
const token = localStorage.getItem('token');
const chargersResponse = await fetch('http://localhost:5000/api/v1/chargers', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const chargers = await chargersResponse.json();
console.log('✅ Chargers:', chargers);

// 3. Test Socket.IO Connection
import('socket.io-client').then(({ io }) => {
  const socket = io('http://localhost:5000', {
    auth: { token: localStorage.getItem('token') }
  });
  
  socket.on('connect', () => {
    console.log('✅ Socket.IO connected');
  });
  
  socket.on('charger:status', (data) => {
    console.log('📡 Charger update:', data);
  });
});
```

---

## 📁 Key Files

### Services
- `src/lib/ocpp-service.ts` - OCPP operations via REST API
- `src/lib/charger-service.ts` - Charger management
- `src/lib/auth-service.ts` - Authentication

### Hooks
- `src/hooks/useChargerSocket.ts` - Socket.IO real-time updates

### Components
- `src/components/examples/ChargerIntegrationExample.tsx` - Complete example

### Configuration
- `.env.local` - Environment variables
- `package.json` - Dependencies (socket.io-client already installed)

---

## 🎯 Next Steps

### 1. Test Authentication
- Navigate to `http://localhost:3001/login`
- Login with `admin@evcms.com` / `password123`
- Verify token stored in localStorage

### 2. Test Charger Listing
```typescript
import { ocppService } from '@/lib/ocpp-service';

// Get all chargers
const chargers = await ocppService.getAvailableChargers();
console.log(chargers);
```

### 3. Test Real-time Updates
```typescript
import { useChargerSocket } from '@/hooks/useChargerSocket';

function MyComponent() {
  const { isConnected, chargerUpdates, notifications } = useChargerSocket();
  
  return (
    <div>
      <p>Socket.IO: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {notifications.map(n => <div key={n.id}>{n.message}</div>)}
    </div>
  );
}
```

### 4. Test Remote Commands
```typescript
// Start charging
const result = await ocppService.executeCommand({
  chargerId: 'SIM-CHARGER-001',
  command: 'Start Charging',
  connectorId: 1
});
console.log(result);
```

---

## 🎨 Using the Example Component

Add to any page:

```typescript
import ChargerIntegrationExample from '@/components/examples/ChargerIntegrationExample';

export default function ChargerTestPage() {
  return <ChargerIntegrationExample />;
}
```

Or create a test page:

```bash
# Create test page
New-Item -Path "src\app\test-chargers\page.tsx" -Force
```

```typescript
// src/app/test-chargers/page.tsx
import ChargerIntegrationExample from '@/components/examples/ChargerIntegrationExample';

export default function TestChargersPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Charger Integration Test</h1>
      <ChargerIntegrationExample />
    </div>
  );
}
```

Then navigate to: `http://localhost:3001/test-chargers`

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to API"
**Solution**: Verify backend is running
```powershell
# Check if backend is running
netstat -ano | findstr :5000
```

### Issue: "Socket.IO not connecting"
**Solution**: Check authentication token
```javascript
// In browser console
console.log('Token:', localStorage.getItem('token'));
```

### Issue: "No chargers found"
**Solution**: Check backend has chargers or use mock data
- Backend might be returning empty list
- Services fall back to mock data if API fails

### Issue: TypeScript errors
**Solution**: Restart TypeScript server
```
Ctrl+Shift+P → TypeScript: Restart TS Server
```

---

## 📊 Expected Results

### After Login
- Token stored in localStorage
- Redirected to dashboard
- Socket.IO connected (check console)

### Charger Management
- List of 3 chargers (CHG-001, CHG-002, CHG-003)
- Can click charger to see details
- Remote commands available

### Real-time Updates
- When simulator sends updates, notifications appear
- Charger status changes reflected immediately
- Green dot shows Socket.IO connection active

---

## 🔗 API Endpoints Reference

### Authentication
```
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Chargers
```
GET    /api/v1/chargers              # List all chargers
GET    /api/v1/chargers/:id          # Get charger details
POST   /api/v1/chargers              # Create charger
PUT    /api/v1/chargers/:id          # Update charger
DELETE /api/v1/chargers/:id          # Delete charger
POST   /api/v1/chargers/:id/command  # Execute OCPP command
```

### Socket.IO Events
```javascript
// Listen for events
socket.on('charger:status', (data) => {});
socket.on('charger:connected', (data) => {});
socket.on('charger:disconnected', (data) => {});
socket.on('session:started', (data) => {});
socket.on('session:update', (data) => {});
socket.on('session:completed', (data) => {});
socket.on('notification:new', (data) => {});
```

---

## 📖 Documentation References

- **BACKEND_INTEGRATION.md** - Complete API reference
- **CORRECT_OCPP_INTEGRATION.md** - Architecture explanation
- **FRONTEND_INTEGRATION_CHECKLIST.md** - Full integration checklist

---

## ✅ Pre-flight Checklist

- [x] Frontend running on port 3001
- [x] Backend API running on port 5000
- [x] OCPP service running on port 8080
- [x] Simulator connected (SIM-CHARGER-001)
- [x] Environment variables configured
- [x] Socket.IO client installed
- [x] Services updated to use REST API
- [x] Example component created
- [ ] **TODO: Backend team fix OCPP BootNotification handler**

---

**Status**: ✅ Frontend ready for integration testing  
**Last Updated**: November 19, 2025  
**Your Frontend**: http://localhost:3001
