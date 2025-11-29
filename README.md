# EV-CMS Brand Admin Dashboard

**Version 1.0.0** | **Last Updated**: November 29, 2025

A modern, type-safe Next.js 15 admin dashboard designed for EV charging station brand owners. The platform provides full OCPP 1.6J and OCPI 2.2.1 protocol support, built with React 19, TypeScript 5.7, and real-time WebSocket monitoring capabilities.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Janakar-cloud/ev-cms-brand-admin)

---

## System Architecture

### Frontend (Port 3001)
- **Framework**: Next.js 15.0.5 with App Router & Turbopack
- **UI Library**: React 19.0.0 with Concurrent Features
- **Language**: TypeScript 5.7.2 (Strict Mode)
- **Styling**: Tailwind CSS 3.4.17 + shadcn/ui components
- **State**: Zustand 5.0.2 + TanStack Query 5.62.7
- **Real-time**: Socket.IO Client 4.8.1

### Backend Services (Microservices Architecture)

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| **Main API** | 5000 | REST + WebSocket | Core application logic, authentication, CRUD operations |
| **OCPP Service** | 8080 | WebSocket (OCPP 1.6J) | Charging station protocol, remote commands |
| **OCPI Service** | 8081 | REST (OCPI 2.2.1) | Roaming network interoperability |

### Communication Flow

```
┌──────────────────────────────────────────────────────────┐
│  Browser (Next.js Frontend - Port 3001)                  │
│  ├─ UI Components (React 19)                             │
│  ├─ Services (auth, charger, ocpp, pricing)              │
│  └─ Real-time Socket.IO Connection                       │
└──────────────────────────────────────────────────────────┘
            │                                   │
            │ REST API                          │ Socket.IO
            │ (fetch + JWT)                     │ (events)
            ▼                                   ▼
┌──────────────────────────────────────────────────────────┐
│  Main API Service (Port 5000)                            │
│  ├─ Authentication & Authorization (JWT)                 │
│  ├─ User/Station/Booking Management                      │
│  ├─ Payment Processing                                   │
│  ├─ Database Operations                                  │
│  └─ Socket.IO Server (Real-time Events)                  │
└──────────────────────────────────────────────────────────┘
            │                                   │
            │ OCPP Commands                     │ OCPI Requests
            ▼                                   ▼
┌────────────────────────┐        ┌─────────────────────────┐
│  OCPP Service (8080)   │        │  OCPI Service (8081)    │
│  ├─ WebSocket Server   │        │  ├─ Locations API       │
│  ├─ OCPP 1.6J Handler  │        │  ├─ Sessions API        │
│  ├─ Command Processor  │        │  ├─ Tokens API          │
│  └─ Event Emitter      │        │  └─ CDRs API            │
└────────────────────────┘        └─────────────────────────┘
            │
            │ WebSocket (OCPP)
            ▼
┌──────────────────────────────────────────────────────────┐
│  Charging Stations                                       │
│  ├─ Physical Chargers (ABB, Tritium, ChargePoint)       │
│  └─ Python OCPP Simulator (Test/Development)            │
└──────────────────────────────────────────────────────────┘
```

---

## Core Features

### Authentication & Authorization
- **Multiple Login Methods**:
  - Email/Password
  - Username/Password  
  - Phone/OTP (6-digit code)
- **User Roles**:
  - `admin` - System Administrator (Full Access)
  - `franchise_owner` - Franchise Owner (Station Management)
  - `partner` - Partner Manager (Limited Access)
- **Security**:
  - JWT Bearer Token Authentication
  - 24-hour token expiration
  - Session management with auto-refresh
  - Role-based access control (RBAC)

### Charging Station Management
- **Real-time Monitoring** - Live charger status via Socket.IO
- **OCPP 1.6J Commands**:
  - Remote Start/Stop Transaction
  - Reset Charger (Soft/Hard)
  - Unlock Connector
  - Clear Authorization Cache
  - Get/Change Configuration
  - Update Firmware (OTA)
  - Get Diagnostics
- **Charger Types Supported**:
  - AC (Level 2 - up to 22kW)
  - DC Fast (50-150kW)
  - DC Ultra-Fast (150-350kW)
- **Connector Types**:
  - Type 1 (J1772)
  - Type 2 (IEC 62196)
  - CCS1 (Combined Charging System)
  - CCS2 (European CCS)
  - CHAdeMO (Japanese Standard)
  - Tesla (Proprietary)

### OCPI 2.2.1 Roaming Integration
- **Location Sharing** - Share station locations with roaming partners
- **Session Management** - Cross-network charging sessions
- **CDR Exchange** - Charge Detail Record synchronization
- **Token Validation** - Remote user authorization
- **Tariff Exchange** - Pricing information sharing
- **Partner Management** - Roaming partner configuration

### Dynamic Pricing Engine
- **Pricing Models**:
  - Static (Fixed per kWh)
  - Slab-based (Tiered pricing)
  - Time-of-Use (Peak/Off-peak)
  - Hybrid (Combined models)
  - Dynamic (Real-time pricing)
- **Pricing Features**:
  - Time-based multipliers (Peak hour surcharge)
  - Location-based multipliers (Highway premium)
  - User segment discounts (Fleet, Employee)
  - Idle fee management (Grace period + per minute)
  - Session limits (Max time/energy)
  - GST/Tax configuration
  - Minimum billing amount

### Analytics & Reporting
- **Revenue Analytics**:
  - Daily/Weekly/Monthly revenue
  - Station-wise revenue breakdown
  - Revenue per kWh analysis
