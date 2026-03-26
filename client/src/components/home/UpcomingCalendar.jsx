import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

/**
 * UpcomingCalendar — right panel on light background.
 * Shows upcoming events as cards. Renders empty state if 0 events.
 */

const TYPE_CONFIG = {
  exam:     { label: "Exam",     dot: "bg-rose-500",    badge: "bg-rose-50 text-rose-700 border-rose-200", card: "border-rose-200", dateBg: "bg-rose-50 text-rose-700" },
  deadline: { label: "Deadline", dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-200", card: "border-amber-200", dateBg: "bg-amber-50 text-amber-700" },
  project:  { label: "Project",  dot: "bg-blue-500",    badge: "bg-blue-50 text-blue-700 border-blue-200", card: "border-blue-200", dateBg: "bg-blue-50 text-blue-700" },
  event:    { label: "Event",    dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", card: "border-emerald-200", dateBg: "bg-emerald-50 text-emerald-700" },
  holiday:  { label: "Holiday",  dot: "bg-violet-500",  badge: "bg-violet-50 text-violet-700 border-violet-200", card: "border-violet-200", dateBg: "bg-violet-50 text-violet-700" },
};

const getDaysAway = (dateStr) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - now) / (1000 * 60 * 60 * 24));
};

const formatDaysLabel = (days) => {
  if (days === 0) return "Today!";
  if (days === 1) return "Tomorrow";
  return `in ${days} days`;
};

const EventCard = ({ event, isClosest }) => {
  const date = new Date(event.date);
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const days = getDaysAway(event.date);
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.event;

  return (
    <div className={`relative flex items-start gap-3 rounded-xl border bg-white p-3 shadow-sm transition-all ${config.card} ${isClosest ? "ring-1 ring-slate-300" : ""}`}>
      {/* Closest accent bar */}
      {isClosest && (
        <div className={`absolute -left-px top-3 h-5 w-1 rounded-r-full ${config.dot}`} />
      )}

      {/* Date block */}
      <div className={`flex shrink-0 flex-col items-center rounded-lg px-2.5 py-1.5 ${config.dateBg}`}>
        <span className="text-[9px] font-bold uppercase opacity-70">{month}</span>
        <span className="text-xl font-black leading-none">{day}</span>
        <span className="text-[9px] font-semibold opacity-50">{weekday}</span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-bold text-slate-900">{event.title}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${config.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {config.label}
          </span>
          <span className={`text-[10px] font-bold ${days === 0 ? "text-amber-600" : "text-slate-400"}`}>
            {formatDaysLabel(days)}
          </span>
        </div>
      </div>
    </div>
  );
};

const UpcomingCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/calendar/upcoming", { method: "GET" });
        setEvents(data.events || []);
      } catch {
        // Silent fail
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-black text-slate-900">Upcoming</h3>
        </div>
        {events.length > 0 && (
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">{events.length}</span>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && events.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-8 w-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs font-semibold text-slate-400">No upcoming events</p>
          <p className="mt-0.5 text-[10px] text-slate-300">Check back later</p>
        </div>
      )}

      {/* Event list */}
      {!isLoading && events.length > 0 && (
        <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto scrollbar-none">
          {events.slice(0, 4).map((event, i) => (
            <EventCard key={event.id} event={event} isClosest={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingCalendar;
