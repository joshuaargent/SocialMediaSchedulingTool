import Link from 'next/link';
import { siteConfig, footerNav } from '@/lib/constants';
import { Heart } from 'lucide-react';

// ============================================
// Footer Component
// ============================================

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary border-border border-t">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-text-primary hover:text-accent text-xl font-semibold transition-colors"
            >
              {siteConfig.name}
            </Link>
            <p className="text-text-secondary mt-3 text-sm">
              {siteConfig.author.bio}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <a
                href={siteConfig.links.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                YouTube
              </a>
              <span className="text-text-muted">•</span>
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                Instagram
              </a>
              <span className="text-text-muted">•</span>
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                GitHub
              </a>
              <span className="text-text-muted">•</span>
              <a
                href={siteConfig.links.strava}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                Strava
              </a>
              <span className="text-text-muted">•</span>
              <a
                href={siteConfig.links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h3 className="text-text-primary text-sm font-semibold tracking-wider uppercase">
              Navigate
            </h3>
            <ul className="mt-4 space-y-2">
              {footerNav.main.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-text-secondary hover:text-text-primary text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-text-primary text-sm font-semibold tracking-wider uppercase">
              Connect
            </h3>
            <ul className="mt-4 space-y-2">
              {footerNav.social.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target={item.href.startsWith('mailto') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-text-primary text-sm transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-border mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-text-muted text-sm">
              © {currentYear} {siteConfig.author.name}. All rights reserved.
            </p>
            <p className="text-text-muted text-sm">
              Built with <Heart className="h-3.5 w-3.5 inline fill-red-500 text-red-500" /> using Next.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