- **Usage Analytics**:
  - Charging session statistics
  - Peak usage hours
  - Average session duration
  - Energy consumption trends
- **Performance Metrics**:
  - Station utilization rates
  - Charger uptime/downtime
  - Average revenue per session
  - Customer satisfaction scores

### User & Vehicle Management
- **User Features**:
  - User registration & KYC
  - RFID card management
  - Vehicle registration (Multiple vehicles per user)
  - Booking history
  - Payment wallet integration
- **Vehicle Database**:
  - Make, Model, Year
  - Battery capacity
  - Connector compatibility
  - Charging curve data

### Franchise Management
- **Multi-tenant Support**:
  - Franchise onboarding workflow
  - Staff management
  - Performance tracking
  - Revenue sharing configuration
- **Franchise Analytics**:
  - Station-wise revenue
  - Customer acquisition metrics
  - Operational efficiency

### Location & Map Integration
- **Google Maps Integration**:
  - Interactive station map
  - Geocoding & reverse geocoding
  - Distance calculation
  - Route planning
- **Station Markers**:
  - Color-coded by status
  - Info windows with details
  - Clustering for dense areas

### Maintenance & Support
- **Maintenance Scheduling**:
  - Scheduled maintenance tracking
  - Preventive maintenance alerts
  - Maintenance history logs
- **Support System**:
  - Live chat widget
  - Ticket management
  - Knowledge base
  - User feedback & ratings

### Real-time Features
- **Socket.IO Events**:
  - `charger:status` - Status changes
  - `charger:connected` - Online events
  - `charger:disconnected` - Offline events
  - `session:started` - New session
  - `session:update` - Live energy/cost updates
  - `session:completed` - Session complete with CDR
  - `notification:new` - System notifications
  - `booking:update` - Booking status changes
  - `payment:status` - Payment confirmations

---

## Complete Tech Stack

### Frontend Framework & Core
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.0.5 | React framework with App Router, Turbopack, Server Components |
| **React** | 19.0.0 | UI library with Concurrent Features, Server Components, Actions |
| **TypeScript** | 5.7.2 | Type-safe development with strict mode enabled |
| **Node.js** | 18.x+ | JavaScript runtime (required) |

### UI & Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **@tailwindcss/forms** | 0.5.10 | Form styling plugin |
| **@tailwindcss/typography** | 0.5.19 | Typography plugin for rich text |
| **tailwindcss-animate** | 1.0.7 | Animation utilities |
| **tailwind-merge** | 2.6.0 | Merge Tailwind classes |
| **class-variance-authority** | 0.7.1 | Class name variants |
| **clsx** | 2.1.1 | Conditional class names |

### UI Component Libraries
| Technology | Version | Purpose |
|------------|---------|---------|
| **@headlessui/react** | 2.2.9 | Unstyled, accessible UI primitives |
| **@heroicons/react** | 2.1.5 | Beautiful hand-crafted SVG icons |
| **lucide-react** | 0.469.0 | Icon library with 1000+ icons |
| **cmdk** | 1.0.4 | Command menu component |
| **vaul** | 1.1.2 | Drawer component |
| **sonner** | 1.7.2 | Toast notifications |

### Radix UI Primitives
| Component | Version | Purpose |
|-----------|---------|---------|
| **@radix-ui/react-accordion** | 1.2.2 | Collapsible content |
| **@radix-ui/react-alert-dialog** | 1.1.4 | Modal dialogs |
| **@radix-ui/react-avatar** | 1.1.2 | User avatars |
| **@radix-ui/react-checkbox** | 1.1.3 | Checkbox inputs |
| **@radix-ui/react-dialog** | 1.1.4 | Modals & dialogs |
| **@radix-ui/react-dropdown-menu** | 2.1.4 | Dropdown menus |
| **@radix-ui/react-label** | 2.1.1 | Form labels |
| **@radix-ui/react-popover** | 1.1.4 | Popover menus |
| **@radix-ui/react-select** | 2.1.4 | Select dropdowns |
| **@radix-ui/react-separator** | 1.1.1 | Dividers |
| **@radix-ui/react-slider** | 1.2.2 | Range sliders |
| **@radix-ui/react-slot** | 1.1.1 | Slot composition |
| **@radix-ui/react-switch** | 1.1.2 | Toggle switches |
| **@radix-ui/react-tabs** | 1.1.2 | Tabbed interfaces |
| **@radix-ui/react-toast** | 1.2.4 | Toast notifications |
| **@radix-ui/react-tooltip** | 1.1.6 | Tooltips |

### State & Data Management
| Technology | Version | Purpose |
|------------|---------|---------|
| **Zustand** | 5.0.2 | Lightweight client state management (< 1KB) |
| **@tanstack/react-query** | 5.62.7 | Server state management, caching, synchronization |
| **@tanstack/react-router** | 1.88.3 | Type-safe routing with code splitting |
| **React Hook Form** | 7.54.2 | Form state management & validation |
| **@hookform/resolvers** | 3.9.1 | Validation schema resolvers |
| **Yup** | 1.6.0 | Schema validation library |

### Data Visualization & Charts
| Technology | Version | Purpose |
|------------|---------|---------|
| **Recharts** | 2.15.0 | Composable charting library |

### Maps & Location
| Technology | Version | Purpose |
|------------|---------|---------|
| **@googlemaps/js-api-loader** | 2.0.1 | Google Maps API loader |
| **@googlemaps/react-wrapper** | 1.2.0 | React wrapper for Google Maps |

### Real-time Communication
| Technology | Version | Purpose |
|------------|---------|---------|
| **socket.io-client** | 4.8.1 | WebSocket client for real-time updates |

