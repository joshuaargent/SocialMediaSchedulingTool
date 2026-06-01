# ContentHub - Social Media Command Center

![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)
![Tailwind_CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

A powerful content creation and scheduling platform for top-performing content creators. Schedule, publish, and analyze content across TikTok, Facebook, Instagram, and YouTube from one unified dashboard.

## Features

### Core Features
- **Multi-Platform Publishing**: Post to TikTok, Facebook, Instagram, and YouTube simultaneously
- **Visual Content Calendar**: See all your scheduled posts at a glance
- **Smart Scheduling**: Queue-based posting with cooldown management
- **Analytics Dashboard**: Track performance across all platforms
- **Post Composer**: Create and customize posts with platform-specific options

### Advanced Features
- **Evergreen Content**: Auto-repost content at regular intervals
- **Cooldown Management**: Smart warnings to prevent posting too frequently
- **Platform Analytics**: Per-platform engagement tracking
- **SEO Optimization**: YouTube title, description, and tag analysis
- **Hashtag Suggestions**: Trending hashtags for your content

### Multi-Tenant Architecture (v2 Ready)
- Organization-scoped data isolation
- Configurable cooldown settings per organization
- Ready for multi-user support

## Tech Stack

| Category | Technology |
|----------|-------------|
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript 6.0 |
| UI Library | React 19.2 |
| Styling | Tailwind CSS 4.2 |
| State Management | Zustand |
| Database | PostgreSQL + Prisma |
| Icons | Lucide React |
| Date Utilities | date-fns |
| Class Utilities | clsx |

## Database Setup

### Option 1: Local PostgreSQL with Docker
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your DATABASE_URL
# For local Docker: DATABASE_URL="postgresql://postgres:contenthub_password@localhost:5432/contenthub?schema=public"

# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Seed default data
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### Option 2: Supabase (Free Cloud PostgreSQL)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Update `DATABASE_URL` in `.env.local`

### Option 3: Railway.app
1. Create account at [railway.app](https://railway.app)
2. Connect GitHub repo
3. Add PostgreSQL plugin
4. Railway will auto-set `DATABASE_URL`

## Getting Started

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

Open http://localhost:3000 to view the dashboard.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to dashboard |
| `/dashboard` | Main command center |
| `/analytics` | Performance analytics |
| `/settings` | App settings and platform connections |

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |
| `npm run test` | Run Vitest |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma migrate` | Run database migrations |

## Deploy to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXT_PUBLIC_SITE_URL` - Your deployed URL
   - OAuth credentials for each platform
4. Deploy!

## License

MIT License
