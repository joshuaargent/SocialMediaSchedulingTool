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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-gray-500 mt-1">Visual overview of your scheduled posts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Today
          </button>
          <div className="flex items-center bg-gray-100 rounded-lg">
            <button
              onClick={goToPrev}
              className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 font-medium min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Platform Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-500">Platforms:</span>
        {Object.entries(platformColors).map(([platform, color]) => (
          <div key={platform} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${color}`} />
            <span className="capitalize">{platform}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="px-3 py-3 text-center text-sm font-medium text-gray-500">
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
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'ring-2 ring-inset ring-blue-500' : ''}`}
              >
                {/* Day Number */}
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday ? 'text-blue-600' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                {/* Posts */}
                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      className="text-xs p-1.5 rounded bg-gray-100 truncate cursor-pointer hover:bg-gray-200"
                      title={post.content}
                    >
                      <div className="flex items-center gap-1">
                        {post.platforms.map((p) => (
                          <div key={p} className={`w-2 h-2 rounded-full ${platformColors[p] || 'bg-gray-400'}`} />
                        ))}
                        <span className="truncate">{post.content}</span>
                      </div>
                    </div>
                  ))}
                  {dayPosts.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayPosts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Posts */}
      <div className="bg-white rounded-xl border p-6">
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
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded bg-white border flex items-center justify-center">
                  {post.mediaUrls.length > 0 ? (
                    <img src={post.mediaUrls[0]} alt="" className="w-full h-full object-cover rounded" />
                  ) : (
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{post.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-1">
                      {post.platforms.map((p) => (
                        <div key={p} className={`px-1.5 py-0.5 text-xs rounded text-white capitalize ${platformColors[p] || 'bg-gray-400'}`}>
                          {p}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {post.scheduledAt && format(new Date(post.scheduledAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
                <div className={`flex-shrink-0 px-2 py-1 text-xs rounded-full ${
                  post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {post.status}
                </div>
              </div>
            ))}
          {posts.filter((p) => p.scheduledAt && new Date(p.scheduledAt) >= new Date()).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming posts scheduled</p>
              <p className="text-sm">Create a post to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}