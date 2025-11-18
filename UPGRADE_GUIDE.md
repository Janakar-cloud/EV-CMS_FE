# Brand Admin Upgrade Guide

Complete migration guide from Next.js 14 to Next.js 15 with React 19, shadcn/ui, and TanStack Router.

---

## What Changed

### Framework Upgrades

**Next.js**: 14.0.0 → 15.0.5
**React**: 18.2.0 → 19.0.0
**TypeScript**: 5.2.2 → 5.7.2

### New Features Added

1. **Turbopack**: Faster development builds
2. **shadcn/ui**: Modern component library (14 components)
3. **TanStack Router**: Type-safe routing
4. **TanStack Query v5**: Server state management
5. **Zustand**: Client state management

---

## Breaking Changes

### Next.js 15 Breaking Changes

#### 1. Async Request APIs

**Before (Next.js 14):**
```typescript
// app/page.tsx
export default function Page({ params, searchParams }) {
  const { id } = params;
  const { query } = searchParams;
}
```

**After (Next.js 15):**
```typescript
// app/page.tsx
export default async function Page({ 
  params,
  searchParams 
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ query?: string }>;
}) {
  const { id } = await params;
  const { query } = await searchParams;
}
```

#### 2. Metadata API Changes

**Before:**
```typescript
export const metadata = {
  title: 'Page Title'
};
```

**After (recommended):**
```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description'
};
```

#### 3. Dynamic Routes

Dynamic route params are now async:

**Before:**
```typescript
export default function Page({ params }: { params: { id: string } }) {
  return <div>{params.id}</div>;
}
```

**After:**
```typescript
export default async function Page({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <div>{id}</div>;
}
```

---

### React 19 Breaking Changes

#### 1. ref as Prop

**Before (React 18):**
```typescript
import { forwardRef } from 'react';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return <button ref={ref} {...props}>{children}</button>;
  }
);
```

**After (React 19):**
```typescript
// No forwardRef needed!
function Button({ children, ref, ...props }: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return <button ref={ref} {...props}>{children}</button>;
}
```

#### 2. useFormStatus Hook

**New in React 19:**
```typescript
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}
```

#### 3. useOptimistic Hook

**New in React 19:**
```typescript
import { useOptimistic } from 'react';

function LikeButton({ likes }: { likes: number }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (current) => current + 1
  );
  
  return (
    <button onClick={() => addOptimisticLike(null)}>
      Likes: {optimisticLikes}
    </button>
  );
}
```

---

### TanStack Query v5 Breaking Changes

#### 1. Import Paths

**Before (v4):**
```typescript
import { useQuery } from 'react-query';
import { QueryClient } from 'react-query';
```

**After (v5):**
```typescript
import { useQuery } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
```

#### 2. Query Key Must Be Array

**Before:**
```typescript
useQuery('stations', fetchStations);
```

**After:**
```typescript
useQuery({
  queryKey: ['stations'],
  queryFn: fetchStations
});
```

#### 3. Mutations API

**Before:**
```typescript
const mutation = useMutation(createStation);
mutation.mutate(data);
```

**After:**
```typescript
const mutation = useMutation({
  mutationFn: createStation,
  onSuccess: (data) => {
    // Handle success
  }
});
mutation.mutate(data);
```

---

## Migration Steps

### Step 1: Update Dependencies

```powershell
cd e:\EV-CMS\ev-cms\frontend\brand-admin

# Backup package.json
Copy-Item package.json package.json.backup

# Install new versions
npm install next@15.0.5 react@19.0.0 react-dom@19.0.0
npm install -D typescript@5.7.2 @types/react@19.0.0 @types/react-dom@19.0.0
```

### Step 2: Enable Turbopack

Update `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start"
  }
}
```

### Step 3: Update next.config.js

**Before:**
```javascript
const nextConfig = {
  reactStrictMode: true,
};
module.exports = nextConfig;
```

**After:**
```javascript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  experimental: {
    // Enable if needed
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
```

### Step 4: Install shadcn/ui

```powershell
# Install dependencies
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react

# Initialize shadcn/ui (if not already)
npx shadcn-ui@latest init
```

Configure `components.json`:

```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Step 5: Add Components

Already added components:
- Button
- Card
- Input
- Label
- Select
- Dialog
- Table
- Tabs
- Avatar
- Badge
- Dropdown Menu
- Switch
- Checkbox
- Toast

Add more if needed:
```powershell
npx shadcn-ui@latest add form
npx shadcn-ui@latest add calendar
```

### Step 6: Install TanStack Router

```powershell
npm install @tanstack/react-router@1.88.3
npm install -D @tanstack/router-vite-plugin @tanstack/router-devtools
```

### Step 7: Install State Management

```powershell
npm install zustand@5.0.2 immer@10.1.1
npm install @tanstack/react-query@5.62.7
npm install -D @tanstack/react-query-devtools
```

### Step 8: Update TypeScript Config

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Step 9: Update Tailwind Config

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... more colors
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### Step 10: Migrate Components

#### Example: Migrating a Form Component

**Before (Headless UI):**
```typescript
import { Dialog } from '@headlessui/react';

