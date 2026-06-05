import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
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
  Shield,
  Heart,
  Code,
  Users,
  ExternalLink,
  Send,
  CheckCircle
} from 'lucide-react';

const FORMSPREE_FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID;

// ============================================
// About Page
// ============================================

export default function AboutPage() {
  return (
    <div className="pb-24">
      <PageHeader
        title="About SMST"
        description="The social media scheduling tool built for content creators who want to streamline their workflow."
      />

      {/* Hero Section */}
      <section className="container py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] md:text-4xl">
              Streamline Your Content.
              <br />
              <span className="text-[var(--color-accent)]">Simplify Your Life.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-text-secondary)]">
              SMST is a social media scheduling tool that helps content creators manage their 
              presence across YouTube, TikTok, Instagram, and Facebook from one central hub. 
              Built by a content creator, for content creators.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-[var(--color-bg-secondary)] py-12 md:py-16">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
              What SMST Offers
            </h2>
          </div>
          
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4 inline-flex rounded-lg bg-[var(--color-accent)]/10 p-2.5 text-[var(--color-accent)]">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">
                Content Calendar
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Visualize your entire content schedule with an interactive calendar. Plan weeks ahead.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 inline-flex rounded-lg bg-[var(--color-accent)]/10 p-2.5 text-[var(--color-accent)]">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">
                Smart Scheduling
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Schedule posts at optimal times for each platform. Set it once, publish everywhere.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 inline-flex rounded-lg bg-[var(--color-accent)]/10 p-2.5 text-[var(--color-accent)]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">
                Analytics Dashboard
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Track performance across all platforms. Monitor views, engagement, and growth.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 inline-flex rounded-lg bg-[var(--color-accent)]/10 p-2.5 text-[var(--color-accent)]">
                <Share2 className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">
                Multi-Platform
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Publish to YouTube, TikTok, Instagram, and Facebook from one central hub.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 inline-flex rounded-lg bg-[var(--color-accent)]/10 p-2.5 text-[var(--color-accent)]">
                <Image className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">
                Media Library
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Organize your videos, thumbnails, and images. Access your media anywhere.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 inline-flex rounded-lg bg-[var(--color-accent)]/10 p-2.5 text-[var(--color-accent)]">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">
                Pipeline Workflow
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Manage content from ideation to publication with our production pipeline.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-[var(--color-text-primary)]">
            Our Values
          </h2>
          
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="relative pl-12">
              <span className="absolute left-0 top-0 text-5xl font-bold text-[var(--color-accent)]/20">01</span>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Built for Creators
              </h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                SMST is designed by a content creator, for content creators. Every feature is built with real-world needs in mind.
              </p>
            </div>

            <div className="relative pl-12">
              <span className="absolute left-0 top-0 text-5xl font-bold text-[var(--color-accent)]/20">02</span>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Privacy First
              </h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Your data belongs to you. We never sell your information or share it with third parties without consent.
              </p>
            </div>

            <div className="relative pl-12">
              <span className="absolute left-0 top-0 text-5xl font-bold text-[var(--color-accent)]/20">03</span>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Simple & Fast
              </h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                No complex setups or steep learning curves. Get started in minutes, not hours.
              </p>
            </div>

            <div className="relative pl-12">
              <span className="absolute left-0 top-0 text-5xl font-bold text-[var(--color-accent)]/20">04</span>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Always Improving
              </h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                We continuously add new features and improvements based on user feedback and needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-[var(--color-bg-secondary)] py-12 md:py-16">
        <div className="container">
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
              <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                Newsletter coming soon.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Ready to Get Started?
          </h2>
          <p className="mt-3 text-[var(--color-text-secondary)]">
            Join the growing community of content creators using SMST to streamline their workflow.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login">
              <Button size="lg">Create Account</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">Get in Touch</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}