### HTTP & API
| Technology | Version | Purpose |
|------------|---------|---------|
| **axios** | 1.7.9 | HTTP client for API requests |

### Date & Time
| Technology | Version | Purpose |
|------------|---------|---------|
| **date-fns** | 4.1.0 | Modern date utility library |

### Development Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | 9.17.0 | Code linting |
| **eslint-config-next** | 15.0.5 | Next.js ESLint configuration |
| **@typescript-eslint/eslint-plugin** | 8.18.1 | TypeScript linting rules |
| **@typescript-eslint/parser** | 8.18.1 | TypeScript parser for ESLint |
| **Prettier** | 3.4.2 | Code formatting |
| **prettier-plugin-tailwindcss** | 0.6.9 | Tailwind class sorting |
| **Husky** | 8.0.3 | Git hooks |
| **lint-staged** | 15.2.0 | Run linters on staged files |

### Testing
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vitest** | 1.0.4 | Unit testing framework (Vite-powered) |
| **@vitest/ui** | 1.0.4 | Visual test UI |
| **@vitest/coverage-v8** | 1.0.4 | Code coverage reports |
| **@testing-library/react** | 16.1.0 | React component testing |
| **@testing-library/jest-dom** | 6.6.3 | Custom jest matchers |
| **@testing-library/user-event** | 14.5.2 | User interaction simulation |
| **jsdom** | 23.0.1 | DOM implementation for testing |

### Build Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| **PostCSS** | 8.4.49 | CSS transformation |
| **Autoprefixer** | 10.4.20 | CSS vendor prefixes |
| **@vitejs/plugin-react** | 4.2.1 | Vite React plugin |
| **@tanstack/router-plugin** | 1.88.0 | TanStack Router build plugin |

### Backend Technologies (Inferred)
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | Main API Server (Port 5000) |
| **WebSocket Server** | OCPP Service (Port 8080) |
| **REST API** | OCPI Service (Port 8081) |
| **JWT** | Authentication & Authorization |
| **Socket.IO Server** | Real-time event broadcasting |
| **Database** | PostgreSQL / MongoDB (inferred) |

### Protocols & Standards
| Protocol | Version | Purpose |
|----------|---------|---------|
| **OCPP** | 1.6J | Open Charge Point Protocol for charger communication |
| **OCPI** | 2.2.1 | Open Charge Point Interface for roaming interoperability |
| **WebSocket** | RFC 6455 | Full-duplex communication |
| **REST** | - | RESTful API design |
| **JWT** | RFC 7519 | JSON Web Tokens for auth |

---

## Prerequisites

