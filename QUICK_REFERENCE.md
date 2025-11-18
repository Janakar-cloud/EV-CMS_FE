# Quick Reference Guide

Essential commands and imports for the EV CMS Brand Admin Dashboard.

## 🚀 Development Commands

```bash
# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint          # Check for errors
npm run lint:fix      # Auto-fix errors

# Code Formatting
npm run format        # Format all files
npm run format:check  # Check formatting

# Type Checking
npm run type-check    # Validate TypeScript

# Testing
npm test              # Run tests
npm run test:ui       # Visual test interface
npm run test:coverage # Generate coverage report

# Docker
npm run docker:build  # Build Docker image
npm run docker:run    # Start containers
npm run docker:stop   # Stop containers
```

---

## 📦 Import Paths

### Constants & Config
```typescript
import { 
  API_CONFIG,
  API_ENDPOINTS,
  APP_ROUTES,
  STORAGE_KEYS,
  USER_ROLES,
  CHARGER_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '@/config/constants';
```

### Stores
```typescript
import { 
  useAppStore,
  useTheme,
  useSidebarCollapsed,
  useNotifications,
  useGlobalLoading
} from '@/store/useAppStore';

import { useChargerStore } from '@/store/useChargerStore';
```

### Services
```typescript
import { authService } from '@/lib/auth-service';
import { chargerService } from '@/lib/charger-service';
import { userService } from '@/lib/user-service';
import { pricingService } from '@/lib/pricing-service';
import { ocppService } from '@/lib/ocpp-service';
import { apiClient } from '@/lib/api-client';
```

### Hooks
```typescript
import { useDebounce } from '@/hooks/useDebounce';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useMediaQuery } from '@/hooks/useMediaQuery';
```

### UI Components
```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectContent } from '@/components/ui/select';
```

### Context
```typescript
import { useAuth } from '@/contexts/AuthContext';
```

### Types
```typescript
import type { AuthUser, LoginCredentials } from '@/types/auth';
import type { Charger, ChargerStatus } from '@/types/charger';
import type { User } from '@/types/user';
import type { PricingRule } from '@/types/pricing';
```

---

## 🔐 Authentication Examples

### Login
```typescript
import { authService } from '@/lib/auth-service';
import { useAuth } from '@/contexts/AuthContext';

const { login } = useAuth();

const handleLogin = async (credentials) => {
  const response = await authService.login(credentials);
  if (response.success) {
    login(response.token, response.user);
  }
};
```

### Check Auth Status
```typescript
const { isAuthenticated, user, isLoading } = useAuth();

if (isLoading) return <Loading />;
if (!isAuthenticated) return <Navigate to="/login" />;
```

### Logout
```typescript
const { logout } = useAuth();

const handleLogout = () => {
  logout();
};
```

---

## 🗄️ State Management Examples

### Global App State
```typescript
import { useAppStore } from '@/store';

function Component() {
  const { 
    sidebarCollapsed, 
    toggleSidebar,
    theme,
    setTheme 
  } = useAppStore();

  return (
    <button onClick={toggleSidebar}>
      Toggle Sidebar
    </button>
  );
}
```

### Notifications
```typescript
import { useAppStore } from '@/store';

const { addNotification } = useAppStore();

addNotification({
  type: 'success',
  title: 'Success',
  message: 'Action completed successfully'
});
```

### Charger State
```typescript
import { useChargerStore } from '@/store';

const { 
  chargers, 
  setChargers,
  selectedCharger,
  setSelectedCharger,
  filters,
  setFilters 
} = useChargerStore();
```

---

## 🌐 API Client Examples

### GET Request
```typescript
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/constants';

const users = await apiClient.get(API_ENDPOINTS.USERS.BASE);
```

### POST Request
```typescript
const newUser = await apiClient.post(API_ENDPOINTS.USERS.BASE, {
  name: 'John Doe',
  email: 'john@example.com'
});
```

### Dynamic Endpoints
```typescript
const userId = '123';
const user = await apiClient.get(API_ENDPOINTS.USERS.BY_ID(userId));

// PUT with dynamic ID
await apiClient.put(API_ENDPOINTS.USERS.BY_ID(userId), {
  name: 'Jane Doe'
});

// DELETE
await apiClient.delete(API_ENDPOINTS.USERS.BY_ID(userId));
```

