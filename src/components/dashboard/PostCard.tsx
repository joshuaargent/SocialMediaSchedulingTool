'use client';

import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import type { Post, PostStatus } from '@/types';
import { PlatformIcon, platformColors } from '../platforms/PlatformIcon';
import { Calendar, Clock, Image, AlertCircle, CheckCircle, XCircle, Trash2, Edit3 } from 'lucide-react';
import { clsx } from 'clsx';

// ============================================
// Status Badge Component
// ============================================

interface StatusBadgeProps {
  status: PostStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig: Record<PostStatus, { label: string; className: string; icon: React.ReactElement }> = {
    draft: {
      label: 'Draft',
      className: 'bg-bg-bg-secondary text-text-text-secondary',
      icon: <Edit3 className="w-3 h-3" />,
    },
    scheduled: {
      label: 'Scheduled',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      icon: <Clock className="w-3 h-3" />,
    },
    published: {
      label: 'Published',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      icon: <CheckCircle className="w-3 h-3" />,
    },
    failed: {
      label: 'Failed',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      icon: <AlertCircle className="w-3 h-3" />,
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      icon: <XCircle className="w-3 h-3" />,
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

// ============================================
// Platform Pills Component
// ============================================

interface PlatformPillsProps {
  platforms: ('tiktok' | 'facebook' | 'instagram' | 'youtube')[];
  size?: 'sm' | 'md';
  className?: string;
}

export function PlatformPills({ platforms, size = 'sm', className }: PlatformPillsProps) {
  return (
    <div className={clsx('flex gap-1 flex-wrap', className)}>
      {platforms.map((platform) => (
        <span
          key={platform}
          className={clsx(
            'inline-flex items-center justify-center rounded-full',
            platformColors[platform].bg,
            size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'
          )}
        >
          <PlatformIcon
            platform={platform}
            className={platform === 'tiktok' ? 'text-white' : 'text-white'}
            size={size === 'sm' ? 14 : 18}
          />
        </span>
      ))}
    </div>
  );
}

// ============================================
// Post Card Component
// ============================================

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
  onPublish?: (post: Post) => void;
  compact?: boolean;
}

export function PostCard({ post, onEdit, onDelete, onPublish, compact = false }: PostCardProps) {
  const hasMedia = post.mediaUrls.length > 0;
  
  const scheduledLabel = () => {
    if (!post.scheduledAt) return null;
    
    const date = new Date(post.scheduledAt);
    let label = format(date, 'MMM d, h:mm a');
    
    if (isToday(date)) {
      label = `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      label = `Tomorrow at ${format(date, 'h:mm a')}`;
    }
    
    if (isPast(date) && post.status === 'scheduled') {
      label += ' (overdue)';
    }
    
    return label;
  };

  const publishedLabel = post.publishedAt
    ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
    : null;

  return (
    <div
      className={clsx(
        'bg-bg-bg-card rounded-lg border border-border-border p-4',
        'hover:border-text-primary transition-colors',
        compact ? 'p-3' : 'p-4'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <PlatformPills platforms={post.platforms} />
            <StatusBadge status={post.status} />
          </div>
          
          {!compact && (
            <p className="text-sm text-text-text-secondary line-clamp-2 mt-2">
              {post.content || 'No content'}
            </p>
          )}
        </div>

        {/* Actions */}
        {(onEdit || onDelete || onPublish) && (
          <div className="flex items-center gap-1">
            {onPublish && post.status === 'draft' && (
              <button
                onClick={() => onPublish(post)}
                className="p-1.5 rounded-md hover:bg-bg-bg-secondary text-green-600"
                title="Publish now"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(post)}
                className="p-1.5 rounded-md hover:bg-bg-bg-secondary text-text-text-secondary"
                title="Edit post"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(post)}
                className="p-1.5 rounded-md hover:bg-red-50 text-red-500"
                title="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Media Preview */}
      {hasMedia && !compact && (
        <div className="mb-3 rounded-lg overflow-hidden bg-bg-bg-secondary">
          <div className="flex gap-1">
            {post.mediaUrls.slice(0, 4).map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-video flex-1 bg-bg-bg-secondary"
              >
                <img
                  src={url}
                  alt={`Media ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === 3 && post.mediaUrls.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium">
                    +{post.mediaUrls.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-text-text-muted">
        <div className="flex items-center gap-3">
          {post.scheduledAt && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {scheduledLabel()}
            </span>
          )}
          {publishedLabel && (
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              {publishedLabel}
            </span>
          )}
        </div>
        
        <span className="text-text-text-muted">
          {format(new Date(post.createdAt), 'MMM d')}
        </span>
      </div>

      {/* Error message */}
      {post.status === 'failed' && post.errorMessage && (
        <div className="mt-3 p-2 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{post.errorMessage}</span>
        </div>
      )}

      {/* Evergreen indicator */}
      {post.isEvergreen && (
        <div className="mt-2 flex items-center gap-1 text-xs text-text-primary">
          <span className="w-2 h-2 rounded-full bg-text-primary" />
          Repeats every {post.evergreenIntervalDays} days
        </div>
      )}
    </div>
  );
}

// ============================================
// Post Queue Item Component
// ============================================

interface QueueItemProps {
  post: Post;
  cooldownRemaining: number;
  onPublish?: () => void;
  onCancel?: () => void;
}

export function QueueItem({ post, cooldownRemaining, onPublish, onCancel }: QueueItemProps) {
  const cooldownMinutes = Math.ceil(cooldownRemaining / (1000 * 60));
  const cooldownText = cooldownMinutes >= 60
    ? `${Math.floor(cooldownMinutes / 60)}h ${cooldownMinutes % 60}m`
    : `${cooldownMinutes}m`;

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-bg-bg-secondary">
      <PlatformPills platforms={post.platforms} />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{post.content || 'No content'}</p>
        <p className="text-xs text-text-text-muted">
          Scheduled: {post.scheduledAt ? format(new Date(post.scheduledAt), 'MMM d, h:mm a') : 'Not scheduled'}
        </p>
      </div>

      <div className="text-right">
        <div className={clsx(
          'text-sm font-medium',
          cooldownMinutes > 0 ? 'text-text-warning' : 'text-green-500'
        )}>
          {cooldownMinutes > 0 ? (
            <>
              <span className="text-text-text-muted">Cooldown:</span> {cooldownText}
            </>
          ) : (
            'Ready'
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          {onPublish && cooldownMinutes === 0 && (
            <button
              onClick={onPublish}
              className="text-xs px-2 py-1 rounded bg-text-primary text-white hover:bg-text-primary-hover"
            >
              Publish
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs px-2 py-1 rounded bg-bg-bg-card hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}