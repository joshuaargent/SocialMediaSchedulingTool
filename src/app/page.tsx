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
  Globe,
  Zap,
  Shield,
  Send,
  Users
} from 'lucide-react';

const FORMSPREE_FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID;

// ============================================
// Homepage
// ============================================

export const metadata: Metadata = {
  title: 'SMST - Social Media Scheduling Tool',
  description: 'Schedule, publish, and analyze content across TikTok, Facebook, Instagram, and YouTube. Streamline your social media workflow with powerful scheduling and analytics tools.',
};

// ============================================
// Features Data
// ============================================

const features = [
  {
    icon: Calendar,
    title: 'Content Calendar',
    description: 'Visualize your entire content schedule with an interactive calendar. Plan weeks ahead and never miss a post.',
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Schedule posts at optimal times for each platform. Set it once, publish everywhere.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track performance across all platforms in one place. Monitor views, engagement, and growth.',
  },
  {
    icon: Share2,
    title: 'Multi-Platform',
    description: 'Publish to YouTube, TikTok, Instagram, and Facebook from one central hub.',
  },
  {
    icon: Image,
    title: 'Media Library',
    description: 'Organize your videos, thumbnails, and images. Access your media assets anywhere.',
  },
  {
    icon: Zap,
    title: 'Pipeline Workflow',
    description: 'Manage content from ideation to publication with our production pipeline.',
  },
];

const platforms = [
  { name: 'YouTube', color: 'bg-red-500', textColor: 'text-white' },
  { name: 'TikTok', color: 'bg-black', textColor: 'text-white' },
  { name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400', textColor: 'text-white' },
  { name: 'Facebook', color: 'bg-blue-600', textColor: 'text-white' },
];

// ============================================
// Homepage Component
// ============================================

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-bg-primary)] to-[var(--color-bg-secondary)] py-20 md:py-32">
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl md:text-6xl">
              One Platform.
              <br />
              <span className="text-[var(--color-accent)]">All Your Content.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-text-secondary)] md:text-xl">
              {siteConfig.description}. Schedule, publish, and analyze your social media 
              presence across YouTube, TikTok, Instagram, and Facebook from one central hub.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="min-w-[160px]">
                  Get Started
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="min-w-[160px]">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-[var(--color-accent)]/5 blur-3xl" />
          <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-[var(--color-accent)]/5 blur-3xl" />
        </div>
      </section>

      {/* Platforms Section */}
      <section className="bg-[var(--color-bg-secondary)] py-12">
        <div className="container">
          <p className="text-center text-sm font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
            Supported Platforms
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 ${platform.color} ${platform.textColor} font-medium shadow-sm`}
              >
                <Globe className="h-4 w-4" />
                {platform.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[var(--color-bg-primary)] py-20 md:py-24">
        <div className="container">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              Powerful tools designed for content creators who want to streamline their workflow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 transition-all hover:border-[var(--color-accent)]/50 hover:shadow-lg"
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[var(--color-bg-secondary)] py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
              Ready to streamline your content?
            </h2>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              Join {siteConfig.author.name} and take control of your social media presence.
              Schedule smarter, analyze deeper, and grow faster.
            </p>
            <div className="mt-8">
              <Link href="/login">
                <Button size="lg">
                  Start for Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="bg-[var(--color-bg-primary)] py-20 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
                Built for content creators
              </h2>
              <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
                SMST is designed by a content creator, for content creators. 
                Every feature is built with real-world needs in mind.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-[var(--color-accent)]/10 p-1">
                    <Shield className="h-4 w-4 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-primary)]">Secure & Private</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Your data is secure. We never share your information with third parties.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-[var(--color-accent)]/10 p-1">
                    <Zap className="h-4 w-4 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-primary)]">Lightning Fast</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Built on Next.js for optimal performance and reliability.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-[var(--color-accent)]/10 p-1">
                    <Video className="h-4 w-4 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-primary)]">Video-First</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Optimized for long-form video content with thumbnail previews.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-video rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Video className="mx-auto h-16 w-16 text-[var(--color-text-muted)]" />
                    <p className="mt-4 text-[var(--color-text-muted)]">Dashboard Preview</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-lg">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">Beta Access</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Available now</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-[var(--color-bg-secondary)] py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Users className="mx-auto h-12 w-12 text-[var(--color-accent)]" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-3xl">
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
