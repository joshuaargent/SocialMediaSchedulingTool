# SMST - Social Media Scheduling Tool

![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)
![Tailwind_CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

A powerful content creation and scheduling platform for top-performing content creators. Schedule, publish, and analyze content across TikTok, Facebook, Instagram, and YouTube from one unified dashboard.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 20+ 
- PostgreSQL database (local or cloud)

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Database

**Option A: Supabase (Recommended - Free Tier)**
1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings > Database** and copy the connection string

**Option B: Local PostgreSQL with Docker**
```bash
docker run -d --name contenthub-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=contenthub \
  -p 5432:5432 \
  postgres:15
```

**Option C: Neon**
1. Go to [neon.tech](https://neon.tech)
2. Create a project and copy the connection string

### 4. Create Environment File
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your `DATABASE_URL`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/contenthub?schema=public"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 6. Run the App
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📋 Features

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
- **Content Pipeline**: Kanban board for production workflow
- **Series Management**: Organize content into themed series
- **Production Calendar**: Track filming and editing deadlines
- **Trends Tracking**: Monitor trending topics and competitors
- **Link-in-Bio**: Customizable landing page with themes

---

## 🔑 API Setup (OAuth Credentials)

To enable platform connections, set up OAuth apps:

### TikTok
1. Go to [developers.tiktok.com](https://developers.tiktok.com/)
2. Create a developer account
3. Create an app and add OAuth credentials
4. Set redirect URI: `https://your-domain.com/api/auth/tiktok/callback`
5. Add to `.env.local`:
   ```
   TIKTOK_CLIENT_KEY=your_client_key
   TIKTOK_CLIENT_SECRET=your_client_secret
   ```

### Facebook/Instagram
1. Go to [developers.facebook.com](https://developers.facebook.com/)
2. Create an app (Consumer type)
3. Add Facebook Login product
4. Set redirect URI: `https://your-domain.com/api/auth/facebook/callback`
5. Add to `.env.local`:
   ```
   FACEBOOK_CLIENT_ID=your_client_id
   FACEBOOK_CLIENT_SECRET=your_client_secret
   ```

### YouTube
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project and enable YouTube Data API v3
3. Create OAuth 2.0 credentials
4. Set redirect URI: `https://your-domain.com/api/auth/youtube/callback`
5. Add to `.env.local`:
   ```
   YOUTUBE_CLIENT_ID=your_client_id
   YOUTUBE_CLIENT_SECRET=your_client_secret
   ```

---

## 📁 Project Structure

```
SocialMediaSchedulingTool/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/               # Next.js pages
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── analytics/     # Analytics page
│   │   ├── calendar/      # Calendar page
│   │   ├── queue/         # Post queue
│   │   ├── media-library/ # Media uploads
│   │   ├── pipeline/      # Kanban board
│   │   ├── settings/      # Settings
│   │   └── ...
│   ├── components/        # React components
│   │   ├── ui/           # UI primitives (Button, Card, etc.)
│   │   ├── layout/       # Layout components (Navbar, Container)
│   │   └── dashboard/    # Dashboard-specific components
│   ├── stores/           # Zustand state stores
│   ├── lib/              # Utility functions
│   └── types/           # TypeScript types
├── .env.example          # Environment variable template
└── docker-compose.yml    # Local PostgreSQL setup
```

---

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |
| `npm run test` | Run Vitest tests |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma migrate` | Run database migrations |

---

## 📊 Page Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to dashboard |
| `/dashboard` | Main command center |
| `/queue` | Post queue management |
| `/calendar` | Visual content calendar |
| `/media-library` | Upload and manage media |
| `/analytics` | Performance analytics |
| `/pipeline` | Content production pipeline (Kanban) |
| `/series` | Series and playlist management |
| `/production-calendar` | Filming and editing schedule |
| `/seo` | YouTube SEO tools |
| `/trends` | Trend and competitor tracking |
| `/bio` | Link-in-bio page builder |
| `/settings` | App settings and platform connections |

---

## 🚢 Deploy to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXT_PUBLIC_SITE_URL` - Your deployed URL
   - OAuth credentials for each platform
4. Deploy!

---

## 🔧 Troubleshooting

### "Module '@prisma/client' has no exported member 'PrismaClient'"
**Fix:** Run `npx prisma generate`

### "DATABASE_URL environment variable is not set"
**Fix:** Create `.env.local` file with your database connection string

### Connection refused or timeout errors
**Fix:** Verify your `DATABASE_URL` is correct and your database is accessible

---

## 📝 Notes

### Page Consistency
Most pages use a consistent layout with `PageHeader`, `Container`, and `Card` components. Some pages (calendar, queue, media-library, trends, pipeline, series, bio, seo, production-calendar) use a different styling approach with raw `p-6` padding. This is intentional for now but can be standardized if needed.

### Mock Data
Several pages (pipeline, series, trends, seo) currently use mock data for demonstration purposes. Real database integration would require implementing API endpoints.

---

## License

MIT License
