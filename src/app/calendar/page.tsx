'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Clock, 
  Calendar as CalendarIcon, CheckCircle, AlertCircle 
} from 'lucide-react';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths
} from 'date-fns';
import { Card } from '@/components/ui/Card';

interface Post {
  id: string;
  content: string;
  platforms: string[];
  scheduledAt: string | null;
  status: string;
  mediaUrls: string[];
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [view, setView] = useState<'month' | 'week'>('month');

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/db/posts?status=scheduled');
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    };
    fetchPosts();
  }, []);

  // Get calendar days
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Get posts for a specific day
  const getPostsForDay = (day: Date) => {
    return posts.filter((post) => {
      if (!post.scheduledAt) return false;
      return isSameDay(new Date(post.scheduledAt), day);
    });
  };

  // Navigation
  const goToPrev = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNext = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Platform colors
  const platformColors: Record<string, string> = {
    tiktok: 'bg-pink-500',
    facebook: 'bg-blue-600',
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
    youtube: 'bg-red-600',
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Content Calendar</h1>
          <p className="text-text-secondary mt-1">Visual overview of your scheduled posts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm bg-bg-secondary hover:bg-border rounded-lg transition-colors"
          >
            Today
          </button>
          <div className="flex items-center bg-bg-secondary rounded-lg">
            <button
              onClick={goToPrev}
              className="p-2 hover:bg-border rounded-l-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 font-medium min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-border rounded-r-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Platform Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-text-muted">Platforms:</span>
        {Object.entries(platformColors).map(([platform, color]) => (
          <div key={platform} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${color}`} />
            <span className="capitalize text-text-secondary">{platform}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b bg-bg-secondary">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="px-3 py-3 text-center text-sm font-medium text-text-muted">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayPosts = getPostsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={idx}
                className={`min-h-[120px] border-b border-r p-2 ${
                  isCurrentMonth ? 'bg-bg-card' : 'bg-bg-secondary'
                } ${isToday ? 'ring-2 ring-inset ring-accent' : ''}`}
              >
                {/* Day Number */}
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-text-primary' : 'text-text-muted'
                } ${isToday ? 'text-accent' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                {/* Posts */}
                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      className="text-xs p-1.5 rounded bg-bg-secondary truncate cursor-pointer hover:bg-border transition-colors"
                      title={post.content}
                    >
                      <div className="flex items-center gap-1">
                        {post.platforms.map((p) => (
                          <div key={p} className={`w-2 h-2 rounded-full ${platformColors[p] || 'bg-text-muted'}`} />
                        ))}
                        <span className="truncate">{post.content}</span>
                      </div>
                    </div>
                  ))}
                  {dayPosts.length > 3 && (
                    <div className="text-xs text-text-muted text-center">
                      +{dayPosts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Upcoming Posts */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Upcoming Posts
        </h2>
        <div className="space-y-3">
          {posts
            .filter((p) => p.scheduledAt && new Date(p.scheduledAt) >= new Date())
            .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
            .slice(0, 5)
            .map((post) => (
              <div
                key={post.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-bg-secondary hover:bg-border transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded bg-bg-card border flex items-center justify-center">
                  {post.mediaUrls.length > 0 ? (
                    <img src={post.mediaUrls[0]} alt="" className="w-full h-full object-cover rounded" />
                  ) : (
                    <CalendarIcon className="w-5 h-5 text-text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{post.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-1">
                      {post.platforms.map((p) => (
                        <div key={p} className={`px-1.5 py-0.5 text-xs rounded text-white capitalize ${platformColors[p]}`}>
                          {p}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-text-muted">
                      {post.scheduledAt && format(new Date(post.scheduledAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
                <div className={`flex-shrink-0 px-2 py-1 text-xs rounded-full ${
                  post.status === 'scheduled' ? 'bg-accent/10 text-accent' : 'bg-bg-secondary text-text-muted'
                }`}>
                  {post.status}
                </div>
              </div>
            ))}
          {posts.filter((p) => p.scheduledAt && new Date(p.scheduledAt) >= new Date()).length === 0 && (
            <div className="text-center py-8 text-text-muted">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-50" />
              <p>No upcoming posts scheduled</p>
              <p className="text-sm mt-1">Create a post to get started</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}