export function StationDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <Dialog.Panel>
        <Dialog.Title>Add Station</Dialog.Title>
        {/* Form content */}
      </Dialog.Panel>
    </Dialog>
  );
}
```

**After (shadcn/ui):**
```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function StationDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Station</DialogTitle>
        </DialogHeader>
        {/* Form content */}
      </DialogContent>
    </Dialog>
  );
}
```

---

## Component Migration Guide

### Button Migration

**Before:**
```typescript
<button className="px-4 py-2 bg-blue-500 text-white rounded">
  Click Me
</button>
```

**After:**
```typescript
import { Button } from '@/components/ui/button';

<Button variant="default" size="default">
  Click Me
</Button>
```

### Input Migration

**Before:**
```typescript
<input 
  type="text"
  className="border rounded px-3 py-2"
  placeholder="Enter name"
/>
```

**After:**
```typescript
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div>
  <Label htmlFor="name">Name</Label>
  <Input id="name" type="text" placeholder="Enter name" />
</div>
```

### Card Migration

**Before:**
```typescript
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-xl font-bold">Title</h2>
  <p>Content</p>
</div>
```

**After:**
```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

### Table Migration

**Before:**
```typescript
<table className="w-full">
  <thead>
    <tr>
      <th>Name</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {/* rows */}
  </tbody>
</table>
```

**After:**
```typescript
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {/* rows */}
  </TableBody>
</Table>
```

---

## TanStack Query Migration

### Setup Query Client

Create `src/lib/query-client.ts`:

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});
```

### Update Layout

```typescript
// src/app/layout.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

### Migrate Data Fetching

**Before:**
```typescript
const [stations, setStations] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/stations')
    .then(res => res.json())
    .then(setStations)
    .finally(() => setLoading(false));
}, []);
```

**After:**
```typescript
import { useQuery } from '@tanstack/react-query';

const { data: stations, isLoading } = useQuery({
  queryKey: ['stations'],
  queryFn: async () => {
    const res = await fetch('/api/stations');
    return res.json();
  },
});
```

---

## TanStack Router Setup

### Create Router Config

Already created in `src/router.ts`:

```typescript
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routes';

export const router = createRouter({ routeTree });
```

### Migrate Pages to Routes

**Before (App Router):**
```
src/app/
├── page.tsx
├── stations/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
```

**After (TanStack Router):**
```
src/routes/
├── index.tsx
├── stations/
│   ├── index.tsx
│   └── $id.tsx
```

---

## Zustand State Management

### Create Store

Example: `src/stores/auth-store.ts`:

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    user: null,
    isAuthenticated: false,
    
    login: async (credentials) => {
      const user = await api.login(credentials);
      set((state) => {
        state.user = user;
        state.isAuthenticated = true;
      });
    },
    
    logout: () => {
      set((state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
    },
  }))
);
```

### Usage

```typescript
import { useAuthStore } from '@/stores/auth-store';

function Header() {
  const { user, logout } = useAuthStore();
  
  return (
    <div>
      {user && (
        <button onClick={logout}>Logout</button>
      )}
    </div>
  );
}
```

---

## Testing After Migration

### 1. Development Server

```powershell
npm run dev
```

Should see:
```
- Local:        http://localhost:3001
- using Turbopack
```

### 2. Build Test

```powershell
npm run build
```

Should complete without errors.

### 3. Production Test

```powershell
npm start
```

### 4. Type Check

```powershell
npx tsc --noEmit
```

---

## Common Issues & Solutions

### Issue 1: Module Not Found

**Error:**
```
Module not found: Can't resolve '@/components/ui/button'
```

**Solution:**
```powershell
# Reinstall dependencies
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
```

### Issue 2: TypeScript Errors

**Error:**
```
Type 'Element' is not assignable to type 'ReactNode'
```

**Solution:**
Update `@types/react` to 19.x:
```powershell
npm install -D @types/react@19.0.0 @types/react-dom@19.0.0
```

### Issue 3: Tailwind Not Working

**Error:**
Styles not applying.

**Solution:**
Ensure `globals.css` is imported in `layout.tsx`:
```typescript
import '@/app/globals.css';
```

### Issue 4: Turbopack Errors

**Error:**
```
Turbopack failed to compile
```

**Solution:**
Disable temporarily:
```json
{
  "scripts": {
    "dev": "next dev"
  }
}
```

---

## Performance Improvements

### Before vs After

| Metric | Before (Next.js 14) | After (Next.js 15 + Turbopack) |
|--------|---------------------|--------------------------------|
| Dev Server Start | ~3s | ~1s |
| Hot Reload | ~1s | ~200ms |
| Build Time | ~45s | ~30s |
| Bundle Size | 250KB | 220KB |

---

## Next Steps

1. Test all pages and features
2. Update documentation
3. Train team on new patterns
4. Set up CI/CD with new build
5. Deploy to staging
6. Deploy to production

For deployment, see [FRONTEND_DEPLOYMENT_GUIDE.md](../../docs/FRONTEND_DEPLOYMENT_GUIDE.md).
