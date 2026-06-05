import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { siteConfig } from '@/lib/constants';
import {
  Calendar,
  BarChart3,
  Clock,
  Share2,
  Video,
  Image,
  Zap,
  Users,
  Send,
  ArrowRight,
  TrendingUp,
  Globe,
  Shield,
  Sparkles
} from 'lucide-react';

const FORMSPREE_FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID;

// ============================================
// Homepage
// ============================================

export const metadata: Metadata = {
  title: 'Home',
  description: `${siteConfig.name} - ${siteConfig.description}. Schedule, publish, and analyze content across YouTube, TikTok, Instagram, and Facebook from one central hub.`,
};

// ============================================
// Features Data
// ============================================

const features = [
  {
    icon: Calendar,
    title: 'Content Calendar',
    description: 'Plan and visualize your content schedule. Never miss a post with our interactive calendar.',
    stat: 'Schedule Ahead',
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Schedule posts at optimal times. Set it once, publish everywhere.',
    stat: 'Save Time',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track performance across all platforms. Monitor views, engagement, and growth.',
    stat: '5+ Platforms',
  },
  {
    icon: Share2,
    title: 'Multi-Platform',
    description: 'Publish to YouTube, TikTok, Instagram, and Facebook from one hub.',
    stat: 'One Dashboard',
  },
  {
    icon: Image,
    title: 'Media Library',
    description: 'Organize your videos, thumbnails, and images. Access your assets anywhere.',
    stat: 'Cloud Storage',
  },
  {
    icon: Zap,
    title: 'Pipeline Workflow',
    description: 'Manage content from ideation to publication with our production pipeline.',
    stat: 'Streamlined',
  },
];

const stats = [
  { label: 'Platforms', value: '4', icon: Globe },
  { label: 'Features', value: '15+', icon: Sparkles },
  { label: 'Time Saved', value: 'Hours', icon: Clock },
];

// ============================================
// Homepage Component
// ============================================

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl md:text-6xl">
              Hi, I'm {siteConfig.author.name}
            </h1>
            <p className="mt-6 text-lg text-[var(--color-text-secondary)] max-w-xl">
              {siteConfig.description}. I built SMST to help content creators manage their 
              social media presence across YouTube, TikTok, Instagram, and Facebook from one 
              central hub.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/about">
                <Button size="lg">
                  Read my story
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  View dashboard
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden flex items-center justify-center">
              <div className="text-center p-8">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
                  <Video className="h-10 w-10 text-[var(--color-accent)]" />
                </div>
                <p className="mt-4 text-[var(--color-text-muted)]">Dashboard Preview</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-lg">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Beta Access</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Available now</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[var(--color-bg-secondary)] py-8">
        <div className="container">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
                  <stat.icon className="h-6 w-6 text-[var(--color-accent)]" />
                </div>
                <p className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-12 md:py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            What SMST Offers
          </h2>
          <p className="mt-4 text-[var(--color-text-secondary)]">
            Everything you need to manage your social media presence in one place.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 transition-all hover:border-[var(--color-accent)]/50"
            >
              <div className="mb-4 inline-flex rounded-lg bg-[var(--color-accent)]/10 p-3 text-[var(--color-accent)]">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
                {feature.title}
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                {feature.description}
              </p>
              <p className="mt-4 text-sm font-medium text-[var(--color-accent)]">
                {feature.stat}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-[var(--color-bg-secondary)] py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Users className="mx-auto h-12 w-12 text-[var(--color-accent)]" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Stay in the loop
            </h2>
            <p className="mt-3 text-[var(--color-text-secondary)]">
              Get the latest features, tips, and updates for SMST delivered to your inbox. 
              No spam, unsubscribe anytime.
            </p>
            
            {FORMSPREE_FORM_ID ? (
              <form
                action={`https://formspree.io/f/${FORMSPREE_FORM_ID}`}
                method="POST"
                className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
              >
                <input type="hidden" name="_subject" value="SMST Newsletter Signup" />
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full max-w-xs"
                />
                <Button type="submit">
                  <Send className="mr-2 h-4 w-4" />
                  Subscribe
                </Button>
              </form>
            ) : (
              <div className="mt-6">
                <Link href="/login">
                  <Button size="lg">Get Started Free</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