### Required Software
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** Latest version ([Download](https://git-scm.com/))
- **Python** 3.8+ (for OCPP simulator testing)

### Required Accounts & API Keys
- **Google Maps API Key** (for location features) - [Get Key](https://console.cloud.google.com)

### Backend Services (Must be Running)
- **Main API** on port 5000
- **OCPP Service** on port 8080
- **OCPI Service** on port 8081

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/Janakar-cloud/ev-cms-brand-admin.git
cd brand-admin
```

### 2. Install Dependencies

```bash
npm install
```

This installs all dependencies including:
- Next.js 15.0.5 with Turbopack
- React 19.0.0
- TypeScript 5.7.2
- Tailwind CSS & shadcn/ui
- TanStack Query & Router
- Zustand for state management

### 3. Environment Configuration

Create `.env.local` file in project root:

```env
# ============================================
# Main API Service (Port 5000)
# ============================================
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:5000

# ============================================
# OCPP Service (Port 8080)
# ============================================
NEXT_PUBLIC_OCPP_API_URL=http://localhost:8080
NEXT_PUBLIC_OCPP_WS_URL=ws://localhost:8080/ocpp

# ============================================
# OCPI Service (Port 8081)
# ============================================
NEXT_PUBLIC_OCPI_BASE_URL=http://localhost:8081/ocpi
NEXT_PUBLIC_OCPI_VERSION_URL=http://localhost:8081/ocpi/2.2.1

# ============================================
# Google Maps Configuration
# ============================================
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# ============================================
# App Configuration
# ============================================
NEXT_PUBLIC_APP_NAME=EV-CMS Admin
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENV=development

# ============================================
# Optional: Feature Flags
# ============================================
NEXT_PUBLIC_ENABLE_OCPP=true
NEXT_PUBLIC_ENABLE_OCPI=true
NEXT_PUBLIC_ENABLE_PAYMENTS=true
```

**Getting Your Google Maps API Key:**
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable "Maps JavaScript API" and "Places API"
4. Go to Credentials, then Create credentials, and select API key
5. Copy key and paste in `.env.local`
6. For added security, consider restricting the key to your domain

**Production Environment Variables:**
When deploying to production, update these URLs to match your environment:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourcompany.com/v1
NEXT_PUBLIC_WS_URL=wss://api.yourcompany.com
NEXT_PUBLIC_OCPP_WS_URL=wss://ocpp.yourcompany.com
NEXT_PUBLIC_OCPI_URL=https://ocpi.yourcompany.com/ocpi/2.2.1
```

### 4. Start Development Server

```bash
npm run dev
```

Output:
```
▲ Next.js 15.5.6 (Turbopack)
- Local:        http://localhost:3001
- Network:      http://192.168.1.x:3001
✓ Ready in 1.2s
```

### 5. Access Application

Open your browser and navigate to: **http://localhost:3001**

**Default Test Credentials:**

| Role | Email/Username | Password | Access Level |
|------|----------------|----------|--------------|
| **Admin** | `admin001` or `admin@evcms.com` | `admin123` | Full system access |
| **Franchise Owner** | `franchise001` or `franchise.owner@evcms.com` | `franchise123` | Station management |
| **Partner** | `partner001` or `partner@evcms.com` | `partner123` | Limited access |

**Supported Login Methods:**
- **Email + Password** (e.g., `admin@evcms.com`)
- **Username + Password** (e.g., `admin001`)  
- **Phone + OTP** (e.g., `+1234567890` - OTP will be sent to console)

**OTP Login Process:**
1. Enter phone number
2. Click "Send OTP"
3. Check terminal/console for 6-digit code
4. Enter OTP within 10 minutes
5. You will be automatically logged in upon successful verification

---

## Authentication & User Management

### Authentication Flow

```typescript
// Login with Email/Password
POST http://localhost:5000/api/v1/auth/login
{
  "identifier": "admin@evcms.com",  // or "admin001" or "+1234567890"
  "password": "admin123",
  "loginMethod": "email"            // or "username" or "phone"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "username": "admin001",
      "email": "admin@evcms.com",
      "fullName": "System Administrator",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### OTP Authentication

```typescript
// Step 1: Request OTP
POST http://localhost:5000/api/v1/auth/otp/send
{
  "identifier": "+1234567890",
  "type": "login"  // or "password_reset"
}

// Step 2: Verify OTP
POST http://localhost:5000/api/v1/auth/otp/verify
{
  "identifier": "+1234567890",
  "otp": "123456",
  "type": "login"
}
```

### User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **admin** | Full system access, user management, all station control, analytics, settings |
| **franchise_owner** | Manage owned stations, view revenue, add staff, view analytics |
| **partner** | View assigned stations, limited reporting, no financial data |

### Protected Routes

All API calls require JWT token in header:
```typescript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

---

## API Integration & Endpoints Reference

### Backend Microservices Architecture

| Service | Port | Protocol | Purpose | Status |
|---------|------|----------|---------|--------|
| **Main API** | 5000 | REST + Socket.IO | Authentication, CRUD operations, Payments, Real-time events | Active |
| **OCPP Service** | 8080 | WebSocket (OCPP 1.6J) | Charger communication protocol for EV charging stations | Active |
| **OCPI Service** | 8081 | REST (OCPI 2.2.1) | Roaming protocol for inter-network charging | Planned |

### Authentication API (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required | Role Access |
|--------|----------|-------------|---------------|-------------|
| `POST` | `/login` | Login with email/username/phone | No | All |
| `POST` | `/otp/send` | Send OTP to phone number | No | All |
| `POST` | `/otp/verify` | Verify OTP code | No | All |
| `POST` | `/logout` | End user session | Yes | All |
| `POST` | `/refresh` | Refresh JWT token | Yes | All |
| `GET` | `/me` | Get current user profile | Yes | All |
| `PUT` | `/me` | Update current user profile | Yes | All |

**Example - Login:**
```typescript
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "identifier": "admin@evcms.com",  // Email, username, or phone
  "password": "admin123",
  "loginMethod": "email"            // 'email' | 'username' | 'phone'
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "user": {
      "id": "user_001",
      "role": "admin",
      "email": "admin@evcms.com",
      "name": "Admin User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400  // 24 hours
  }
}
```

### Charging Stations API (`/api/v1/stations`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/stations` | List all charging stations | Yes | All |
| `GET` | `/stations/:id` | Get station details | Yes | All |
| `POST` | `/stations` | Create new charging station | Yes | Admin, Franchise Owner |
| `PUT` | `/stations/:id` | Update station information | Yes | Admin, Franchise Owner |
| `DELETE` | `/stations/:id` | Delete charging station | Yes | Admin |
| `GET` | `/stations/:id/chargers` | List all chargers in station | Yes | All |
| `POST` | `/stations/:id/chargers` | Add charger to station | Yes | Admin, Franchise Owner |
| `GET` | `/stations/:id/analytics` | Get station analytics | Yes | Admin, Franchise Owner |
| `GET` | `/stations/:id/revenue` | Get revenue statistics | Yes | Admin, Franchise Owner |

**Example - Create Station:**
```typescript
POST http://localhost:5000/api/v1/stations
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "Downtown Charging Hub",
  "address": "123 Main Street, City, State 12345",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "capacity": 4,
  "amenities": ["parking", "wifi", "restroom", "cafe"],
  "operatingHours": "24/7"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "id": "STN-001",
    "name": "Downtown Charging Hub",
    "status": "active",
    "createdAt": "2024-11-29T10:00:00Z"
  }
}
```

### Chargers API (`/api/v1/chargers`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/chargers` | List all chargers | Yes | All |
| `GET` | `/chargers/:id` | Get charger details & status | Yes | All |
| `POST` | `/chargers` | Register new charger | Yes | Admin, Franchise Owner |
| `PUT` | `/chargers/:id` | Update charger configuration | Yes | Admin, Franchise Owner |
| `DELETE` | `/chargers/:id` | Remove charger | Yes | Admin |
| `POST` | `/chargers/:id/start` | Start charging session | Yes | All |
| `POST` | `/chargers/:id/stop` | Stop charging session | Yes | All |
| `GET` | `/chargers/:id/status` | Get real-time charger status | Yes | All |
| `POST` | `/chargers/:id/reset` | Reset charger (soft/hard) | Yes | Admin, Franchise Owner |
| `POST` | `/chargers/:id/unlock` | Emergency unlock connector | Yes | Admin, Franchise Owner |
| `POST` | `/chargers/:id/firmware` | Update firmware (OTA) | Yes | Admin |
| `GET` | `/chargers/:id/diagnostics` | Download diagnostics | Yes | Admin, Franchise Owner |

**Example - Start Charging:**
```typescript
POST http://localhost:5000/api/v1/chargers/CHG-001/start
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "connectorId": 1,
  "userId": "user_123",
  "idTag": "RFID-4567890",
  "paymentMethod": "wallet"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "sessionId": "SESS-789",
    "chargerId": "CHG-001",
    "connectorId": 1,
    "startTime": "2024-11-29T10:30:00Z",
    "status": "charging",
    "initialCost": 0
  }
}
```

### Charging Sessions API (`/api/v1/sessions`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/sessions` | List all user sessions | Yes | All |
| `GET` | `/sessions/:id` | Get session details | Yes | All |
| `POST` | `/sessions` | Create new charging session | Yes | All |
| `PUT` | `/sessions/:id` | Update session info | Yes | All |
| `POST` | `/sessions/:id/stop` | Stop active charging session | Yes | All |
| `GET` | `/sessions/:id/cdr` | Get Charge Detail Record (CDR) | Yes | All |
| `GET` | `/sessions/active` | List all active sessions | Yes | Admin |

**Example - Get CDR:**
```typescript
GET http://localhost:5000/api/v1/sessions/SESS-789/cdr
Authorization: Bearer <your_token>

// Response (200 OK)
{
  "success": true,
  "data": {
    "sessionId": "SESS-789",
    "chargerId": "CHG-001",
    "startTime": "2024-11-29T10:30:00Z",
    "endTime": "2024-11-29T11:45:00Z",
    "duration": 75,  // minutes
    "energyDelivered": 23.5,  // kWh
    "totalCost": 352.50,  // INR
    "paymentStatus": "completed"
  }
}
```

### Bookings API (`/api/v1/bookings`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/bookings` | List user bookings | Yes | All |
| `GET` | `/bookings/:id` | Get booking details | Yes | All |
| `POST` | `/bookings` | Create new booking | Yes | All |
| `PUT` | `/bookings/:id` | Update booking | Yes | All |
| `DELETE` | `/bookings/:id` | Cancel booking | Yes | All |
| `POST` | `/bookings/:id/confirm` | Confirm booking | Yes | User |

### Payments API (`/api/v1/payments`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/payments` | List payment history | Yes | All |
| `GET` | `/payments/:id` | Get payment details | Yes | All |
| `POST` | `/payments/initiate` | Initiate new payment | Yes | All |
| `POST` | `/payments/:id/confirm` | Confirm payment | Yes | All |
| `GET` | `/payments/:id/status` | Check payment status | Yes | All |
| `POST` | `/payments/:id/refund` | Process refund | Yes | Admin |

### Users API (`/api/v1/users`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/users` | List all users (paginated) | Yes | Admin |
| `GET` | `/users/:id` | Get user details | Yes | Admin |
| `POST` | `/users` | Create new user | Yes | Admin |
| `PUT` | `/users/:id` | Update user information | Yes | Admin |
| `DELETE` | `/users/:id` | Delete user account | Yes | Admin |
| `POST` | `/users/:id/block` | Block user account | Yes | Admin |
| `POST` | `/users/:id/unblock` | Unblock user account | Yes | Admin |
| `GET` | `/users/:id/sessions` | Get user session history | Yes | Admin |
| `GET` | `/users/:id/vehicles` | Get user vehicles | Yes | Admin |

### Admin API (`/api/v1/admin`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/admin/stats` | Get system statistics | Yes | Admin |
| `GET` | `/admin/logs` | View system logs | Yes | Admin |
| `GET` | `/admin/reports` | Generate system reports | Yes | Admin |
| `GET` | `/admin/analytics` | View system-wide analytics | Yes | Admin |
| `POST` | `/admin/broadcast` | Send system-wide notification | Yes | Admin |

### Socket.IO Real-Time Events

#### Connection & Authentication

```typescript
import { io } from 'socket.io-client';

// Connect to WebSocket server
const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
  auth: {
    token: localStorage.getItem('token')
  },
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000
});

// Handle connection
socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

#### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `authenticate` | `{ token: string }` | Authenticate WebSocket connection |
| `subscribe:charger` | `{ chargerId: string }` | Subscribe to charger updates |
| `unsubscribe:charger` | `{ chargerId: string }` | Unsubscribe from charger updates |
| `subscribe:station` | `{ stationId: string }` | Subscribe to station updates |
| `subscribe:session` | `{ sessionId: string }` | Subscribe to session live updates |

#### Server → Client Events

| Event | Payload | Description | Frequency |
|-------|---------|-------------|-----------|
| `charger:status` | `{ chargerId, status, timestamp }` | Charger status changed | On change |
| `charger:connected` | `{ chargerId, timestamp }` | Charger came online | On connect |
| `charger:disconnected` | `{ chargerId, timestamp }` | Charger went offline | On disconnect |
| `session:started` | `{ sessionId, chargerId, userId, startTime }` | New charging session | On start |
| `session:update` | `{ sessionId, energy, cost, power, duration }` | Live session metrics | Every 30s |
| `session:completed` | `{ sessionId, totalEnergy, totalCost, duration }` | Session ended | On stop |
| `gun:statusChange` | `{ chargerId, gunId, status, connectorType }` | Gun status changed | On change |
| `notification:new` | `{ type, message, severity, timestamp }` | New notification | On event |
| `alert` | `{ type, message, severity, chargerId? }` | System alert | On alert |

**Example - Real-Time Session Monitoring:**

```typescript
// Subscribe to charger updates
socket.emit('subscribe:charger', { chargerId: 'CHG-001' });

// Listen for charger status
socket.on('charger:status', (data) => {
  console.log(`Charger ${data.chargerId}: ${data.status}`);
  // Update UI: Available, Charging, Faulted, Unavailable
});

// Listen for session updates (live energy/cost)
socket.on('session:update', (data) => {
  console.log(`
    Session: ${data.sessionId}
    Energy: ${data.energy} kWh
    Cost: ₹${data.cost}
    Power: ${data.power} kW
    Duration: ${data.duration} mins
  `);
  // Update dashboard with real-time metrics
});

// Listen for session completion
socket.on('session:completed', (data) => {
  console.log(`Session ${data.sessionId} completed`);
  console.log(`Total Energy: ${data.totalEnergy} kWh`);
  console.log(`Total Cost: ₹${data.totalCost}`);
  // Show completion notification, generate CDR
});

// Handle gun status changes
socket.on('gun:statusChange', (data) => {
  console.log(`Gun ${data.gunId} on charger ${data.chargerId}: ${data.status}`);
  // Update connector UI: Idle, Connected, Charging, Error
});

// Cleanup on unmount
useEffect(() => {
  return () => {
    socket.emit('unsubscribe:charger', { chargerId: 'CHG-001' });
    socket.disconnect();
  };
}, []);
```

---

## Project Structure

```
brand-admin/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Dashboard (home)
│   │   ├── login/                    # Authentication
│   │   ├── chargers/                 # Charger management
│   │   │   ├── page.tsx              # Charger list
│   │   │   ├── add/                  # Add new charger
│   │   │   ├── control/              # OCPP control panel
│   │   │   ├── monitoring/           # Real-time monitoring
│   │   │   └── maintenance/          # Maintenance logs
│   │   ├── locations/                # Station locations
│   │   ├── users/                    # User management
│   │   ├── franchises/               # Franchise management
│   │   ├── roaming/                  # OCPI roaming
│   │   │   ├── partners/             # OCPI partners
│   │   │   ├── sessions/             # Roaming sessions
│   │   │   └── settlement/           # Financial settlement
│   │   ├── pricing/                  # Dynamic pricing
│   │   ├── analytics/                # Reports & analytics
│   │   ├── vehicles/                 # Vehicle management
│   │   └── support/                  # Support & tickets
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components (26+)
│   │   ├── layout/                   # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── auth/                     # Authentication forms
│   │   ├── chargers/                 # Charger components
│   │   ├── locations/                # Map & location
│   │   ├── dashboard/                # Dashboard widgets
│   │   └── monitoring/               # Monitoring views
│   ├── lib/
│   │   ├── auth-service.ts           # Authentication service
│   │   ├── charger-service.ts        # Charger operations
│   │   ├── ocpp-service.ts           # OCPP protocol handler
│   │   ├── user-service.ts           # User management
│   │   ├── pricing-service.ts        # Pricing engine
│   │   ├── gun-monitoring-service.ts # Real-time monitoring
│   │   ├── api-client.ts             # API client wrapper
│   │   └── utils.ts                  # Utilities
│   ├── config/
│   │   └── constants.ts              # App-wide constants
│   ├── store/
│   │   ├── useAppStore.ts            # Global app state
│   │   └── useChargerStore.ts        # Charger state
│   ├── contexts/
│   │   └── AuthContext.tsx           # Auth context provider
│   ├── types/
│   │   ├── auth.ts                   # Auth types
│   │   ├── charger.ts                # Charger types
│   │   ├── user.ts                   # User types
│   │   ├── pricing.ts                # Pricing types
│   │   └── index.ts                  # Shared types
│   ├── __tests__/                    # Test files
│   │   ├── components/               # Component tests
│   │   ├── hooks/                    # Hook tests
│   │   └── services/                 # Service tests
│   └── middleware.ts                 # Auth middleware
├── public/                           # Static assets
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md               # System architecture & design
│   ├── TESTING_GUIDE.md              # Complete testing guide
│   ├── SIMULATOR_QUICK_START.md      # OCPP simulator setup
│   ├── API.md                        # API documentation
│   └── SERVICES.md                   # Service layer docs
├── tools/
│   └── ocpp-simulator.py             # OCPP 1.6 charge point simulator
├── .github/
│   └── workflows/
│       └── ci-cd.yml                 # CI/CD pipeline
├── .env.example                      # Environment template
├── .editorconfig                     # Editor configuration
├── .eslintrc.json                    # ESLint config
├── .prettierrc                       # Prettier config
├── components.json                   # shadcn/ui config
├── docker-compose.yml                # Docker Compose
├── Dockerfile                        # Docker image
├── next.config.js                    # Next.js config
├── tailwind.config.js                # Tailwind config
├── tsconfig.json                     # TypeScript config
├── vitest.config.ts                  # Vitest config
└── package.json                      # Dependencies
```

---

## shadcn/ui Components

### Installed Components (26+)

**Form Elements:**
- Button, Input, Label, Select, Checkbox, Switch, Slider, Textarea

**Layout:**
- Card, Separator, Tabs, Accordion

**Overlays:**
- Dialog, Alert Dialog, Popover, Dropdown Menu, Tooltip, Toast

**Data Display:**
- Table, Avatar, Badge

**Utilities:**
- Command (cmdk), Vaul (drawer)

### Adding More Components

```bash
npx shadcn-ui@latest add form
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add data-table
```

---

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (Turbopack)
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check formatting
npm run type-check       # TypeScript validation

# Testing
npm test                 # Run tests
npm run test:ui          # Test UI dashboard
npm run test:coverage    # Coverage report

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Start containers
npm run docker:stop      # Stop containers
```

### Component Example

```tsx
// src/components/station-card.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StationCardProps {
  name: string;
  status: 'online' | 'offline';
  connectors: number;
}

export function StationCard({ name, status, connectors }: StationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {name}
          <Badge variant={status === 'online' ? 'success' : 'destructive'}>
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {connectors} connectors available
        </p>
        <Button className="mt-4" variant="outline">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Data Fetching with TanStack Query

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';

export function ChargerList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['chargers'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chargers`);
      if (!res.ok) throw new Error('Failed to fetch chargers');
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30s
  });

  if (isLoading) return <div>Loading chargers...</div>;
  if (error) return <div>Error loading chargers</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data?.map((charger) => (
        <ChargerCard key={charger.id} {...charger} />
      ))}
    </div>
  );
}
```

### State Management with Zustand

```tsx
// src/store/use-session-store.ts
import { create } from 'zustand';

