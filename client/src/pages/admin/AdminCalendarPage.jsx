import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { MotionPage } from "../../lib/motion";

const EVENT_TYPES = ["exam", "deadline", "project", "event", "holiday"];

const TYPE_BADGE = {
  exam:     "bg-rose-100 text-rose-700",
  deadline: "bg-amber-100 text-amber-700",
  project:  "bg-blue-100 text-blue-700",
  event:    "bg-emerald-100 text-emerald-700",
  holiday:  "bg-violet-100 text-violet-700",
};

const AdminCalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ title: "", date: "", type: "event" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch("/calendar/upcoming", { method: "GET" });
      setEvents(data.events || []);
    } catch {
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: "", text: "" });

    try {
      const data = await apiFetch("/calendar", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setEvents((prev) => [...prev, data.event].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setForm({ title: "", date: "", type: "event" });
      setFeedback({ type: "success", text: "Event added successfully." });
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/calendar/${id}`, { method: "DELETE" });
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    }
  };

  return (
    <MotionPage className="space-y-6">
      {/* Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Academic Calendar</h1>
        <p className="mt-2 text-sm text-slate-600">Add upcoming events that appear on the home page.</p>

        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Event title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
          />
          <input
            type="date"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            required
          />
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Event"}
          </button>
        </form>

        {feedback.text && (
          <p className={`mt-3 rounded-lg px-3 py-2 text-sm font-semibold ${
            feedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }`}>
            {feedback.text}
          </p>
        )}
      </section>

      {/* Events list */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Upcoming Events</h2>

        {isLoading && <p className="mt-3 text-sm font-semibold text-slate-500">Loading...</p>}

        {!isLoading && events.length === 0 && (
          <p className="mt-3 text-sm text-slate-600">No upcoming events. Add one above.</p>
        )}

        {!isLoading && events.length > 0 && (
          <div className="mt-4 space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                    </p>
                    <p className="text-lg font-black text-slate-900">{new Date(event.date).getDate()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{event.title}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${TYPE_BADGE[event.type] || TYPE_BADGE.event}`}>
                      {event.type}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700"
                  onClick={() => handleDelete(event.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </MotionPage>
  );
};

export default AdminCalendarPage;
