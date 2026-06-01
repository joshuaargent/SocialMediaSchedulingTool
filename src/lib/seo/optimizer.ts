import type { SEOScore, SEOSuggestion, HashtagSuggestion } from '@/types';

// ============================================
// YouTube SEO Optimizer
// ============================================

export interface YouTubeSEOPayload {
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl?: string;
  categoryId?: string;
}

// ============================================
// Title Analysis
// ============================================

export function analyzeTitle(title: string): { score: number; suggestions: SEOSuggestion[] } {
  const suggestions: SEOSuggestion[] = [];
  let score = 100;
  
  // Length check (60 chars optimal, max 100)
  if (title.length === 0) {
    return { score: 0, suggestions: [{ type: 'warning', category: 'title', message: 'Title is required', priority: 'high' }] };
  }
  
  if (title.length < 30) {
    score -= 20;
    suggestions.push({ type: 'improvement', category: 'title', message: 'Title is too short. Aim for 50-60 characters', priority: 'medium' });
  } else if (title.length > 60) {
    score -= 15;
    suggestions.push({ type: 'warning', category: 'title', message: `Title is ${title.length} chars. Max recommended is 60 (${title.length - 60} over)`, priority: 'high' });
  }
  
  // Power words check
  const powerWords = ['how', 'why', 'what', 'best', 'top', 'guide', 'tutorial', 'ultimate', 'easy', 'fast', 'quick'];
  const hasPowerWord = powerWords.some(pw => title.toLowerCase().includes(pw));
  if (!hasPowerWord) {
    score -= 5;
    suggestions.push({ type: 'tip', category: 'title', message: 'Consider adding power words like "How to", "Ultimate Guide", or "Best Way"', priority: 'low' });
  }
  
  // Number check (titles with numbers often perform better)
  const hasNumber = /\d/.test(title);
  if (!hasNumber) {
    score -= 5;
    suggestions.push({ type: 'tip', category: 'title', message: 'Consider adding numbers to your title (e.g., "5 Tips...", "Top 10...")', priority: 'low' });
  }
  
  // Brackets check
  const hasBrackets = /[\[\(]/.test(title);
  if (hasBrackets) {
    score -= 10;
    suggestions.push({ type: 'warning', category: 'title', message: 'Avoid special characters or brackets - they can be cut off in search results', priority: 'medium' });
  }
  
  return { 
    score: Math.max(0, score), 
    suggestions 
  };
}

// ============================================
// Description Analysis
// ============================================

export function analyzeDescription(description: string): { score: number; suggestions: SEOSuggestion[] } {
  const suggestions: SEOSuggestion[] = [];
  let score = 100;
  
  if (description.length === 0) {
    return { score: 0, suggestions: [{ type: 'warning', category: 'description', message: 'Description is required', priority: 'high' }] };
  }
  
  // Length check (YouTube shows ~150 chars before "show more")
  if (description.length < 100) {
    score -= 25;
    suggestions.push({ type: 'improvement', category: 'description', message: 'Description is too short. Add more context (recommended: 200+ chars)', priority: 'high' });
  } else if (description.length < 200) {
    score -= 10;
    suggestions.push({ type: 'tip', category: 'description', message: 'Consider expanding your description to 200+ characters', priority: 'low' });
  }
  
  // Hashtags check (don't use too many)
  const hashtagCount = (description.match(/#\w+/g) || []).length;
  if (hashtagCount > 15) {
    score -= 15;
    suggestions.push({ type: 'warning', category: 'description', message: 'Too many hashtags. YouTube allows only 15 hashtags max', priority: 'high' });
  }
  
  // Links check
  if (!description.includes('http') && !description.includes('www')) {
    score -= 5;
    suggestions.push({ type: 'tip', category: 'description', message: 'Consider adding relevant links (social media, resources)', priority: 'low' });
  }
  
  // Timestamps check
  if (!description.match(/\d{1,2}:\d{2}/)) {
    score -= 10;
    suggestions.push({ type: 'tip', category: 'description', message: 'Add timestamps to help viewers navigate your video', priority: 'medium' });
  }
  
  return { 
    score: Math.max(0, score), 
    suggestions 
  };
}

// ============================================
// Tags Analysis
// ============================================

export function analyzeTags(tags: string[]): { score: number; suggestions: SEOSuggestion[] } {
  const suggestions: SEOSuggestion[] = [];
  let score = 100;
  
  if (tags.length === 0) {
    return { score: 0, suggestions: [{ type: 'warning', category: 'tags', message: 'At least 3 tags are recommended', priority: 'high' }] };
  }
  
  // YouTube allows up to 500 characters for tags
  const totalLength = tags.join(',').length;
  if (totalLength > 450) {
    score -= 20;
    suggestions.push({ type: 'warning', category: 'tags', message: `Tags are ${totalLength} chars. YouTube allows 500 max`, priority: 'high' });
  }
  
  if (tags.length < 5) {
    score -= 20;
    suggestions.push({ type: 'improvement', category: 'tags', message: 'Add more tags (recommended: 5-10)', priority: 'medium' });
  } else if (tags.length > 15) {
    score -= 10;
    suggestions.push({ type: 'tip', category: 'tags', message: 'Consider reducing tags to your most relevant ones', priority: 'low' });
  }
  
  // Check for duplicate-like tags
  const lowerTags = tags.map(t => t.toLowerCase());
  const duplicates = lowerTags.filter((tag, idx) => 
    tag !== tag.toLowerCase().trim() || 
    lowerTags.slice(0, idx).some(t => t.includes(tag) || tag.includes(t))
  );
  if (duplicates.length > 0) {
    score -= 5;
    suggestions.push({ type: 'tip', category: 'tags', message: 'Some tags may be redundant', priority: 'low' });
  }
  
  return { 
    score: Math.max(0, score), 
    suggestions 
  };
}

// ============================================
// Thumbnail Analysis
// ============================================

export function analyzeThumbnail(thumbnailUrl: string | undefined): { score: number; suggestions: SEOSuggestion[] } {
  const suggestions: SEOSuggestion[] = [];
  let score = 100;
  
  if (!thumbnailUrl) {
    return { 
      score: 0, 
      suggestions: [{ type: 'improvement', category: 'thumbnail', message: 'No custom thumbnail uploaded', priority: 'high' }] 
    };
  }
  
  // In a real implementation, we would analyze the image for:
  // - Brightness/contrast
  // - Presence of text
  // - Face detection
  // - Color contrast
  
  suggestions.push({ type: 'tip', category: 'thumbnail', message: 'Ensure thumbnail has high contrast and readable text', priority: 'medium' });
  suggestions.push({ type: 'tip', category: 'thumbnail', message: 'Include a close-up face for personal branding', priority: 'low' });
  
  return { 
    score: Math.max(50, score), // Simulated score since we can't analyze the image
    suggestions 
  };
}

// ============================================
// Combined YouTube SEO Analysis
// ============================================

export function analyzeYouTubeSEO(payload: YouTubeSEOPayload): SEOScore {
  const titleAnalysis = analyzeTitle(payload.title);
  const descriptionAnalysis = analyzeDescription(payload.description);
  const tagsAnalysis = analyzeTags(payload.tags);
  const thumbnailAnalysis = analyzeThumbnail(payload.thumbnailUrl);
  
  // Combine all suggestions
  const allSuggestions = [
    ...titleAnalysis.suggestions,
    ...descriptionAnalysis.suggestions,
    ...tagsAnalysis.suggestions,
    ...thumbnailAnalysis.suggestions,
  ];
  
  // Calculate overall score (weighted average)
  const overall = Math.round(
    (titleAnalysis.score * 0.3) +
    (descriptionAnalysis.score * 0.25) +
    (tagsAnalysis.score * 0.25) +
    (thumbnailAnalysis.score * 0.2)
  );
  
  // Predict engagement based on SEO factors
  const engagementPrediction = Math.min(100, Math.round(
    (titleAnalysis.score * 0.4) +
    (descriptionAnalysis.score * 0.3) +
    (thumbnailAnalysis.score * 0.3)
  ));
  
  return {
    overall,
    title: titleAnalysis.score,
    description: descriptionAnalysis.score,
    tags: tagsAnalysis.score,
    thumbnail: thumbnailAnalysis.score,
    engagementPrediction,
    suggestions: allSuggestions,
  };
}

// ============================================
// Hashtag Generator
// ============================================

export function generateHashtagSuggestions(
  content: string,
  platform: 'tiktok' | 'instagram' | 'twitter',
  limit = 10
): HashtagSuggestion[] {
  // Common trending hashtags by category (simplified)
  const trendingHashtags: Record<string, { tag: string; trending: boolean; category: string }[]> = {
    lifestyle: [
      { tag: '#lifestyle', trending: true, category: 'lifestyle' },
      { tag: '#motivation', trending: true, category: 'lifestyle' },
      { tag: '#fyp', trending: true, category: 'lifestyle' },
      { tag: '#viral', trending: true, category: 'lifestyle' },
    ],
    tech: [
      { tag: '#tech', trending: true, category: 'tech' },
      { tag: '#ai', trending: true, category: 'tech' },
      { tag: '#coding', trending: false, category: 'tech' },
      { tag: '#programming', trending: false, category: 'tech' },
    ],
    tutorial: [
      { tag: '#tutorial', trending: true, category: 'tutorial' },
      { tag: '#howto', trending: true, category: 'tutorial' },
      { tag: '#learnontiktok', trending: true, category: 'tutorial' },
    ],
    entertainment: [
      { tag: '#funny', trending: true, category: 'entertainment' },
      { tag: '#comedy', trending: true, category: 'entertainment' },
      { tag: '#trending', trending: true, category: 'entertainment' },
    ],
  };

  // Extract keywords from content
  const contentLower = content.toLowerCase();
  const detectedCategories: string[] = [];
  
  if (contentLower.includes('tech') || contentLower.includes('software') || contentLower.includes('code')) {
    detectedCategories.push('tech');
  }
  if (contentLower.includes('how') || contentLower.includes('tutorial') || contentLower.includes('guide')) {
    detectedCategories.push('tutorial');
  }
  if (contentLower.includes('funny') || contentLower.includes('laugh')) {
    detectedCategories.push('entertainment');
  }
  
  // Always add lifestyle
  if (detectedCategories.length === 0) {
    detectedCategories.push('lifestyle');
  }
  
  // Generate suggestions
  const suggestions: HashtagSuggestion[] = [];
  
  for (const category of detectedCategories) {
    const hashtags = trendingHashtags[category] || [];
    for (const h of hashtags) {
      if (!suggestions.find(s => s.tag === h.tag)) {
        suggestions.push({
          tag: h.tag,
          usageCount: Math.floor(Math.random() * 1000000) + 10000, // Simulated
          trending: h.trending,
          score: h.trending ? 0.9 : 0.6,
        });
      }
    }
  }
  
  // Sort by score and trending
  return suggestions
    .sort((a, b) => {
      if (a.trending !== b.trending) return a.trending ? -1 : 1;
      return b.score - a.score;
    })
    .slice(0, limit);
}

// ============================================
// Engagement CTA Suggestions
// ============================================

export interface CTASuggestion {
  type: 'question' | 'call_to_action' | 'challenge' | 'poll';
  text: string;
  engagementBoost: number; // estimated percentage increase
}

export const ctaTemplates: Record<CTASuggestion['type'], string[]> = {
  question: [
    "What's your thought on this? Let me know in the comments! 👇",
    "Have you ever tried this? Share your experience below!",
    "Which would you choose? Drop your answer in the comments!",
    "Tag someone who needs to see this!",
  ],
  call_to_action: [
    "Like if you found this helpful! 👍",
    "Save this for later! 📌",
    "Follow for more content like this!",
    "Share this with someone who needs it!",
    "Turn on notifications so you don't miss out! 🔔",
  ],
  challenge: [
    "Try this and let me know how it goes!",
    "Can you do better? Show me in the comments!",
    "30 day challenge - who's in? 👇",
  ],
  poll: [
    "Drop a 🔥 if you agree, 💧 if you disagree",
    "Comment YES if you want more content like this!",
  ],
};

export function suggestCTAs(postType: 'short_form' | 'long_form' | 'reel' | 'story'): CTASuggestion[] {
  const suggestions: CTASuggestion[] = [];
  
  // Add question CTA
  const questions = ctaTemplates.question;
  suggestions.push({
    type: 'question',
    text: questions[Math.floor(Math.random() * questions.length)],
    engagementBoost: 15,
  });
  
  // Add call to action based on content type
  if (postType === 'long_form') {
    suggestions.push({
      type: 'call_to_action',
      text: ctaTemplates.call_to_action[0],
      engagementBoost: 10,
    });
    suggestions.push({
      type: 'call_to_action',
      text: ctaTemplates.call_to_action[2],
      engagementBoost: 8,
    });
  } else if (postType === 'short_form' || postType === 'reel') {
    suggestions.push({
      type: 'call_to_action',
      text: ctaTemplates.poll[0],
      engagementBoost: 20,
    });
  }
  
  return suggestions;
}

// ============================================
// Content Freshness Checker
// ============================================

export interface FreshnessResult {
  score: number; // 0-100, higher is fresher
  isStale: boolean;
  issues: string[];
  suggestions: string[];
}

export function checkContentFreshness(
  title: string,
  description: string,
  keywords: string[]
): FreshnessResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 80;
  
  // Check for outdated indicators
  const outdatedIndicators = [
    { pattern: /20\d{2}/, message: 'References to old years may feel dated' },
    { pattern: /\d+\s*years?\s*(ago|old)/i, message: 'Time-sensitive content may need updating' },
    { pattern: /outdated|old news|not relevant anymore/i, message: 'Content may contain outdated claims' },
  ];
  
  const allText = `${title} ${description} ${keywords.join(' ')}`;
  
  for (const indicator of outdatedIndicators) {
    if (indicator.pattern.test(allText)) {
      issues.push(indicator.message);
      score -= 10;
      suggestions.push('Consider removing or updating time-sensitive references');
    }
  }
  
  // Check for trending keywords
  const trendingKeywords = ['ai', 'chatgpt', 'new', 'latest', '2024', '2025'];
  const hasTrendingKeyword = trendingKeywords.some(kw => 
    allText.toLowerCase().includes(kw)
  );
  
  if (!hasTrendingKeyword) {
    suggestions.push('Consider adding trending keywords to boost discoverability');
    score -= 5;
  }
  
  return {
    score: Math.max(0, score),
    isStale: score < 50,
    issues,
    suggestions,
  };
}