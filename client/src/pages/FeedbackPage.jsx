/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeProvider";
import { apiFetch } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { key: "secret", label: "Secret", emoji: "🤫", darkBadge: "bg-purple-950/60 text-purple-300 border-purple-800/80", lightBadge: "bg-purple-50 text-purple-700 border-purple-200/80" },
  { key: "complaint", label: "Complaint", emoji: "😤", darkBadge: "bg-rose-950/60 text-rose-300 border-rose-800/80", lightBadge: "bg-rose-50 text-rose-700 border-rose-200/80" },
  { key: "suggestion", label: "Suggestion", emoji: "💡", darkBadge: "bg-amber-950/60 text-amber-300 border-amber-800/80", lightBadge: "bg-amber-50 text-amber-700 border-amber-200/80" },
  { key: "appreciation", label: "Appreciation", emoji: "🎉", darkBadge: "bg-emerald-950/60 text-emerald-300 border-emerald-800/80", lightBadge: "bg-emerald-50 text-emerald-700 border-emerald-200/80" },
  { key: "general", label: "General", emoji: "💬", darkBadge: "bg-sky-950/60 text-sky-300 border-sky-800/80", lightBadge: "bg-sky-50 text-sky-700 border-sky-200/80" },
];

const EMOJI_OPTIONS = ["❤️", "🔥", "💡", "👏"];
const PAGE_LIMIT = 10;
const MIN_CHARS = 10;
const MAX_CHARS = 1000;

const FeedbackPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [category, setCategory] = useState("general");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [showCategoryTray, setShowCategoryTray] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Feed & Cursor Pagination State
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [reactions, setReactions] = useState({});

  const charCount = content.length;
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  const currentCatObj = CATEGORIES.find((c) => c.key === category) || CATEGORIES[4];
  const isMobileInputExpanded = isInputFocused || content.length > 0;

  // ── Fetch Initial Feedback (Cursor-based) ──
  const fetchVoices = useCallback(async (filterCategory = "all") => {
    setLoading(true);
    try {
      const queryCategory = filterCategory === "all" ? "" : `&category=${filterCategory}`;
      const data = await apiFetch(`/feedback/approved?limit=${PAGE_LIMIT}${queryCategory}`, { method: "GET" });
      setVoices(data.feedbacks || []);
      setHasMore(!!data.hasMore);
    } catch {
      // silent catch
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVoices(activeFilter);
  }, [activeFilter, fetchVoices]);

  // ── Load More (Cursor Pagination) ──
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || voices.length === 0) return;
    setLoadingMore(true);
    const lastId = voices[voices.length - 1].id;
    try {
      const queryCategory = activeFilter === "all" ? "" : `&category=${activeFilter}`;
      const data = await apiFetch(`/feedback/approved?limit=${PAGE_LIMIT}&before=${lastId}${queryCategory}`, { method: "GET" });
      const newItems = data.feedbacks || [];
      setVoices((prev) => [...prev, ...newItems]);
      setHasMore(!!data.hasMore);
    } catch {
      // silent catch
    } finally {
      setLoadingMore(false);
    }
  };

  // ── Handle Post Submission ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setFormError("");
    setSubmitting(true);
    try {
      await apiFetch("/feedback", {
        method: "POST",
        body: JSON.stringify({ content, category }),
      });
      setSubmitted(true);
      setContent("");
      setCategory("general");
      setShowCategoryTray(false);
      fetchVoices(activeFilter);
    } catch (err) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReaction = (voiceId, emoji) => {
    setReactions((prev) => {
      const current = prev[voiceId] || {};
      const count = current[emoji] || 0;
      const userReacted = current[`user_${emoji}`];

      return {
        ...prev,
        [voiceId]: {
          ...current,
          [emoji]: userReacted ? count - 1 : count + 1,
          [`user_${emoji}`]: !userReacted,
        },
      };
    });
  };

  const feedbackIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isDark ? "text-slate-400" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );

  return (
    <AppLayout
      activePage="feedback"
      user={user}
      title="Voice Your Say"
      subtitle="100% Anonymous campus feedback"
      icon={feedbackIcon}
      noScroll={true}
      hideMobileHeader={true}
    >
      {/* ── App Layout Container ── */}
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden">

        <div className="flex h-full flex-col overflow-hidden lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">

          {/* ── MESSAGES FEED AREA: Takes ~90% Screen Space on Mobile (order-1, flex-1, overflow-hidden) ── */}
          <div className="order-1 flex flex-1 min-h-0 flex-col overflow-hidden lg:order-2 lg:col-span-7 lg:h-full">
            
            {/* Top Category Filter Bar: Text-Only Minimalist Pills */}
            <div className={`shrink-0 mb-2.5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap border-b pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              isDark ? "border-slate-800" : "border-slate-200/80"
            }`}>
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`inline-flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                  activeFilter === "all"
                    ? isDark
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                      : "bg-slate-900 text-white shadow-xs"
                    : isDark
                      ? "border border-slate-800 bg-slate-800/90 text-slate-200 hover:bg-slate-700"
                      : "border border-slate-200 bg-slate-100/90 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Voices
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveFilter(cat.key)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                    activeFilter === cat.key
                      ? isDark
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                        : "bg-slate-900 text-white shadow-xs"
                      : isDark
                        ? "border border-slate-800 bg-slate-800/90 text-slate-200 hover:bg-slate-700"
                        : "border border-slate-200 bg-slate-100/90 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Messages Feed List */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 sm:pr-2">

              {/* Loading Spinner */}
              {loading && (
                <div className="flex justify-center py-12">
                  <div className={`h-5 w-5 animate-spin rounded-full border-2 ${
                    isDark ? "border-slate-700 border-t-white" : "border-slate-300 border-t-slate-900"
                  }`} />
                </div>
              )}

              {/* Empty State */}
              {!loading && voices.length === 0 && (
                <div className={`rounded-3xl border border-dashed p-8 text-center ${
                  isDark ? "border-slate-800 bg-slate-900 text-slate-400" : "border-slate-200 bg-white text-slate-500"
                }`}>
                  <p className="text-xs font-semibold">No approved voices in this category yet.</p>
                </div>
              )}

              {/* Feed Cards */}
              {!loading && voices.length > 0 && (
                <div className="space-y-3 pb-2">
                  {voices.map((v) => {
                    const catConfig = CATEGORIES.find((c) => c.key === v.category) || CATEGORIES[4];
                    const date = new Date(v.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    const voiceReactions = reactions[v.id] || {};

                    return (
                      <div
                        key={v.id}
                        className={`rounded-3xl border p-4.5 transition-all ${
                          isDark
                            ? "border-slate-800 bg-slate-900 hover:border-slate-700"
                            : "border-slate-200/80 bg-white shadow-xs hover:border-slate-300"
                        }`}
                      >
                        <div className="mb-2.5 flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                            isDark ? catConfig.darkBadge : catConfig.lightBadge
                          }`}>
                            {catConfig.label}
                          </span>
                          <span className={`text-[10px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>{date}</span>
                        </div>

                        <p className={`text-xs leading-relaxed ${isDark ? "text-slate-200" : "text-slate-800"}`}>{v.content}</p>

                        <div className={`mt-3.5 flex items-center justify-between border-t pt-3 ${
                          isDark ? "border-slate-800/80" : "border-slate-100"
                        }`}>
                          <span className={`text-[10px] font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            Anonymous Voice
                          </span>

                          <div className="flex items-center gap-1">
                            {EMOJI_OPTIONS.map((emoji) => {
                              const count = voiceReactions[emoji] || 0;
                              const hasReacted = voiceReactions[`user_${emoji}`];
                              return (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => toggleReaction(v.id, emoji)}
                                  className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs transition-all ${
                                    hasReacted
                                      ? isDark
                                        ? "bg-violet-600 text-white font-bold"
                                        : "bg-slate-900 text-white font-bold"
                                      : isDark
                                        ? "border border-slate-800 bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                                        : "border border-slate-200/80 bg-slate-100/70 text-slate-600 hover:bg-slate-200/70"
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  {count > 0 && <span className="text-[10px]">{count}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* ── Cursor-based "Load More" Button ── */}
                  {hasMore && (
                    <div className="py-2 text-center">
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className={`rounded-2xl border px-5 py-2 text-xs font-bold transition-all disabled:opacity-50 ${
                          isDark
                            ? "border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800"
                            : "border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50"
                        }`}
                      >
                        {loadingMore ? "Loading..." : "Load More Voices"}
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* ── MOBILE PERFECTLY ALIGNED CHAT BAR (Icon Left | Expanding Input Middle | Send Button Right) ── */}
          <div className="order-2 shrink-0 border-t pt-2 lg:hidden dark:border-slate-800 border-slate-200 bg-white dark:bg-slate-900 px-3 py-2.5">
            
            {/* Category Expansion Tray (Slides up when Icon Button is tapped) */}
            <AnimatePresence>
              {showCategoryTray && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  className={`mb-2.5 overflow-hidden rounded-2xl border p-2.5 ${
                    isDark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="mb-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                    Select Category
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => {
                          setCategory(cat.key);
                          setShowCategoryTray(false);
                        }}
                        className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                          category === cat.key
                            ? isDark
                              ? "bg-violet-600 text-white shadow-md"
                              : "bg-slate-900 text-white shadow-xs"
                            : isDark
                              ? "bg-slate-800 text-slate-200 border border-slate-700/60"
                              : "bg-white text-slate-700 border border-slate-200"
                        }`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Chat Bar: Equal Vertical Height Alignment */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              
              {/* LEFT: Category Icon-Only Button */}
              <button
                type="button"
                onClick={() => setShowCategoryTray((prev) => !prev)}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base transition-all ${
                  isDark
                    ? "bg-slate-800 text-slate-200 border border-slate-700/80 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                }`}
                title={`Category: ${currentCatObj.label}`}
              >
                <span>{currentCatObj.emoji}</span>
              </button>

              {/* MIDDLE: Textarea Field (Preserves 'Write here...' placeholder and auto-expands!) */}
              <div className="flex-1 min-w-0">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Write here..."
                  rows={isMobileInputExpanded ? 3 : 1}
                  maxLength={MAX_CHARS}
                  className={`w-full resize-none rounded-2xl border px-3.5 py-2 text-xs focus:outline-none transition-all duration-200 ${
                    isDark
                      ? "border-slate-700/80 bg-slate-950 text-slate-100 placeholder-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white"
                  }`}
                />
              </div>

              {/* RIGHT: Send Button (h-10 rounded-full perfectly aligned with icon button!) */}
              <button
                type="submit"
                disabled={!isValid || submitting}
                className={`flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-xs font-extrabold transition-all disabled:opacity-40 ${
                  isDark
                    ? "bg-violet-600 text-white hover:bg-violet-500 shadow-md shadow-violet-600/30"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {submitting ? "..." : "Send"}
              </button>
            </form>
          </div>

          {/* ── DESKTOP INPUT CARD (hidden on mobile, visible on desktop col-span-5) ── */}
          <div className="hidden lg:block lg:order-1 lg:col-span-5 lg:pt-0">
            
            <div className={`rounded-3xl border p-5 lg:p-6 transition-all ${
              isDark
                ? "border-slate-800 bg-slate-900 shadow-xl"
                : "border-slate-200/80 bg-white shadow-sm"
            }`}>

              {/* Card Header */}
              <div className={`mb-3.5 flex items-center justify-between border-b pb-3 ${
                isDark ? "border-slate-800/80" : "border-slate-100"
              }`}>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                  <h3 className={`text-xs font-extrabold tracking-wide sm:text-sm ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}>Submit Feedback</h3>
                </div>

                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                  isDark
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/80"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                }`}>
                  🔒 Anonymous
                </span>
              </div>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-4 text-center"
                  >
                    <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-bold ${
                      isDark ? "bg-emerald-950/80 text-emerald-300" : "bg-emerald-100 text-emerald-600"
                    }`}>
                      ✓
                    </div>
                    <h4 className={`text-xs font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>Feedback Submitted</h4>
                    <p className={`mt-1 text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Your post has been sent for admin review.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className={`mt-3 rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                        isDark ? "bg-violet-600 text-white hover:bg-violet-500" : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      Send Another
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Category Selector */}
                    <div>
                      <label className={`mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}>
                        Select Category
                      </label>
                      <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.key}
                            type="button"
                            onClick={() => setCategory(cat.key)}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                              category === cat.key
                                ? isDark
                                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                                  : "bg-slate-900 text-white shadow-xs"
                                : isDark
                                  ? "border border-slate-800 bg-slate-800/90 text-slate-200 hover:bg-slate-700/80"
                                  : "border border-slate-200/90 bg-slate-50 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <span>{cat.emoji}</span>
                            <span>{cat.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Textarea Container */}
                    <div>
                      <label className={`mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}>
                        Your Message
                      </label>
                      <div className={`relative rounded-2xl border transition-all ${
                        isDark
                          ? "border-slate-700/80 bg-slate-950 shadow-inner focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/30"
                          : "border-slate-200/90 bg-slate-50/70 focus-within:border-slate-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/5"
                      }`}>
                        <textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Write here..."
                          rows={4}
                          maxLength={MAX_CHARS}
                          className={`w-full resize-none bg-transparent p-3 text-xs focus:outline-none ${
                            isDark ? "text-slate-100 placeholder-slate-400 font-medium" : "text-slate-900 placeholder-slate-400"
                          }`}
                        />
                        <div className={`flex items-center justify-between border-t px-3 py-1.5 text-[10px] font-medium ${
                          isDark ? "border-slate-800/80 text-slate-400" : "border-slate-200/60 text-slate-400"
                        }`}>
                          <span>{charCount > 0 && charCount < MIN_CHARS ? `${MIN_CHARS - charCount} more needed` : "Min 10 chars"}</span>
                          <span className="font-mono font-semibold">{charCount}/{MAX_CHARS}</span>
                        </div>
                      </div>
                    </div>

                    {formError && (
                      <p className="text-[11px] font-semibold text-rose-500">{formError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={!isValid || submitting}
                      className={`w-full rounded-2xl py-3 text-xs font-extrabold transition-all disabled:opacity-40 ${
                        isDark
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/25"
                          : "bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
                      }`}
                    >
                      {submitting ? "Submitting..." : "Submit Anonymously"}
                    </button>
                  </form>
                )}
              </AnimatePresence>

              {/* Integrated Security Line */}
              <div className={`mt-3.5 border-t pt-3 text-center ${
                isDark ? "border-slate-800/80 text-slate-500" : "border-slate-100 text-slate-400"
              }`}>
                <p className="text-[10px] font-semibold">
                  🛡️ 100% Encrypted & Anonymous. Zero logs attached.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </AppLayout>
  );
};

export default FeedbackPage;
