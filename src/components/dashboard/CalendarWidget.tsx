'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Loader2, ExternalLink } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuthStore, useDataStore } from '@/lib/store';
import { getCalendarEvents } from '@/lib/google-api';
import type { CalendarEvent } from '@/types/google';

// Helper to format time
function formatEventTime(event: CalendarEvent): string {
  const start = event.start.dateTime || event.start.date;
  if (!start) return '';

  const date = new Date(start);

  if (event.start.date && !event.start.dateTime) {
    // All-day event
    return 'Dia inteiro';
  }

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Helper to format relative date
function formatRelativeDate(event: CalendarEvent): string {
  const start = event.start.dateTime || event.start.date;
  if (!start) return '';

  const eventDate = new Date(start);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Reset time for comparison
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const tomorrowDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

  if (eventDay.getTime() === todayDay.getTime()) {
    return 'Hoje';
  } else if (eventDay.getTime() === tomorrowDay.getTime()) {
    return 'Amanhã';
  } else {
    return eventDate.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }
}

// Group events by date
function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const grouped = new Map<string, CalendarEvent[]>();

  events.forEach((event) => {
    const dateKey = formatRelativeDate(event);
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, event]);
  });

  return grouped;
}

// Color palette for events
const EVENT_COLORS = [
  'from-blue-500/30 to-blue-600/20 border-blue-400/30',
  'from-green-500/30 to-green-600/20 border-green-400/30',
  'from-purple-500/30 to-purple-600/20 border-purple-400/30',
  'from-pink-500/30 to-pink-600/20 border-pink-400/30',
  'from-cyan-500/30 to-cyan-600/20 border-cyan-400/30',
  'from-orange-500/30 to-orange-600/20 border-orange-400/30',
];

function getEventColor(colorId?: string): string {
  const index = colorId ? parseInt(colorId, 10) % EVENT_COLORS.length : 0;
  return EVENT_COLORS[index];
}

export function CalendarWidget() {
  const { accessToken } = useAuthStore();
  const { events, isLoadingEvents, setEvents, setLoadingEvents } = useDataStore();

  const loadEvents = useCallback(async () => {
    if (!accessToken) return;

    setLoadingEvents(true);
    try {
      const response = await getCalendarEvents(accessToken, 'primary', 7);
      setEvents(response.items || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoadingEvents(false);
    }
  }, [accessToken, setEvents, setLoadingEvents]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const groupedEvents = groupEventsByDate(events);

  return (
    <GlassCard className="h-full flex flex-col" glow="blue">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Agenda</h2>
            <p className="text-xs text-white/50">Próximos 7 dias</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-white">
            {new Date().getDate()}
          </p>
          <p className="text-xs text-white/50 uppercase">
            {new Date().toLocaleDateString('pt-BR', { month: 'short' })}
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-4">
        {isLoadingEvents ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-white/40">
            <Calendar className="w-10 h-10 mb-2" />
            <p className="text-sm">Nenhum evento próximo</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {Array.from(groupedEvents.entries()).map(([dateKey, dateEvents], groupIndex) => (
              <motion.div
                key={dateKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 pl-1">
                  {dateKey}
                </h3>
                <div className="space-y-2">
                  {dateEvents.map((event, index) => (
                    <motion.a
                      key={event.id}
                      href={event.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                      className={`group block rounded-xl p-3 bg-gradient-to-r ${getEventColor(
                        event.colorId
                      )} border backdrop-blur-sm hover:scale-[1.02] transition-all cursor-pointer`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate group-hover:text-white/90">
                            {event.summary || 'Sem título'}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-white/60">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">{formatEventTime(event)}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1 text-white/60">
                                <MapPin className="w-3 h-3" />
                                <span className="text-xs truncate max-w-[100px]">
                                  {event.location}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0" />
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </GlassCard>
  );
}

