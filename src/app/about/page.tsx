import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
  ExternalLink
} from 'lucide-react';

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

const values = [
  {
    number: '01',
    title: 'Built for Creators',
    description: 'SMST is designed by a content creator, for content creators. Every feature is built with real-world needs in mind.',
  },
  {
    number: '02',
    title: 'Privacy First',
    description: 'Your data belongs to you. We never sell your information or share it with third parties without consent.',
  },
  {
    number: '03',
    title: 'Simple & Fast',
    description: 'No complex setups or steep learning curves. Get started in minutes, not hours.',
  },
  {
    number: '04',
    title: 'Always Improving',
    description: 'We continuously add new features and improvements based on user feedback and needs.',
  },
];

export default function AboutPage() {
  return (
    <div className="pb-24">
      <PageHeader
        title="About SMST"
        description="The social media scheduling tool built for content creators who want to streamline their workflow."
      />

      {/* Story Section */}
      <section className="container py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                The Story Behind SMST
              </h2>
              <div className="mt-6 space-y-4 text-[var(--color-text-secondary)]">
                <p>
                  As a content creator managing multiple platforms, I found myself juggling between 
                  different tools and dashboards just to schedule and track my content. The existing 
                  solutions were either too expensive, too complex, or didn't support all the platforms I used.
                </p>
                <p>
                  That's when I decided to build SMST - a tool that puts everything I need in one place. 
                  From scheduling posts to analyzing performance, from managing media files to tracking 
                  the entire content pipeline.
                </p>
                <p>
                  SMST is now the central hub for all my content creation workflow, and I'm excited 
                  to share it with other creators who face the same challenges.
                </p>
              </div>
              <div className="mt-8">
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[var(--color-accent)] hover:underline"
                >
                  <Code className="h-4 w-4" />
                  View on GitHub
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8">
                <div className="text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
                    <Heart className="h-8 w-8 text-[var(--color-accent)]" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">
                    {siteConfig.author.name}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {siteConfig.location}
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <a
                      href={siteConfig.links.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-text-primary text-sm transition-colors"
                    >
                      YouTube
                    </a>
                    <span className="text-[var(--color-text-muted)]">•</span>
                    <a
                      href={siteConfig.links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-text-primary text-sm transition-colors"
                    >
                      Instagram
                    </a>
                    <span className="text-[var(--color-text-muted)]">•</span>
                    <a
                      href={siteConfig.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-text-primary text-sm transition-colors"
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
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
            <p className="mt-3 text-[var(--color-text-secondary)]">
              Everything you need to manage your social media presence in one place.
            </p>
          </div>
          
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6">
                <div className="mb-4 inline-flex rounded-lg bg-[var(--color-accent)]/10 p-2.5 text-[var(--color-accent)]">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {feature.description}
                </p>
              </Card>
            ))}
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

      {/* CTA Section */}
      <section className="bg-[var(--color-bg-secondary)] py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Users className="mx-auto h-12 w-12 text-[var(--color-accent)]" />
            <h2 className="mt-4 text-2xl font-bold text-[var(--color-text-primary)]">
              Ready to Get Started?
            </h2>
            <p className="mt-3 text-[var(--color-text-secondary)]">
              Join the growing community of content creators using SMST to streamline their workflow.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login">
                <Button size="lg">Create Account</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">Get in Touch</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}