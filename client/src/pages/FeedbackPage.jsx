import { useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";
import { MotionCard } from "../lib/motion";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { key: "secret", label: "Secret", emoji: "🤫", color: "bg-gray-600", light: "bg-gray-50 text-gray-600 border-gray-200" },
  { key: "complaint", label: "Complaint", emoji: "😤", color: "bg-red-600", light: "bg-red-50 text-red-600 border-red-200" },
  { key: "suggestion", label: "Suggestion", emoji: "💡", color: "bg-amber-500", light: "bg-amber-50 text-amber-600 border-amber-200" },
  { key: "appreciation", label: "Appreciation", emoji: "🎉", color: "bg-emerald-600", light: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { key: "general", label: "General", emoji: "💬", color: "bg-sky-600", light: "bg-sky-50 text-sky-600 border-sky-200" },
];

const EMOJI_REACTIONS = ["😂", "👏", "🔥", "💯", "😭", "🤝", "❤️", "🙌"];

const MIN_CHARS = 10;
const MAX_CHARS = 1000;

const FeedbackPage = () => {
  const { user } = useAuth();

  const [category, setCategory] = useState("general");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [voices, setVoices] = useState([]);
  const [voicesLoading, setVoicesLoading] = useState(true);

  const charCount = content.length;
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;

  const loadVoices = async () => {
    try {
      const data = await apiFetch("/feedback/approved", { method: "GET" });
      setVoices(data.feedbacks || []);
    } catch {
      // silent
    } finally {
      setVoicesLoading(false);
    }
  };

  useEffect(() => { loadVoices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || loading) return;
    setError("");
    setLoading(true);
    try {
      await apiFetch("/feedback", {
        method: "POST",
        body: JSON.stringify({ content, category }),
      });
      setSubmitted(true);
      setContent("");
      setCategory("general");
      loadVoices();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const feedbackIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );

  return (
    <AppLayout
      activePage="feedback"
      user={user}
      title="Voice Your Say"
      subtitle="Anonymous feedback portal"
      icon={feedbackIcon}
    >
      <div className="mx-auto max-w-3xl space-y-10">

        {/* ── Student Voices Wall (displayed FIRST) ── */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <span className="text-2xl">🗣️</span>
            <div>
              <h2 className="text-lg font-black text-slate-900">The Wall of Voices</h2>
              <p className="text-xs text-slate-500">Real thoughts from real students. No names, no filters, just vibes.</p>
            </div>
          </div>

          {voicesLoading && (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-violet-500" />
            </div>
          )}

          {!voicesLoading && voices.length === 0 && (
            <MotionCard>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <span className="text-4xl">🦗</span>
                <p className="mt-3 text-sm font-bold text-slate-600">crickets... nobody spoke yet</p>
                <p className="mt-1 text-xs text-slate-400">Be the first to break the silence!</p>
              </div>
            </MotionCard>
          )}

          {!voicesLoading && voices.length > 0 && (
            <div className="columns-1 gap-3 sm:columns-2">
              {voices.map((v, i) => {
                const catConfig = CATEGORIES.find((c) => c.key === v.category) || CATEGORIES[3];
                const date = new Date(v.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                const randomEmoji = EMOJI_REACTIONS[i % EMOJI_REACTIONS.length];
                return (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="mb-3 break-inside-avoid rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${catConfig.light}`}>
                        {catConfig.emoji} {catConfig.label}
                      </span>
                      <span className="text-[10px] text-slate-300">{date}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">{v.content}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">Anonymous</span>
                      </div>
                      <span className="text-sm" title="vibe">{randomEmoji}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Your turn</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* ── Compact heading + form ── */}
        <section>
          <div className="mb-4 text-center">
            <span className="text-3xl">🎤</span>
            <h3 className="mt-2 text-lg font-black text-slate-900">Drop Your Thoughts</h3>
            <p className="mt-1 text-xs text-slate-500">No one knows it's you. Pinky promise. 🤞</p>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ type: "spring", stiffness: 80, damping: 16 }}
              >
                <div className="rounded-2xl border border-emerald-200 bg-white px-6 py-10 text-center shadow-sm">
                  <motion.div
                    className="mx-auto mb-4 text-5xl"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.15 }}
                  >
                    🎊
                  </motion.div>
                  <h3 className="text-xl font-black text-slate-900">Mic Dropped!</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                    Your voice has been heard (anonymously). Admin will review it soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="btn-press mt-5 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-700"
                  >
                    🎤 Go Again
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 80, damping: 16 }}
              >
                <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  {/* Category */}
                  <div className="mb-4">
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      What's the vibe?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setCategory(cat.key)}
                          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${category === cat.key
                            ? `${cat.color} text-white shadow-sm`
                            : `border border-slate-200 bg-white text-slate-600 hover:border-slate-300`
                            }`}
                        >
                          {cat.emoji} {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Textarea */}
                  <div className="mb-4">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Spill the tea... ☕ (min 10 characters)"
                      rows={4}
                      maxLength={MAX_CHARS}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-violet-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                    />
                    <div className="mt-1 flex items-center justify-between">
                      <p className={`text-[10px] ${charCount > 0 && charCount < MIN_CHARS ? "text-red-500" : "text-slate-400"}`}>
                        {charCount > 0 && charCount < MIN_CHARS
                          ? `${MIN_CHARS - charCount} more to go...`
                          : "\u00A0"}
                      </p>
                      <p className={`text-[10px] font-medium ${charCount > MAX_CHARS * 0.9 ? "text-amber-500" : "text-slate-400"}`}>
                        {charCount}/{MAX_CHARS}
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!isValid || loading}
                    className="btn-press flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send It"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-[10px] font-semibold">100% anonymous. We literally can't see who you are.</p>
          </div>
        </section>

      </div>
    </AppLayout>
  );
};

export default FeedbackPage;
