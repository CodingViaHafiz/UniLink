import { useState, useEffect, useRef, useCallback } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { MotionCard } from "../lib/motion";

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */

const MODES = [
  { key: "focus", label: "Focus", minutes: 25, color: "rose" },
  { key: "shortBreak", label: "Short Break", minutes: 5, color: "emerald" },
  { key: "longBreak", label: "Long Break", minutes: 15, color: "blue" },
];

const SESSIONS_BEFORE_LONG_BREAK = 4;

const COLOR_MAP = {
  rose: {
    ring: "stroke-rose-500",
    ringTrack: "stroke-rose-100",
    bg: "bg-rose-50",
    text: "text-rose-600",
    btnActive: "bg-rose-500 text-white shadow-lg shadow-rose-200",
    btnHover: "hover:bg-rose-50 hover:text-rose-600",
    accent: "text-rose-500",
    iconBg: "bg-rose-100 text-rose-600",
    badge: "bg-rose-100 text-rose-700",
    glow: "shadow-rose-200/60",
  },
  emerald: {
    ring: "stroke-emerald-500",
    ringTrack: "stroke-emerald-100",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    btnActive: "bg-emerald-500 text-white shadow-lg shadow-emerald-200",
    btnHover: "hover:bg-emerald-50 hover:text-emerald-600",
    accent: "text-emerald-500",
    iconBg: "bg-emerald-100 text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    glow: "shadow-emerald-200/60",
  },
  blue: {
    ring: "stroke-blue-500",
    ringTrack: "stroke-blue-100",
    bg: "bg-blue-50",
    text: "text-blue-600",
    btnActive: "bg-blue-500 text-white shadow-lg shadow-blue-200",
    btnHover: "hover:bg-blue-50 hover:text-blue-600",
    accent: "text-blue-500",
    iconBg: "bg-blue-100 text-blue-600",
    badge: "bg-blue-100 text-blue-700",
    glow: "shadow-blue-200/60",
  },
};

/* ─────────────────────────────────────────
   localStorage helpers
───────────────────────────────────────── */

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const loadDailyStats = () => {
  try {
    const raw = localStorage.getItem("focusTimer_daily");
    if (!raw) return { date: getTodayKey(), sessions: 0, totalSeconds: 0 };
    const data = JSON.parse(raw);
    if (data.date !== getTodayKey()) {
      return { date: getTodayKey(), sessions: 0, totalSeconds: 0 };
    }
    return data;
  } catch {
    return { date: getTodayKey(), sessions: 0, totalSeconds: 0 };
  }
};

const saveDailyStats = (stats) => {
  localStorage.setItem("focusTimer_daily", JSON.stringify({ ...stats, date: getTodayKey() }));
};

const formatDuration = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return "0m";
};

/* ─────────────────────────────────────────
   SVG Progress Ring
───────────────────────────────────────── */

const RADIUS = 120;
const STROKE_WIDTH = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = (RADIUS + STROKE_WIDTH) * 2;

const ProgressRing = ({ progress, colorKey }) => {
  const colors = COLOR_MAP[colorKey];
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="drop-shadow-sm"
    >
      {/* Track */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE_WIDTH}
        className={colors.ringTrack}
      />
      {/* Progress arc */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        className={`${colors.ring} transition-[stroke-dashoffset] duration-1000 ease-linear`}
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
      />
    </svg>
  );
};

/* ─────────────────────────────────────────
   FocusTimerPage
───────────────────────────────────────── */

