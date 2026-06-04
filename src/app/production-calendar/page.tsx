'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar,
  Camera, Film, Edit3, Clock, CheckCircle, AlertCircle, Eye, Flag
} from 'lucide-react';
import { 
  format, startOfWeek, endOfWeek, eachDayOfInterval, 
  isSameDay, addWeeks, subWeeks, isToday
} from 'date-fns';
import { usePostsStore } from '@/stores';

interface ProductionItem {
  id: string;
  title: string;
  type: 'filming' | 'editing' | 'review' | 'milestone';
  date: string;
  projectTitle: string;
  notes?: string;
  completed: boolean;
}

export default function ProductionCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');
  
  // Get posts from store to generate production items
  const posts = usePostsStore((s) => s.posts);
  
  // Convert posts to production items
  const items: ProductionItem[] = useMemo(() => {
    return posts.map((post) => {
      const scheduledDate = post.scheduledAt 
        ? format(new Date(post.scheduledAt), 'yyyy-MM-dd')
        : format(new Date(post.createdAt), 'yyyy-MM-dd');
      
      // Determine type based on post status
      let type: ProductionItem['type'] = 'review';
      if (post.status === 'draft') type = 'filming';
      else if (post.status === 'scheduled') type = 'milestone';
      
      return {
        id: post.id,
        title: post.content.slice(0, 50) || 'Untitled Post',
        type,
        date: scheduledDate,
        projectTitle: `Post to ${post.platforms.join(', ')}`,
        completed: post.status === 'published',
      };
    });
  }, [posts]);

  // Get week days
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Get items for a day
  const getItemsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return items.filter((item) => item.date === dateStr);
  };

  // Navigation
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Type icons
  const typeConfig = {
    filming: { icon: Camera, color: 'bg-purple-100 border-purple-300', text: 'text-purple-700' },
    editing: { icon: Film, color: 'bg-orange-100 border-orange-300', text: 'text-orange-700' },
    review: { icon: Eye, color: 'bg-yellow-100 border-yellow-300', text: 'text-yellow-700' },
    milestone: { icon: Flag, color: 'bg-blue-100 border-blue-300', text: 'text-blue-700' },
  };

  // Stats
  const stats = {
    today: items.filter((i) => isSameDay(new Date(i.date), new Date())).length,
    thisWeek: items.filter((i) => {
      const itemDate = new Date(i.date);
      return itemDate >= startOfWeek(currentDate) && itemDate <= endOfWeek(currentDate);
    }).length,
    completed: items.filter((i) => i.completed).length,
    overdue: items.filter((i) => !i.completed && new Date(i.date) < new Date()).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Calendar</h1>
          <p className="text-gray-500 mt-1">Track filming, editing, and milestone deadlines</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Today
          </button>
          <div className="flex items-center bg-gray-100 rounded-lg">
            <button onClick={prevWeek} className="p-2 hover:bg-gray-200 rounded-l-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 font-medium">
              {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
            </span>
            <button onClick={nextWeek} className="p-2 hover:bg-gray-200 rounded-r-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.today}</p>
              <p className="text-sm text-gray-500">Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.thisWeek}</p>
              <p className="text-sm text-gray-500">This Week</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.overdue}</p>
              <p className="text-sm text-gray-500">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-500">Task Types:</span>
        {Object.entries(typeConfig).map(([type, config]) => (
          <div key={type} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${config.color}`} />
            <span className="capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={`px-3 py-3 text-center ${
                isToday(day) ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <p className="text-sm font-medium">{format(day, 'EEE')}</p>
              <p className="text-lg font-bold">{format(day, 'd')}</p>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {weekDays.map((day, idx) => {
            const dayItems = getItemsForDay(day);
            
            return (
              <div
                key={idx}
                className={`min-h-[200px] border-b border-r p-2 ${
                  isToday(day) ? 'bg-blue-50/30' : ''
                }`}
              >
                {dayItems.map((item) => {
                  const config = typeConfig[item.type];
                  return (
                    <div
                      key={item.id}
                      className={`mb-2 p-2 rounded-lg border ${config.color} ${
                        item.completed ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-1">
                        {item.completed && (
                          <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 truncate">{item.projectTitle}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Upcoming Deadlines</h2>
        <div className="space-y-3">
          {items.filter((i) => !i.completed).slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                typeConfig[item.type].color
              }`}>
                {item.type === 'filming' && <Camera className="w-5 h-5" />}
                {item.type === 'editing' && <Film className="w-5 h-5" />}
                {item.type === 'review' && <Eye />}
                {item.type === 'milestone' && <Flag />}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">{item.projectTitle}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{format(new Date(item.date), 'MMM d')}</p>
                {new Date(item.date) < new Date() && (
                  <p className="text-xs text-red-500">Overdue</p>
                )}
              </div>
            </div>
          ))}
          {items.filter((i) => !i.completed).length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No upcoming deadlines</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}