interface Session {
  id: string;
  chargerId: string;
  userId: string;
  startTime: Date;
  energy: number;
}

interface SessionStore {
  activeSessions: Session[];
  addSession: (session: Session) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  removeSession: (id: string) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  activeSessions: [],
  
  addSession: (session) =>
    set((state) => ({
      activeSessions: [...state.activeSessions, session],
    })),
    
  updateSession: (id, updates) =>
    set((state) => ({
      activeSessions: state.activeSessions.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),
    
  removeSession: (id) =>
    set((state) => ({
      activeSessions: state.activeSessions.filter((s) => s.id !== id),
    })),
}));
```

---

## Testing OCPP/OCPI

### Quick Start with Python Simulator

The quickest way to test your OCPP implementation is using our Python simulator:

```bash
# Install dependencies
pip install ocpp websockets

# Run simulator
cd tools
python ocpp-simulator.py --id TEST-CP-001 --url ws://localhost:3001/ocpp
```

The simulator provides comprehensive OCPP functionality:
- Boot Notification & Registration
- Heartbeat (every 30 seconds)
- Remote Start/Stop Transaction
- Meter Values (7.4 kW charging simulation)
- Status Notifications
- Response to Remote Commands (Reset, Unlock, etc.)

### Testing Workflow

1. **Start the simulator**
   ```bash
   python tools/ocpp-simulator.py --id TEST-CP-001 --url ws://localhost:3001/ocpp
   ```

2. **Open Brand Admin**
   - Navigate to: http://localhost:3001/chargers/control
   - Select charger: `TEST-CP-001`

3. **Test Remote Commands**
   - Start Charging → Watch transaction begin
   - Monitor meter values → See energy consumption
   - Stop Charging → View final CDR

### Using SteVe (Full Test Environment)

For complete OCPP testing with Web UI:

```bash
# Clone SteVe
git clone https://github.com/steve-community/steve.git
cd steve