const FocusTimerPage = () => {
  const { user } = useAuth();

  /* ── State ── */
  const [modeIndex, setModeIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(MODES[0].minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [dailyStats, setDailyStats] = useState(loadDailyStats);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLongBreakHint, setShowLongBreakHint] = useState(false);

  const intervalRef = useRef(null);
  const mode = MODES[modeIndex];
  const totalSeconds = mode.minutes * 60;
  const colors = COLOR_MAP[mode.color];

  /* ── Derived ── */
  const progress = secondsLeft / totalSeconds;
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  /* ── Timer tick ── */
  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
        return 0;
      }
      return prev - 1;
    });
  }, []);

  /* Start / pause */
  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    } else {
      if (secondsLeft === 0) return;
      intervalRef.current = setInterval(tick, 1000);
      setIsRunning(true);
    }
  };

  /* Reset current timer */
  const resetTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
    setShowLongBreakHint(false);
  };

  /* Switch mode */
  const switchMode = (index) => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
    setModeIndex(index);
    setSecondsLeft(MODES[index].minutes * 60);
    setShowLongBreakHint(false);
  };

  /* Handle timer completion */
  useEffect(() => {
    if (secondsLeft === 0 && !isRunning) {
      if (mode.key === "focus") {
        const newCount = sessionCount + 1;
        setSessionCount(newCount);

        // Update daily stats
        const updated = {
          ...dailyStats,
          sessions: dailyStats.sessions + 1,
          totalSeconds: dailyStats.totalSeconds + totalSeconds,
        };
        setDailyStats(updated);
        saveDailyStats(updated);

        // Auto-suggest long break every SESSIONS_BEFORE_LONG_BREAK
        if (newCount % SESSIONS_BEFORE_LONG_BREAK === 0) {
          setShowLongBreakHint(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, isRunning]);

  /* Cleanup interval on unmount */
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /* ── Page icon ── */
  const focusIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <AppLayout
      activePage="focus"
      user={user}
      title="Focus Timer"
      subtitle="Stay productive with the Pomodoro technique"
      icon={focusIcon}
    >
      <div className="mx-auto max-w-2xl space-y-6">

        {/* ── Mode Selector ── */}
        <MotionCard>
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {MODES.map((m, i) => (
              <button
                key={m.key}
                onClick={() => switchMode(i)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
                  modeIndex === i
                    ? COLOR_MAP[m.color].btnActive
                    : `text-slate-500 ${COLOR_MAP[m.color].btnHover}`
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </MotionCard>

        {/* ── Timer Display ── */}
        <MotionCard delay={0.05}>
          <div className={`relative flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-10 shadow-sm transition-shadow duration-500 ${isRunning ? `shadow-lg ${colors.glow}` : ""}`}>

            {/* SVG ring with time overlay */}
            <div className="relative flex items-center justify-center">
              <ProgressRing progress={progress} colorKey={mode.color} />

              {/* Time display centered over the SVG */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-black tracking-tight tabular-nums text-slate-900 sm:text-6xl`}>
                  {minutes}:{seconds}
                </span>
                <span className={`mt-1 text-xs font-bold uppercase tracking-widest ${colors.text}`}>
                  {mode.label}
                </span>
              </div>
            </div>

            {/* Session counter */}
            <div className="mt-6 flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${colors.badge}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Session {(sessionCount % SESSIONS_BEFORE_LONG_BREAK) + 1} of {SESSIONS_BEFORE_LONG_BREAK}
              </span>
              {sessionCount > 0 && (
                <span className="text-xs font-semibold text-slate-400">
                  {sessionCount} completed
                </span>
              )}
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center gap-3">
              {/* Start / Pause */}
              <button
                onClick={toggleTimer}
                disabled={secondsLeft === 0}
                className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                  isRunning
                    ? "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                    : colors.btnActive
                }`}
              >
                {isRunning ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    {secondsLeft === totalSeconds ? "Start" : "Resume"}
                  </>
                )}
              </button>

              {/* Reset */}
              <button
                onClick={resetTimer}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>

            {/* Long break suggestion */}
            {showLongBreakHint && (
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-blue-700">
                  Great work! You completed {SESSIONS_BEFORE_LONG_BREAK} sessions.
                </p>
                <button
                  onClick={() => {
                    switchMode(2);
                    setShowLongBreakHint(false);
                  }}
                  className="ml-auto shrink-0 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-600"
                >
                  Take a long break
                </button>
              </div>
            )}
          </div>
        </MotionCard>

        {/* ── Bottom Row: Daily Stats + Sound Toggle ── */}
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Daily Stats */}
          <MotionCard delay={0.1}>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Today</p>
                  <p className="text-sm font-black text-slate-900">
                    {formatDuration(dailyStats.totalSeconds)} focused
                    <span className="ml-1 font-semibold text-slate-400">
                      &middot; {dailyStats.sessions} {dailyStats.sessions === 1 ? "session" : "sessions"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </MotionCard>

          {/* Sound Toggle */}
          <MotionCard delay={0.15}>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    {soundEnabled ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sound</p>
                    <p className="text-sm font-bold text-slate-900">
                      {soundEnabled ? "Notifications on" : "Notifications off"}
                    </p>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => setSoundEnabled((v) => !v)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                    soundEnabled ? "bg-violet-500" : "bg-slate-200"
                  }`}
                  role="switch"
                  aria-checked={soundEnabled}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      soundEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </MotionCard>
        </div>

        {/* ── How It Works ── */}
        <MotionCard delay={0.2}>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-black text-slate-900">How the Pomodoro Technique Works</h2>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { step: "1", title: "Focus", desc: "Work for 25 minutes with full concentration", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", colorCls: "bg-rose-100 text-rose-600" },
                { step: "2", title: "Short Break", desc: "Rest for 5 minutes to recharge", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", colorCls: "bg-emerald-100 text-emerald-600" },
                { step: "3", title: "Repeat", desc: "Complete 4 sessions in a cycle", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", colorCls: "bg-amber-100 text-amber-600" },
                { step: "4", title: "Long Break", desc: "Take a 15-minute break after 4 sessions", icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z", colorCls: "bg-blue-100 text-blue-600" },
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center text-center">
                  <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${s.colorCls}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.icon} />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{s.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </MotionCard>

      </div>
    </AppLayout>
  );
};

export default FocusTimerPage;
