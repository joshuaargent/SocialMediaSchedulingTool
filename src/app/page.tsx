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
  TrendingUp,
  Globe,
  Shield,
  Sparkles,
  Play,
  ArrowRight
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
  { label: 'Platforms', value: '4', description: 'YouTube, TikTok, Instagram, Facebook' },
  { label: 'Time Saved', value: 'Hours', description: 'Per week on average' },
  { label: 'Features', value: '15+', description: 'Powerful tools included' },
];

const platforms = [
  { name: 'YouTube', color: 'bg-red-500' },
  { name: 'TikTok', color: 'bg-black' },
  { name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400' },
  { name: 'Facebook', color: 'bg-blue-600' },
];

// ============================================
// Homepage Component
// ============================================

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="animate-fade-in text-4xl font-bold tracking-tight text-text-primary sm:text-5xl md:text-6xl">
            {siteConfig.name}
          </h1>
          <p className="animate-slide-up stagger-1 mt-6 text-lg text-text-secondary md:text-xl max-w-2xl mx-auto">
            {siteConfig.description}. Schedule, publish, and analyze content across 
            YouTube, TikTok, Instagram, and Facebook from one central hub.
          </p>
          <div className="animate-slide-up stagger-2 mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="bg-bg-secondary py-8">
        <div className="container">
          <p className="animate-fade-in stagger-2 text-center text-sm font-medium uppercase tracking-wider text-text-muted mb-4">
            Supported Platforms
          </p>
          <div className="animate-slide-up stagger-3 flex flex-wrap items-center justify-center gap-4">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-white text-sm font-medium shadow-sm"
                style={{ background: platform.color.startsWith('bg-gradient') ? undefined : undefined }}
                data-gradient={platform.color.includes('gradient') ? true : undefined}
              >
                <Globe className="h-4 w-4" />
                {platform.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className={`animate-slide-up stagger-${index + 1} text-center p-6 rounded-2xl border border-border bg-bg-card hover:border-primary/50 transition-all`}
            >
              <p className="text-3xl font-bold text-gradient-primary">{stat.value}</p>
              <p className="mt-1 text-lg font-medium text-text-primary">{stat.label}</p>
              <p className="mt-1 text-sm text-text-muted">{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-bg-secondary py-12 md:py-16">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="animate-fade-in text-3xl font-bold tracking-tight text-text-primary">
              Everything you need
            </h2>
            <p className="animate-slide-up stagger-1 mt-4 text-text-secondary">
              Powerful tools designed for content creators who want to streamline their workflow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`animate-slide-up stagger-${(index % 6) + 1} group rounded-2xl border border-border bg-bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/50`}
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="text-text-secondary">
                  {feature.description}
                </p>
                <p className="mt-4 text-sm font-medium text-primary">
                  {feature.stat}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="animate-fade-in text-3xl font-bold tracking-tight text-text-primary">
              Built for content creators
            </h2>
            <p className="animate-slide-up stagger-1 mt-4 text-lg text-text-secondary">
              {siteConfig.name} is designed by a content creator, for content creators. 
              Every feature is built with real-world needs in mind.
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="animate-slide-up stagger-2 flex items-start gap-3">
                <div className="mt-1 rounded-full bg-primary/10 p-1.5">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Secure & Private</h3>
                  <p className="text-sm text-text-secondary">
                    Your data is secure. We never share your information with third parties.
                  </p>
                </div>
              </div>
              
              <div className="animate-slide-up stagger-3 flex items-start gap-3">
                <div className="mt-1 rounded-full bg-primary/10 p-1.5">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Track Growth</h3>
                  <p className="text-sm text-text-secondary">
                    Monitor your performance across all platforms with detailed analytics.
                  </p>
                </div>
              </div>
              
              <div className="animate-slide-up stagger-4 flex items-start gap-3">
                <div className="mt-1 rounded-full bg-primary/10 p-1.5">
                  <Play className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Video-First</h3>
                  <p className="text-sm text-text-secondary">
                    Optimized for long-form video content with thumbnail previews.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="animate-slide-up stagger-4 flex flex-col justify-center">
            <div className="rounded-2xl border border-border bg-bg-secondary p-8 text-center hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl">
              <Sparkles className="mx-auto h-12 w-12 text-primary" />
              <h3 className="mt-4 text-xl font-semibold text-text-primary">
                Ready to streamline your content?
              </h3>
              <p className="mt-2 text-text-secondary">
                Join {siteConfig.author.name} and take control of your social media presence.
              </p>
              <div className="mt-6">
                <Link href="/login">
                  <Button size="lg">Start for Free</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-bg-secondary py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Users className="animate-float mx-auto h-12 w-12 text-primary" />
            <h2 className="animate-slide-up stagger-1 mt-4 text-2xl font-bold tracking-tight text-text-primary">
              Stay in the loop
            </h2>
            <p className="animate-slide-up stagger-2 mt-3 text-text-secondary">
              Get the latest features, tips, and updates for {siteConfig.name} delivered to your inbox. 
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
              <div className="animate-slide-up stagger-3 mt-6">
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