# Configure (edit application-prod.properties)
# Build and run
./mvnw package
java -jar target/steve.war
```

Access SteVe at: http://localhost:8080/steve/manager

**Additional Resources:**
- [Complete Testing Guide](docs/TESTING_GUIDE.md)
- [Simulator Quick Start](docs/SIMULATOR_QUICK_START.md)
- [System Architecture](docs/ARCHITECTURE.md)

### Run Unit Tests

```bash
# Run all tests
npm test

# Run OCPP tests
npm test src/__tests__/services/ocpp-service.test.ts

# Run with coverage
npm run test:coverage
```

---

## OCPP Integration

### Supported Commands

- **Start/Stop Charging** - Remote transaction control
- **Reset Charger** - Soft/hard reset
- **Reboot Charger** - Full system reboot
- **Unlock Connector** - Emergency unlock
- **Clear Cache** - Authorization cache clearing
- **Update Firmware** - OTA firmware updates
- **Change Configuration** - Remote configuration
- **Get Diagnostics** - Download diagnostics
- **Heartbeat Monitoring** - Connection health

### OCPP Service Usage

```tsx
import { ocppService } from '@/lib/ocpp-service';

// Start charging
const result = await ocppService.executeCommand({
  chargerId: 'CH-001',
  command: 'Start Charging',
  connectorId: 1,
  parameters: {
    idTag: 'USER-123',
  },
});

