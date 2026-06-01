'use client';

import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import type { CalendarEvent } from '@/types';
import { PlatformPills } from '../dashboard/PostCard';

// ============================================
// Calendar Component
// ============================================

interface CalendarProps {
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  selectedDate?: Date;
}

export function Calendar({ events, onDateClick, onEventClick, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    
    events.forEach((event) => {
      const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(event);
    });
    
    return map;
  }, [events]);

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            Today
          </button>
          <button
            onClick={previousMonth}
            className="p-1.5 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-[var(--color-border)]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-[var(--color-text-secondary)]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isDayToday = isToday(day);

          return (
            <div
              key={idx}
              className={clsx(
                'min-h-[100px] p-1 border-b border-r border-[var(--color-border)]',
                'hover:bg-[var(--color-bg-secondary)]/50 transition-colors cursor-pointer',
                !isCurrentMonth && 'bg-[var(--color-bg-secondary)]/30',
                isSelected && 'ring-2 ring-inset ring-[var(--color-accent)]'
              )}
              onClick={() => onDateClick?.(day)}
            >
              <div className="flex items-center justify-between p-1">
                <span
                  className={clsx(
                    'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm',
                    isDayToday && 'bg-[var(--color-accent)] text-white font-semibold',
                    !isDayToday && isCurrentMonth && 'text-[var(--color-text-primary)]',
                    !isCurrentMonth && 'text-[var(--color-text-muted)]'
                  )}
                >
                  {format(day, 'd')}
                </span>
                
                {onDateClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateClick(day);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--color-bg-secondary)]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Events */}
              <div className="space-y-0.5 mt-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className={clsx(
                      'w-full text-left text-xs px-1.5 py-0.5 rounded truncate',
                      'hover:bg-[var(--color-accent)]/10 transition-colors',
                      event.type === 'post' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                      event.type === 'filming' && 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
                      event.type === 'milestone' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
                      event.type === 'deadline' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    )}
                  >
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-xs text-[var(--color-text-muted)] px-1.5">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 p-3 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30">
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
          <span className="w-3 h-3 rounded bg-blue-400" />
          Posts
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
          <span className="w-3 h-3 rounded bg-purple-400" />
          Filming
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
          <span className="w-3 h-3 rounded bg-amber-400" />
          Milestones
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
          <span className="w-3 h-3 rounded bg-red-400" />
          Deadlines
        </div>
      </div>
    </div>
  );
}

// ============================================
// Mini Calendar (for sidebar)
// ============================================

interface MiniCalendarProps {
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
}

export function MiniCalendar({ selectedDate, onSelectDate }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth]);

  return (
    <div className="bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)] p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">
          {format(currentMonth, 'MMM yyyy')}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 rounded hover:bg-[var(--color-bg-secondary)]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 rounded hover:bg-[var(--color-bg-secondary)]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
          <div
            key={idx}
            className="text-center text-xs font-medium text-[var(--color-text-muted)] py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isDayToday = isToday(day);

          return (
            <button
              key={idx}
              onClick={() => onSelectDate?.(day)}
              className={clsx(
                'text-xs p-1.5 rounded-full text-center',
                'hover:bg-[var(--color-bg-secondary)] transition-colors',
                isDayToday && 'bg-[var(--color-accent)] text-white font-semibold',
                !isDayToday && isSelected && 'bg-[var(--color-accent-light)] text-[var(--color-accent)]',
                !isCurrentMonth && 'text-[var(--color-text-muted)] opacity-50'
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}