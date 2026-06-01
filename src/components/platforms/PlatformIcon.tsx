import type { SocialPlatform } from '@/types';

// ============================================
// Platform SVG Icons (inline for reliability)
// ============================================

interface PlatformIconProps {
  platform: SocialPlatform;
  className?: string;
  size?: number;
}

export function PlatformIcon({ platform, className = '', size = 24 }: PlatformIconProps) {
  const iconMap: Record<SocialPlatform, React.ReactElement> = {
    tiktok: (
      <svg viewBox="0 0 24 24" className={className} width={size} height={size} fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" className={className} width={size} height={size} fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" className={className} width={size} height={size} fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    youtube: (
      <svg viewBox="0 0 24 24" className={className} width={size} height={size} fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  };

  return iconMap[platform];
}

// ============================================
// Platform Colors
// ============================================

export const platformColors: Record<SocialPlatform, { bg: string; text: string; gradient: string }> = {
  tiktok: {
    bg: 'bg-black',
    text: 'text-black',
    gradient: 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400',
  },
  facebook: {
    bg: 'bg-[#1877F2]',
    text: 'text-[#1877F2]',
    gradient: 'bg-gradient-to-r from-[#1877F2] to-[#0d5fbd]',
  },
  instagram: {
    bg: 'bg-[#E4405F]',
    text: 'text-[#E4405F]',
    gradient: 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
  },
  youtube: {
    bg: 'bg-[#FF0000]',
    text: 'text-[#FF0000]',
    gradient: 'bg-gradient-to-r from-[#FF0000] to-[#cc0000]',
  },
};

// ============================================
// Platform Labels
// ============================================

export const platformLabels: Record<SocialPlatform, string> = {
  tiktok: 'TikTok',
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
};

// ============================================
// Platform Short Labels
// ============================================

export const platformShortLabels: Record<SocialPlatform, string> = {
  tiktok: 'TT',
  facebook: 'FB',
  instagram: 'IG',
  youtube: 'YT',
};

// ============================================
// Check if platform requires video
// ============================================

export function platformSupportsVideo(platform: SocialPlatform): boolean {
  return platform === 'youtube' || platform === 'tiktok';
}

// ============================================
// Check if platform supports scheduling
// ============================================

export function platformSupportsNativeScheduling(platform: SocialPlatform): boolean {
  return platform === 'facebook' || platform === 'instagram';
}

// ============================================
// Get optimal posting times for platform
// ============================================

export function getOptimalTimes(platform: SocialPlatform): string[] {
  const optimalTimes: Record<SocialPlatform, string[]> = {
    tiktok: ['6:00 AM', '9:00 AM', '12:00 PM', '7:00 PM', '9:00 PM'],
    facebook: ['1:00 PM', '3:00 PM', '4:00 PM'],
    instagram: ['11:00 AM', '1:00 PM', '7:00 PM', '9:00 PM'],
    youtube: ['2:00 PM', '4:00 PM', '6:00 PM'],
  };
  return optimalTimes[platform];
}

// ============================================
// Get cooldown period for platform (in minutes)
// ============================================

export function getCooldownPeriod(platform: SocialPlatform): number {
  const cooldowns: Record<SocialPlatform, number> = {
    tiktok: 60,
    facebook: 30,
    instagram: 60,
    youtube: 120,
  };
  return cooldowns[platform];
}