// Get charger status
const status = await ocppService.getChargerStatus('CH-001');
console.log(status); // { status: 'Available', connectors: [...] }
```

### WebSocket Connection

```tsx
// Connect to OCPP WebSocket
await ocppService.connectWebSocket();

// Disconnect
ocppService.disconnectWebSocket();
```

---

## OCPI Roaming

### Features (Planned)

- **Location Sharing** - Share station locations with partners
- **Session Management** - Cross-network charging sessions
- **CDR Exchange** - Charge Detail Record synchronization
- **Token Validation** - Roaming user authorization
- **Tariff Exchange** - Pricing information sharing

### OCPI Endpoints (To be implemented)

```
/ocpi/2.2/locations     # Location data
/ocpi/2.2/sessions      # Session management
/ocpi/2.2/cdrs          # Charge Detail Records
/ocpi/2.2/tokens        # Token validation
/ocpi/2.2/tariffs       # Tariff information
```

---

## Production Build

### Build Application

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Test Build Locally

```bash
npm run build && npm start
```

Server runs on: **http://localhost:3001**

---

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import in Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import repository
   - Add environment variables
   - Deploy

**Or use Vercel CLI:**

```bash
npm install -g vercel
vercel login
vercel
```

### Environment Variables for Production

Required in Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://api.ev-cms.com/api/v1
NEXT_PUBLIC_OCPP_API_URL=https://ocpp.ev-cms.com
NEXT_PUBLIC_OCPI_API_URL=https://ocpi.ev-cms.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_key
NEXT_PUBLIC_WS_URL=wss://ws.ev-cms.com
```

