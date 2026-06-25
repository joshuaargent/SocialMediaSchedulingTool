import { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { siteConfig } from '@/lib/constants';
import { Mail, Youtube, Github, Instagram, Facebook, MapPin, Send, Clock } from 'lucide-react';

const FORMSPREE_FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID;

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with ${siteConfig.name}. Contact ${siteConfig.author.name} for questions, collaborations, or support with the social media scheduling tool.`,
  keywords: ['contact', 'support', 'SMST', siteConfig.author.name, 'social media tool'],
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact"
        description="I'd love to hear from you. Whether it's a question, collaboration idea, or just to say hi."
      />

      <section className="pb-12 md:pb-16">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card hover className="animate-slide-up">
                <h2 className="text-text-primary mb-6 text-xl font-semibold">Send a Message</h2>
                {FORMSPREE_FORM_ID ? (
                  <form
                    action={`https://formspree.io/f/${FORMSPREE_FORM_ID}`}
                    method="POST"
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input
                        label="Name"
                        name="name"
                        type="text"
                        placeholder="Your name"
                        required
                      />
                      <Input
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <Input
                      label="Subject"
                      name="subject"
                      type="text"
                      placeholder="What's this about?"
                      required
                    />

                    <Textarea
                      label="Message"
                      name="message"
                      placeholder="Your message..."
                      rows={6}
                      required
                    />

                    <Button type="submit" size="lg" className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </form>
                ) : (
                  <div className="rounded-xl border border-warning/20 bg-warning/10 p-4">
                    <p className="font-medium text-text-primary">Contact form not configured</p>
                    <p className="mt-1 text-sm text-text-secondary">
                      To enable the contact form, add your Formspree form ID to the environment
                      variable{' '}
                      <code className="rounded bg-bg-secondary px-1 py-0.5">
                        NEXT_PUBLIC_FORMSPREE_FORM_ID
                      </code>
                      .<br />
                      Create a form at{' '}
                      <a
                        href="https://formspree.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        formspree.io
                      </a>
                    </p>
                    <div className="mt-4">
                      <a
                        href={siteConfig.links.email}
                        className="text-primary hover:text-primary-hover inline-flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        {siteConfig.links.email.replace('mailto:', '')}
                      </a>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Email */}
              <Card hover className="animate-slide-up stagger-1 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-text-primary font-semibold">Email</h3>
                </div>
                <a
                  href={siteConfig.links.email}
                  className="text-text-secondary hover:text-primary flex items-center gap-2 transition-colors"
                >
                  {siteConfig.links.email.replace('mailto:', '')}
                </a>
              </Card>

              {/* Location */}
              <Card hover className="animate-slide-up stagger-2 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <MapPin className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="text-text-primary font-semibold">Location</h3>
                </div>
                <p className="text-text-secondary">
                  {siteConfig.location}
                </p>
              </Card>

              {/* Response Time */}
              <Card hover className="animate-slide-up stagger-3 p-5 bg-gradient-to-br from-primary/5 to-purple-500/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-text-primary font-semibold">Response Time</h3>
                </div>
                <p className="text-text-secondary text-sm">
                  I typically respond within 24-48 hours. For urgent matters, reach out via
                  Instagram DM.
                </p>
              </Card>

              {/* Social Links */}
              <Card hover className="animate-slide-up stagger-4 p-5">
                <h3 className="text-text-primary font-semibold mb-4">Connect</h3>
                <div className="space-y-2">
                  {siteConfig.links.youtube && (
                    <a
                      href={siteConfig.links.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-secondary transition-colors group"
                    >
                      <Youtube className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-text-primary text-sm font-medium group-hover:text-primary transition-colors">YouTube</p>
                        <p className="text-text-muted text-xs">@joshua_argent</p>
                      </div>
                    </a>
                  )}

                  {siteConfig.links.github && (
                    <a
                      href={siteConfig.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-secondary transition-colors group"
                    >
                      <Github className="h-5 w-5 text-text-secondary group-hover:text-primary transition-colors" />
                      <div>
                        <p className="text-text-primary text-sm font-medium group-hover:text-primary transition-colors">GitHub</p>
                        <p className="text-text-muted text-xs">@joshuaargent</p>
                      </div>
                    </a>
                  )}

                  {siteConfig.links.instagram && (
                    <a
                      href={siteConfig.links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-secondary transition-colors group"
                    >
                      <Instagram className="h-5 w-5 text-pink-500" />
                      <div>
                        <p className="text-text-primary text-sm font-medium group-hover:text-primary transition-colors">Instagram</p>
                        <p className="text-text-muted text-xs">@joshua_argent</p>
                      </div>
                    </a>
                  )}

                  {siteConfig.links.facebook && (
                    <a
                      href={siteConfig.links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-secondary transition-colors group"
                    >
                      <Facebook className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-text-primary text-sm font-medium group-hover:text-primary transition-colors">Facebook</p>
                        <p className="text-text-muted text-xs">@joshua_argent</p>
                      </div>
                    </a>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
