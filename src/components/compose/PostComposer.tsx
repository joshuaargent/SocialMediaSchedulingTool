'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { X, Image, Video, Calendar, Clock, RefreshCw, AlertCircle, Check, Eye, Sparkles, Upload } from 'lucide-react';
import { clsx } from 'clsx';
import type { SocialPlatform, PostType, ContentType } from '@/types';
import { PlatformIcon, platformColors, getOptimalTimes } from '../platforms/PlatformIcon';
import { useComposeStore, usePostsStore, usePlatformStore } from '@/stores';
import { checkCooldown, formatCooldownMinutes, DEFAULT_COOLDOWNS } from '@/lib/scheduling/engine';

interface PostComposerProps {
  onClose: () => void;
  onPublish?: () => void;
  initialDate?: Date;
}

export function PostComposer({ onClose, onPublish, initialDate }: PostComposerProps) {
  // Use individual selectors to avoid infinite loop
  const content = useComposeStore((s) => s.content);
  const mediaUrls = useComposeStore((s) => s.mediaUrls);
  const platforms = useComposeStore((s) => s.platforms);
  const scheduledAt = useComposeStore((s) => s.scheduledAt);
  const postType = useComposeStore((s) => s.postType);
  const contentType = useComposeStore((s) => s.contentType);
  const isEvergreen = useComposeStore((s) => s.isEvergreen);
  const evergreenIntervalDays = useComposeStore((s) => s.evergreenIntervalDays);
  const tags = useComposeStore((s) => s.tags);
  
  const setContent = useComposeStore((s) => s.setContent);
  const setPlatforms = useComposeStore((s) => s.setPlatforms);
  const setScheduledAt = useComposeStore((s) => s.setScheduledAt);
  const setPostType = useComposeStore((s) => s.setPostType);
  const setContentType = useComposeStore((s) => s.setContentType);
  const setIsEvergreen = useComposeStore((s) => s.setIsEvergreen);
  const setEvergreenIntervalDays = useComposeStore((s) => s.setEvergreenIntervalDays);
  const setTags = useComposeStore((s) => s.setTags);
  const removeMediaUrl = useComposeStore((s) => s.removeMediaUrl);
  const addMediaUrl = useComposeStore((s) => s.addMediaUrl);
  const createPost = useComposeStore((s) => s.createPost);
  const reset = useComposeStore((s) => s.reset);

  // Get posting history for cooldown calculations
  const posts = usePostsStore((s) => s.posts);
  const postingHistory = useMemo(() => {
    return posts
      .filter((p) => p.status === 'published' && p.publishedAt)
      .map((p) => ({
        platform: p.platforms[0],
        publishedAt: p.publishedAt!,
        engagement: { views: 0, likes: 0, comments: 0, shares: 0 },
      }));
  }, [posts]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate cooldown warnings for selected platforms
  const cooldownWarnings = useMemo(() => {
    if (platforms.length === 0) return null;
    
    const warnings: Record<SocialPlatform, { minutes: number; message: string }> = {} as Record<SocialPlatform, { minutes: number; message: string }>;
    
    for (const platform of platforms) {
      const check = checkCooldown(platform, postingHistory as any, DEFAULT_COOLDOWNS);
      if (!check.canPublish) {
        warnings[platform] = {
          minutes: check.remainingMinutes,
          message: check.reason || `Wait ${formatCooldownMinutes(check.remainingMinutes)}`,
        };
      }
    }
    
    return warnings;
  }, [platforms, postingHistory]);

  const hasCooldownWarning = cooldownWarnings && Object.keys(cooldownWarnings).length > 0;

  const platformList: SocialPlatform[] = ['tiktok', 'facebook', 'instagram', 'youtube'];
  
  const postTypes: { value: PostType; label: string }[] = [
    { value: 'social_post', label: 'Social Post' },
    { value: 'video_publish', label: 'Video Publish' },
    { value: 'shorts_publish', label: 'Shorts/Reel' },
    { value: 'community_post', label: 'Community Post' },
  ];

  const contentTypes: { value: ContentType; label: string }[] = [
    { value: 'short_form', label: 'Short-form' },
    { value: 'long_form', label: 'Long-form' },
    { value: 'story', label: 'Story' },
    { value: 'reel', label: 'Reel' },
  ];

  const handlePlatformToggle = (platform: SocialPlatform) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter((p) => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  const handleDateSelect = (date: Date) => {
    setScheduledAt(date);
    setShowDatePicker(false);
  };

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        // Upload file to server
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            addMediaUrl(data.file.url);
          }
        }
      } catch (error) {
        console.error('Upload failed:', error);
        // Fallback to blob URL for preview
        const url = URL.createObjectURL(file);
        addMediaUrl(url);
      }
    }
  }, [addMediaUrl]);

  const handleSuggestHashtags = useCallback(() => {
    // Simple hashtag suggestion based on content keywords
    const keywords = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const uniqueKeywords = [...new Set(keywords)].slice(0, 5);
    const suggestions = uniqueKeywords.map((k) => `#${k.replace(/[^a-z0-9]/gi, '')}`);
    setSuggestedHashtags(suggestions);
  }, [content]);

  const handleAddSuggestedHashtag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleQuickSchedule = (hour: number) => {
    const tomorrow = addDays(new Date(), 1);
    const scheduled = setMinutes(setHours(tomorrow, hour), 0);
    setScheduledAt(scheduled);
  };

  const handleSubmit = async () => {
    if (platforms.length === 0) return;
    if (!content && mediaUrls.length === 0) return;

    setIsSubmitting(true);
    try {
      const post = createPost();
      if (post) {
        reset();
        onPublish?.();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate preview content per platform
  const getPreviewContent = (platform: SocialPlatform) => {
    const maxLength = platform === 'instagram' ? 2200 : 5000;
    const truncatedContent = content.length > maxLength 
      ? content.slice(0, maxLength - 3) + '...' 
      : content;
    
    return {
      caption: tags.length > 0 ? `${truncatedContent}\n\n${tags.join(' ')}` : truncatedContent,
      platforms,
      hasMedia: mediaUrls.length > 0,
      mediaCount: mediaUrls.length,
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[var(--color-bg-card)] rounded-xl shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold">Create Post</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Post to</label>
            <div className="flex flex-wrap gap-3">
              {platforms.map((platform) => {
                const isSelected = platforms.includes(platform);
                const optimalTimes = getOptimalTimes(platform);
                const cooldownWarning = cooldownWarnings?.[platform];
                
                return (
                  <button
                    key={platform}
                    onClick={() => handlePlatformToggle(platform)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all',
                      isSelected
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]/30'
                        : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
                    )}
                  >
                    <div className={clsx(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      platformColors[platform].bg
                    )}>
                      <PlatformIcon platform={platform} className="text-white" size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium capitalize">{platform}</div>
                      {isSelected && (
                        <div className="text-xs text-[var(--color-text-muted)]">
                          Best: {optimalTimes[0]}
                        </div>
                      )}
                    </div>
                    {isSelected && cooldownWarning && (
                      <div className="ml-2 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        {formatCooldownMinutes(cooldownWarning.minutes)}
                      </div>
                    )}
                    {isSelected && (
                      <Check className="w-5 h-5 text-[var(--color-accent)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cooldown Warning Banner */}
          {hasCooldownWarning && (
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">Cooldown Period Active</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Some platforms have recently been posted to. You can still schedule but may want to wait for better engagement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Post Type</label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value as PostType)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                {postTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                {contentTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Content Text */}
          <div>
            <label className="block text-sm font-medium mb-2">Caption / Description</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your caption..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
            />
            <div className="flex justify-between mt-1 text-xs text-[var(--color-text-muted)]">
              <span>{content.length} characters</span>
              <span>Recommended: 150-300 for captions</span>
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Media</label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                Upload Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-8 text-center hover:border-[var(--color-accent)] transition-colors cursor-pointer"
            >
              <Image className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-muted)]" />
              <p className="text-sm text-[var(--color-text-secondary)]">
                Drag and drop files or click to upload
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Supports: JPG, PNG, GIF, MP4, MOV (max 100MB)
              </p>
            </div>
            
            {/* Media Preview */}
            {mediaUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {mediaUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-[var(--color-bg-secondary)]">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeMediaUrl(url)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium mb-2">Schedule</label>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setScheduledAt(null)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                  !scheduledAt
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]/30 text-[var(--color-accent)]'
                    : 'border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]'
                )}
              >
                <Video className="w-4 h-4" />
                Post Now
              </button>
              <button
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(9, 0, 0, 0);
                  setScheduledAt(tomorrow);
                }}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                  scheduledAt && scheduledAt > new Date()
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]/30 text-[var(--color-accent)]'
                    : 'border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]'
                )}
              >
                <Calendar className="w-4 h-4" />
                {scheduledAt 
                  ? format(scheduledAt, 'MMM d, h:mm a')
                  : 'Pick Date & Time'}
              </button>
            </div>

            {/* Quick Schedule Options */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-[var(--color-text-muted)]">Quick schedule:</span>
              {['Tomorrow 9 AM', 'Tomorrow 12 PM', 'Tomorrow 7 PM'].map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    // Parse and set quick schedule
                  }}
                  className="text-xs px-2 py-1 rounded bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] transition-colors"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Evergreen Option */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-bg-secondary)]">
            <div>
              <div className="font-medium flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Evergreen Content
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Automatically repost this content at regular intervals
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEvergreen}
                onChange={(e) => setIsEvergreen(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-[var(--color-accent)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]" />
            </label>
          </div>

          {isEvergreen && (
            <div className="flex items-center gap-3">
              <span className="text-sm">Repeat every</span>
              <input
                type="number"
                min="1"
                max="365"
                value={evergreenIntervalDays}
                onChange={(e) => setEvergreenIntervalDays(parseInt(e.target.value) || 7)}
                className="w-20 px-3 py-2 rounded-lg border border-[var(--color-border)]"
              />
              <span className="text-sm">days</span>
            </div>
          )}

          {/* Tags / Hashtags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Tags / Hashtags</label>
              <button
                onClick={handleSuggestHashtags}
                disabled={!content}
                className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" />
                Suggest Hashtags
              </button>
            </div>
            <input
              type="text"
              value={tags.join(' ')}
              onChange={(e) => setTags(e.target.value.split(' ').filter(Boolean))}
              placeholder="Enter hashtags separated by spaces"
              className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            
            {/* Suggested Hashtags */}
            {suggestedHashtags.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-[var(--color-text-muted)] mb-2">Suggested hashtags:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedHashtags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleAddSuggestedHashtag(tag)}
                      className="px-3 py-1 rounded-full bg-[var(--color-bg-secondary)] text-sm hover:bg-[var(--color-accent)] hover:text-white transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50">
          <div className="flex items-center gap-4">
            <div className="text-sm text-[var(--color-text-muted)]">
              {platforms.length > 0 ? (
                <>Posting to {platforms.length} platform{platforms.length > 1 ? 's' : ''}</>
              ) : (
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  Select at least one platform
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowPreview(true)}
              disabled={!content && mediaUrls.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-50"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                platforms.length === 0 ||
                (!content && mediaUrls.length === 0) ||
                isSubmitting
              }
              className={clsx(
                'px-6 py-2 rounded-lg font-medium transition-colors',
                'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isSubmitting ? 'Creating...' : scheduledAt ? 'Schedule Post' : 'Create Post'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPreview(false)} />
          <div className="relative w-full max-w-3xl bg-[var(--color-bg-card)] rounded-xl shadow-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold">Post Preview</h2>
              <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {platforms.map((platform) => {
                  const preview = getPreviewContent(platform);
                  return (
                    <div key={platform} className="rounded-lg border border-[var(--color-border)] overflow-hidden">
                      <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-secondary)]">
                        <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center', platformColors[platform].bg)}>
                          <PlatformIcon platform={platform} className="text-white" size={16} />
                        </div>
                        <span className="font-medium capitalize">{platform}</span>
                        <span className="text-xs text-[var(--color-text-muted)] ml-auto">
                          {preview.caption.length} chars
                        </span>
                      </div>
                      
                      {/* Media Preview */}
                      {preview.hasMedia && (
                        <div className="grid grid-cols-2 gap-1 p-3 bg-black/5">
                          {mediaUrls.slice(0, 4).map((url, idx) => (
                            <div key={idx} className="aspect-video rounded bg-[var(--color-bg-secondary)] overflow-hidden">
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {mediaUrls.length > 4 && (
                            <div className="aspect-video rounded bg-[var(--color-bg-secondary)] flex items-center justify-center">
                              <span className="text-[var(--color-text-muted)]">+{mediaUrls.length - 4}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Caption Preview */}
                      <div className="p-4">
                        <p className="whitespace-pre-wrap text-sm">{preview.caption}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}