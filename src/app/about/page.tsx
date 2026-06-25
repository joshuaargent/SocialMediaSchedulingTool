import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Calendar,
  BarChart3,
  Share2,
  Image,
  ArrowRight,
  Users,
  Send,
  ExternalLink,
  Code,
  Video,
} from 'lucide-react';

const FORMSPREE_FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID;

// ============================================
// About Page Metadata
// ============================================

export const metadata: Metadata = {
  title: 'About',
  description: `Learn about ${siteConfig.name} - ${siteConfig.description}. Built by ${siteConfig.author.name} to help content creators manage their social media presence.`,
};

// ============================================
// What I Do
// ============================================

const whatIDo = [
  {
    icon: Calendar,
    title: 'Content Calendar',
    description: 'Plan and visualize your content schedule. Never miss a post with our interactive calendar.',
    link: '/calendar',
    linkText: 'View calendar',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track performance across all platforms. Monitor views, engagement, and growth.',
    link: '/analytics',
    linkText: 'View analytics',
  },
  {
    icon: Share2,
    title: 'Scheduling',
    description: 'Schedule posts at optimal times for each platform. Set it once, publish everywhere.',
    link: '/queue',
    linkText: 'View queue',
  },
  {
    icon: Image,
    title: 'Media Library',
    description: 'Organize your videos, thumbnails, and images. Access your assets anywhere.',
    link: '/media-library',
    linkText: 'View media',
  },
];

// ============================================
// My Values
// ============================================

const values = [
  {
    number: '01',
    title: 'Content Creators First',
    description: 'SMST is built by a content creator, for content creators. Every feature is designed with real-world needs in mind.',
  },
  {
    number: '02',
    title: 'Privacy and Security',
    description: 'Your data belongs to you. We never sell your information or share it with third parties.',
  },
  {
    number: '03',
    title: 'Simplicity and Speed',
    description: 'No complex setups or steep learning curves. Get started in minutes, not hours.',
  },
  {
    number: '04',
    title: 'Continuous Improvement',
    description: 'We continuously add new features and improvements based on user feedback.',
  },
];

// ============================================
// Quick Links
// ============================================

const quickLinks = [
  { href: '/dashboard', icon: Video, label: 'Dashboard' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/queue', icon: Share2, label: 'Queue' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
];

// ============================================
// About Page Component
// ============================================

export default function AboutPage() {
  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="container py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-text-primary md:text-4xl animate-fade-in">
            About {siteConfig.name}
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl animate-slide-up stagger-1">
            {siteConfig.description}. Built to help content creators manage their
            social media presence across YouTube, TikTok, Instagram, and Facebook from one
            central hub.
          </p>
        </div>
      </section>

      {/* What I Do Section */}
      <section className="bg-bg-secondary/50 py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-text-primary animate-slide-up">
              What {siteConfig.name} Offers
            </h2>

            <div className="mt-8 space-y-6">
              {whatIDo.map((item, index) => (
                <Card 
                  key={item.title} 
                  hover 
                  className={`p-6 animate-slide-up stagger-${index + 1}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-text-secondary">
                        {item.description}
                      </p>
                      <Link
                        href={item.link}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                      >
                        {item.linkText}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-text-primary animate-slide-up">
            Our Values
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {values.map((value, index) => (
              <div 
                key={value.number} 
                className={`relative pl-12 animate-slide-up stagger-${index + 1}`}
              >
                <span className="absolute left-0 top-0 text-5xl font-bold text-primary/20">
                  {value.number}
                </span>
                <h3 className="text-lg font-semibold text-text-primary">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links & Author Section */}
      <section className="bg-bg-secondary/50 py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              {/* Author Card */}
              <div className="flex flex-col items-center text-center animate-slide-up stagger-1">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {siteConfig.author.name[0]}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-success flex items-center justify-center">
                    <Code className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h2 className="mt-6 text-xl font-semibold text-text-primary">
                  {siteConfig.author.name}
                </h2>
                <p className="mt-1 text-text-muted">
                  {siteConfig.location}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/contact">
                    <Button variant="primary">
                      Get in Touch
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <a
                    href={siteConfig.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary">
                      <Code className="mr-2 h-4 w-4" />
                      GitHub
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Quick Info */}
              <div className="animate-slide-up stagger-2">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Quick Links
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      className="flex items-center gap-3 p-3 rounded-lg bg-bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <link.icon className="h-5 w-5 text-text-muted group-hover:text-primary transition-colors" />
                      <span className="text-text-secondary group-hover:text-text-primary transition-colors">
                        {link.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container py-12 md:py-16">
        <Card className="mx-auto max-w-2xl text-center p-8 animate-scale-in">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">
            Stay Updated
          </h2>
          <p className="mt-3 text-text-secondary max-w-md mx-auto">
            Get the latest features, tips, and updates for {siteConfig.name} delivered to your inbox.
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
                <Button size="lg" variant="primary">
                  Get Started Free
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
