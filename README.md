# EV-CMS Brand Admin Dashboard

Next.js 15 admin dashboard for EV charging station brand owners.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Janakar-cloud/ev-cms-brand-admin)

## Features

- **Station Management** - Create, update, and manage charging stations
- **Connector Management** - Monitor and control individual connectors
- **Booking Overview** - View and manage charging session bookings
- **Revenue Analytics** - Track earnings and financial metrics
- **Real-time Updates** - Live status updates via WebSocket
- **Pricing Rules** - Configure dynamic pricing strategies
- **Vehicle Management** - Manage registered vehicles

## Tech Stack

- **Next.js** 15.0.5 - React framework with App Router
- **React** 19.0.0 - UI library
- **TypeScript** 5.7.2 - Type safety
- **Tailwind CSS** 3.4.17 - Utility-first CSS
- **shadcn/ui** - Beautiful UI components
- **TanStack Router** 1.88.3 - Type-safe routing
- **TanStack Query** 5.62.7 - Server state management
- **Zustand** 5.0.2 - Client state management
- **Turbopack** - Ultra-fast bundler

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

```bash
# Clone repository
git clone https://github.com/Janakar-cloud/ev-cms-brand-admin.git
cd ev-cms-brand-admin

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your configuration
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

### Production Build

```bash
npm run build
npm start
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

Or use Vercel CLI:

```bash
npm install -g vercel
vercel login
vercel
```

### Environment Variables for Production

Required variables in Vercel:

- `NEXT_PUBLIC_API_URL` - Your backend API URL
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key

## Project Structure

```
brand-admin/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utilities and helpers
│   ├── stores/          # Zustand state stores
│   ├── routes/          # TanStack Router routes
│   └── types/           # TypeScript types
├── public/              # Static assets
├── .env.example         # Environment template
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS config
├── tsconfig.json        # TypeScript config
└── vercel.json         # Vercel deployment config
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Features Overview

### Dashboard

- Overview statistics
- Recent bookings
- Revenue charts
- Active sessions

### Stations

- Add/edit stations
- Manage connectors
- Set pricing
- Operating hours
- Amenities management

### Bookings

- View all bookings
- Filter by status
- Booking details
- Revenue tracking

### Analytics

- Revenue reports
- Usage statistics
- Popular stations
- Peak hours analysis

### Settings

- Profile management
- Notification preferences
- Payment settings
- Security options

## Documentation

- [Quick Start Guide](./QUICK_START.md)
- [Upgrade Guide](./UPGRADE_GUIDE.md)
- [Completion Summary](./COMPLETION_SUMMARY.md)
- [Deployment Guide](../docs/FRONTEND_DEPLOYMENT_GUIDE.md)

## Tech Details

### shadcn/ui Components Used

- Button, Card, Input, Label, Select
- Dialog, Dropdown Menu, Table, Tabs
- Avatar, Badge, Switch, Checkbox, Toast

### State Management

- **TanStack Query** - Server state, caching, mutations
- **Zustand** - Client state, persistent storage

### Styling

- **Tailwind CSS** - Utility classes
- **CSS Variables** - Theme system
- **Dark Mode** - Built-in support

## Performance

- **Turbopack** - 80% faster dev builds
- **Code Splitting** - Automatic route-based
- **Image Optimization** - Next.js Image component
- **Caching** - TanStack Query cache management

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting guide

## Live Demo

Production: [https://admin.ev-cms.com](https://admin.ev-cms.com)

Preview: [https://ev-cms-brand-admin.vercel.app](https://ev-cms-brand-admin.vercel.app)
