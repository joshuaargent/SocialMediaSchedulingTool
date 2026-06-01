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
| Icons | Lucide React |
| Date Utilities | date-fns |
| Class Utilities | clsx |

## Getting Started

```bash
# Install dependencies
npm install

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

## License

MIT License
