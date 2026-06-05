import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Calendar,
  BarChart3,
  Clock,
  Share2,
  Video,
  Image,
  Zap,
  Shield,
  ArrowRight,
  Users,
  Send,
  ExternalLink,
  Code
} from 'lucide-react';

const FORMSPREE_FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID;

// ============================================
// About Page
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
    description: 'I built a visual calendar system so content creators can plan weeks ahead and never miss a scheduled post. Planning is key to consistency.',
    link: '/calendar',
    linkText: 'View calendar',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Tracking performance across multiple platforms is essential. I integrated analytics so you can see all your metrics in one dashboard.',
    link: '/analytics',
    linkText: 'View analytics',
  },
  {
    icon: Share2,
    title: 'Scheduling',
    description: 'Scheduling posts should be simple. I designed the queue system so you can set it once and publish everywhere with minimal effort.',
    link: '/queue',
    linkText: 'View queue',
  },
  {
    icon: Image,
    title: 'Media Library',
    description: 'A well-organized media library is essential for content creators. I built a system to organize videos, thumbnails, and images.',
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
    description: 'SMST is built by a content creator, for content creators. Every feature is designed with real-world needs in mind. I use this tool myself daily.',
  },
  {
    number: '02',
    title: 'Privacy and Security',
    description: 'Your data belongs to you. We never sell your information or share it with third parties without your explicit consent.',
  },
  {
    number: '03',
    title: 'Simplicity and Speed',
    description: 'No complex setups or steep learning curves. Get started in minutes, not hours. The best tools are the ones you actually use.',
  },
  {
    number: '04',
    title: 'Continuous Improvement',
    description: 'I\'m always adding new features and improvements based on user feedback. SMST grows with the needs of content creators.',
  },
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
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] md:text-4xl">
            About SMST
          </h1>
          <p className="mt-4 text-lg text-[var(--color-text-secondary)] max-w-2xl">
            {siteConfig.description}. I built SMST to help content creators manage their 
            social media presence across YouTube, TikTok, Instagram, and Facebook from one 
            central hub.
          </p>
        </div>
      </section>

      {/* What I Do Section */}
      <section className="bg-[var(--color-bg-secondary)] py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
              What SMST Offers
            </h2>
            
            <div className="mt-8 space-y-6">
              {whatIDo.map((item) => (
                <Card key={item.title} className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                      <item.icon className="h-6 w-6 text-[var(--color-accent)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-[var(--color-text-secondary)]">
                        {item.description}
                      </p>
                      <Link
                        href={item.link}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline"
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
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Our Values
          </h2>
          
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {values.map((value) => (
              <div key={value.number} className="relative pl-12">
                <span className="absolute left-0 top-0 text-5xl font-bold text-[var(--color-accent)]/20">
                  {value.number}
                </span>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Author Section */}
      <section className="bg-[var(--color-bg-secondary)] py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col items-center text-center">
              <div className="h-32 w-32 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                <span className="text-4xl font-bold text-[var(--color-accent)]">
                  {siteConfig.author.name[0]}
                </span>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">
                {siteConfig.author.name}
              </h2>
              <p className="mt-1 text-[var(--color-text-muted)]">
                {siteConfig.location}
              </p>
              
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <Link href="/contact">
                  <Button>
                    Get in Touch
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <Code className="mr-2 h-4 w-4" />
                    View on GitHub
                    <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Users className="mx-auto h-12 w-12 text-[var(--color-accent)]" />
          <h2 className="mt-4 text-2xl font-bold text-[var(--color-text-primary)]">
            Stay Updated
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
      </section>
    </div>
  );
}