---

## 🎨 Component Examples

### Form with Validation
```typescript
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('email', { required: true })}
        placeholder="Email"
      />
      {errors.email && <span>Email is required</span>}
      
      <Button type="submit">Login</Button>
    </form>
  );
}
```

### Using Constants
```typescript
import { USER_ROLES, CHARGER_STATUS } from '@/config/constants';

function UserBadge({ role }) {
  const isAdmin = role === USER_ROLES.ADMIN;
  
  return (
    <Badge variant={isAdmin ? 'default' : 'secondary'}>
      {role}
    </Badge>
  );
}
```

### Navigation
```typescript
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/config/constants';

const router = useRouter();

// Navigate to dashboard
router.push(APP_ROUTES.DASHBOARD);

// Navigate to specific charger
router.push(`${APP_ROUTES.CHARGERS}/${chargerId}`);
```

---

## 🧪 Testing Examples

### Component Test
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Hook Test
```typescript
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

it('should store value', () => {
  const { result } = renderHook(() => 
    useLocalStorage('key', 'initial')
  );

  act(() => {
    result.current[1]('updated');
  });

  expect(result.current[0]).toBe('updated');
});
```

---

## 🔄 Common Patterns

### Loading State
```typescript
const [isLoading, setIsLoading] = useState(false);

const fetchData = async () => {
  setIsLoading(true);
  try {
    const data = await apiClient.get('/endpoint');
    // Handle data
  } catch (error) {
    // Handle error
  } finally {
    setIsLoading(false);
  }
};
```

### Error Handling
```typescript
import { toast } from 'sonner';
import { ERROR_MESSAGES } from '@/config/constants';

try {
  await apiClient.post('/endpoint', data);
  toast.success('Success!');
} catch (error) {
  toast.error(ERROR_MESSAGES.SERVER_ERROR);
}
```

### Debounced Search
```typescript
import { useDebounce } from '@/hooks/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
  if (debouncedSearch) {
    // Perform search
  }
}, [debouncedSearch]);
```

### Responsive Design
```typescript
import { useMediaQuery } from '@/hooks/useMediaQuery';

const isMobile = useMediaQuery('(max-width: 640px)');
const isTablet = useMediaQuery('(max-width: 1024px)');

return (
  <div>
    {isMobile ? <MobileView /> : <DesktopView />}
  </div>
);
```

---

## 📋 Environment Variables

### Required for Development
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_OCPP_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
```

### Access in Code
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
// Or use the constant:
import { API_CONFIG } from '@/config/constants';
const apiUrl = API_CONFIG.BASE_URL;
```

---

## 🎯 File Organization

```
src/
├── app/              # Next.js pages (App Router)
├── components/       # React components
│   ├── ui/          # Base UI components (shadcn)
│   ├── auth/        # Auth-related components
│   ├── chargers/    # Charger components
│   └── ...
├── config/          # Constants and configuration
├── contexts/        # React contexts
├── hooks/           # Custom React hooks
├── lib/             # Services and utilities
├── store/           # Zustand stores
├── types/           # TypeScript types
└── __tests__/       # Test files
```

---

## 🚨 Common Issues & Solutions

### Issue: Tests failing with import errors
```bash
# Solution: Check tsconfig.json paths are correct
# Ensure vitest.config.ts has path aliases
```

### Issue: Environment variables not working
```bash
# Solution: Restart dev server after .env changes
# Ensure variables start with NEXT_PUBLIC_ for client-side
```

### Issue: Zustand state not persisting
```typescript
// Solution: Check persist middleware configuration
// Ensure storage key is unique
```

---

## 📚 Documentation Links

- **API Documentation**: `docs/API.md`
- **Service Documentation**: `docs/SERVICES.md`
- **Implementation Summary**: `IMPLEMENTATION_COMPLETE.md`
- **Quick Start**: `QUICK_START.md`
- **Contributing**: `CONTRIBUTING.md`

---

**For more help, check the documentation or create an issue in the repository.**