### Docker Deployment

```bash
# Build image
docker build -t ev-cms-admin .

# Run container
docker run -p 3001:3001 ev-cms-admin

# Or use Docker Compose
docker-compose up -d
```

---

## Testing & Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack (port 3001)
npm run build            # Build for production
npm start                # Start production server
npm run type-check       # TypeScript validation

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues automatically
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without changes

# Testing
npm test                 # Run tests in watch mode
npm run test:ui          # Open Vitest UI dashboard
npm run test:coverage    # Generate coverage report

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Start containers with docker-compose
npm run docker:stop      # Stop containers
```

### Backend API Testing

#### Check Backend Services

```powershell
# PowerShell
netstat -ano | findstr ":5000 :8080 :8081"

# Should show:
# TCP    0.0.0.0:5000    LISTENING    <PID>  # Main API
# TCP    0.0.0.0:8080    LISTENING    <PID>  # OCPP
# TCP    0.0.0.0:8081    LISTENING    <PID>  # OCPI
```

#### Test REST API Endpoints

```bash
# Health Check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@evcms.com","password":"admin123","loginMethod":"email"}'

# Get Chargers (requires token)
curl http://localhost:5000/api/v1/chargers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### OCPP Testing with Python Simulator

#### Install Dependencies

```bash
pip install ocpp==2.1.0 websockets==15.0.1
```

#### Run Simulator

```powershell
# Navigate to tools directory
cd E:\EV_CMS_FE\brand-admin\tools

# Start simulator
python ocpp-simulator.py --id TEST-CHARGER-001 --url ws://localhost:8080/ocpp

# Expected Output:
# Connected to OCPP Service
# Sent Boot Notification
# Heartbeat started (every 30s)
# Status: Available
```

#### OCPP Simulator Features

- **Boot Notification** - Register charger with backend
- **Heartbeat** - Keep-alive (every 30s)
- **Status Notification** - Report charger availability
- **Start Transaction** - Begin charging session
- **Stop Transaction** - End charging session
- **Meter Values** - Report energy consumption
- **Remote Commands** - Accept Reset, Unlock, etc.

#### View Simulator in Dashboard

1. Open: http://localhost:3001/chargers/monitoring
2. Find: `TEST-CHARGER-001`
3. Status: **Available** / **Online**
4. Actions: Start/Stop charging, Reset, Unlock

### OCPI Testing

```bash
# List Versions
curl http://localhost:8081/ocpi/versions

# Get Locations
curl http://localhost:8081/ocpi/2.2.1/locations

# Get Sessions
curl http://localhost:8081/ocpi/2.2.1/sessions

# Get CDRs (Charge Detail Records)
curl http://localhost:8081/ocpi/2.2.1/cdrs
```

### Unit Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test src/__tests__/services/auth-service.test.ts

# Run with coverage
npm run test:coverage

# Open coverage report
start coverage/index.html  # Windows
```

#### Test Structure

```
src/__tests__/
├── components/          # Component tests
│   ├── Button.test.tsx
│   ├── Card.test.tsx
│   └── LoginForm.test.tsx
├── hooks/               # Custom hook tests
│   ├── useDebounce.test.ts
│   ├── useLocalStorage.test.ts
│   └── useMediaQuery.test.ts
└── services/            # Service layer tests
    ├── auth-service.test.ts
    ├── ocpp-service.test.ts
    └── ocpi-service.test.ts
```

---

## Theming

### CSS Variables

Customize in `src/app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}
```

### Theme Toggle

```tsx
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3002
```

### Clear Cache

```bash
# Remove build artifacts
Remove-Item .next -Recurse -Force

# Reinstall dependencies
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
```

### TypeScript Errors

```bash
npm run type-check
```

---

## Documentation

- **[Architecture Guide](./docs/ARCHITECTURE.md)** - System architecture, OCPP/OCPI details
- **[API Documentation](./docs/API.md)** - Complete API reference
- **[Service Layer](./docs/SERVICES.md)** - Service documentation
- **[Quick Reference](./QUICK_REFERENCE.md)** - Commands & imports cheat sheet
- **[Security Guide](./SECURITY.md)** - Security best practices
- **[Contributing](./CONTRIBUTING.md)** - Contribution guidelines
- **[Changelog](./CHANGELOG.md)** - Version history

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## License

MIT License - see [LICENSE](./LICENSE) file

---

## Support

- **Issues**: [GitHub Issues](https://github.com/Janakar-cloud/ev-cms-brand-admin/issues)
- **Documentation**: Check `/docs` folder
- **Email**: support@ev-cms.com

---

## Live Demos

- **Production**: [https://admin.ev-cms.com](https://admin.ev-cms.com)
- **Staging**: [https://staging.ev-cms.com](https://staging.ev-cms.com)

---

## Roadmap

- [x] OCPP 1.6J implementation
- [x] Real-time monitoring dashboard
- [x] Franchise management
- [ ] OCPP 2.0.1 full implementation
- [ ] OCPI 2.2.1 roaming integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics with ML
- [ ] White-label customization

---

**Built with ❤️ using Next.js 15 & React 19**
