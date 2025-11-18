# Brand Admin Quick Start Guide

Get the EV-CMS Brand Admin Dashboard up and running in minutes.

---

## Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: Latest version

---

## Installation

### 1. Clone Repository

```powershell
cd e:\EV-CMS
git clone https://github.com/Janakar-cloud/ev-cms-brand-admin.git
cd ev-cms-brand-admin
```

### 2. Install Dependencies

```powershell
npm install
```

This installs:
- Next.js 15.0.5
- React 19.0.0
- TypeScript 5.7.2
- Tailwind CSS 3.4.17
- shadcn/ui components
- TanStack Router 1.88.3
- TanStack Query 5.62.7
- Zustand 5.0.2

### 3. Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Get Google Maps API Key:**
1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable "Maps JavaScript API"
4. Create credentials → API key
5. Copy key to `.env.local`

---

## Running Development Server

### Start Server

```powershell
npm run dev
```

You should see:
```
- Local:        http://localhost:3001
- using Turbopack
- ready in 1.2s
```

### Open Browser

Navigate to: http://localhost:3001

---

## Project Structure

```
brand-admin/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components (14)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   └── layout/               # Layout components
│   ├── lib/
│   │   ├── utils.ts              # Utility functions
│   │   └── query-client.ts       # TanStack Query setup
│   ├── stores/                   # Zustand stores
│   ├── routes/                   # TanStack Router routes
│   └── router.ts                 # Router configuration
├── public/                       # Static files
├── package.json
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── components.json               # shadcn/ui config
```

---

## Key Features

### 1. shadcn/ui Components

Pre-installed components:
- **Button**: Variants (default, destructive, outline, ghost, link)
- **Card**: Container with header, content, footer
- **Input**: Text, email, password inputs
- **Label**: Form labels
- **Select**: Dropdown selects
- **Dialog**: Modals
- **Table**: Data tables
- **Tabs**: Tab navigation
- **Avatar**: User avatars
- **Badge**: Status badges
- **Dropdown Menu**: Context menus
- **Switch**: Toggle switches
- **Checkbox**: Checkboxes
- **Toast**: Notifications

### 2. TanStack Router

Type-safe routing with automatic code splitting.

### 3. TanStack Query

Server state management with caching, refetching, and optimistic updates.

### 4. Zustand

Lightweight client state management.

### 5. Turbopack

Ultra-fast development builds.

---

## Using Components

### Button Example

```typescript
import { Button } from '@/components/ui/button';

export function Example() {
  return (
    <div className="flex gap-2">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}
```

### Card Example

```typescript
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function StationCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Station Name</CardTitle>
        <CardDescription>Location details</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Additional information</p>
      </CardContent>
      <CardFooter>
        <Button>View Details</Button>
      </CardFooter>
    </Card>
  );
}
```

### Dialog Example

```typescript
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function AddStationDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Station</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Station</DialogTitle>
        </DialogHeader>
        {/* Form content */}
      </DialogContent>
    </Dialog>
  );
}
```

### Table Example

```typescript
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export function StationsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Station 1</TableCell>
          <TableCell>Mumbai</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

---

## Data Fetching

### Using TanStack Query

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';

interface Station {
  id: string;
  name: string;
  location: string;
}

export function StationsList() {
  const { data: stations, isLoading, error } = useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stations`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<Station[]>;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {stations?.map((station) => (
        <div key={station.id}>{station.name}</div>
      ))}
    </div>
  );
}
```

### Using Mutations

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function AddStationForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: NewStation) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['stations'] });
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutation.mutate({ name: 'New Station' });
    }}>
      {/* Form fields */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Adding...' : 'Add Station'}
      </button>
    </form>
  );
}
```

---

## State Management

### Zustand Store Example

Create `src/stores/auth-store.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### Using Store

```typescript
'use client';

import { useAuthStore } from '@/stores/auth-store';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </header>
  );
}
```

---

## Theming

### Theme System

The app uses CSS variables for theming. Customize in `src/app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... more variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark theme */
  }
}
```

### Using Theme

```typescript
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

---

## Adding New Components

### Add shadcn/ui Component

```powershell
npx shadcn-ui@latest add form
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover
```

### Create Custom Component

```typescript
// src/components/station-card.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface StationCardProps {
  name: string;
  location: string;
}

export function StationCard({ name, location }: StationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{location}</p>
      </CardContent>
    </Card>
  );
}
```

---

## Building for Production

### Build

```powershell
npm run build
```

### Start Production Server

```powershell
npm start
```

### Test Build Locally

```powershell
npm run build && npm start
```

Open: http://localhost:3001

---

## Environment Variables

### Development (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
```

### Production

Set in hosting platform (Vercel, Cloudflare, etc.):

```env
NEXT_PUBLIC_API_URL=https://api.ev-cms.com/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=production_key
```

---

## Common Tasks

### 1. Add New Page

Create `src/app/stations/page.tsx`:

```typescript
export default function StationsPage() {
  return (
    <div>
      <h1>Stations</h1>
    </div>
  );
}
```

### 2. Add API Route

Create `src/app/api/hello/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello' });
}
```

### 3. Add Middleware

Create `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add logic
  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
```

---

## Troubleshooting

### Port Already in Use

```powershell
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change port
npm run dev -- -p 3002
```

### Module Not Found

```powershell
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
```

### TypeScript Errors

```powershell
npx tsc --noEmit
```

### Clear Next.js Cache

```powershell
Remove-Item .next -Recurse -Force
npm run dev
```

---

## Development Tools

### VS Code Extensions

Recommended:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### Browser DevTools

- **React DevTools**: Debug components
- **TanStack Query DevTools**: Monitor queries
- **Network Tab**: Check API calls

---

## Next Steps

1. Explore components in `src/components/ui/`
2. Check example pages in `src/app/`
3. Set up authentication
4. Connect to backend API
5. Build your features
6. Deploy to production

For deployment guide, see [FRONTEND_DEPLOYMENT_GUIDE.md](../../docs/FRONTEND_DEPLOYMENT_GUIDE.md).

For upgrade details, see [UPGRADE_GUIDE.md](./UPGRADE_GUIDE.md).

For completion summary, see [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md).
