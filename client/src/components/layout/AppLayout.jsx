/**
 * AppLayout — Shared sidebar + main content layout.
 *
 * Used by: Resources, Blogs, Hostels, About, and all future pages.
 * NOT used by: Home, Admin Dashboard, Faculty Dashboard, Auth pages.
 *
 * Props:
 *   activePage    — string key matching NAV_ITEMS (highlights correct sidebar item)
 *   user          — auth user object
 *   title         — page heading shown in top bar breadcrumb + page header
 *   subtitle      — optional small text below title (e.g. "12 resources")
 *   icon          — optional JSX icon shown next to page title
 *   topBarRight   — optional JSX rendered on the right side of the top bar (e.g. search input)
 *   sidebarExtra  — optional JSX rendered below the nav in the sidebar (e.g. type filters)
 *   children      — the main page content
 *
 * ──────────────────────────────────────────────────────
 * Adding a future page to the sidebar:
 *   1. Add one entry to NAV_ITEMS with a group key
 *   2. Use <AppLayout activePage="yourKey"> in the new page
 *   That's it — nothing else changes.
 * ──────────────────────────────────────────────────────
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import uniLinkLogo from "../../assets/unilink-logo-campus.svg";
import NotificationBell from "../common/NotificationBell";
import UserAvatar from "../common/UserAvatar";
import { useTheme } from "../../context/ThemeProvider";

/* ─────────────────────────────────────────
   Nav groups (order matters)
───────────────────────────────────────── */

const NAV_GROUPS = [
  { key: "main",     title: "Main" },
  { key: "academic", title: "Academic" },
  { key: "campus",   title: "Campus Life" },
  { key: "tools",    title: "Tools" },
  { key: "info",     title: "Info" },
];

/* ─────────────────────────────────────────
   Navigation config
   To add a new page: add one object here.
───────────────────────────────────────── */

const NAV_ITEMS = [
  {
    key: "home", group: "main",
    label: "Home", to: "/home",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: "feed", group: "main",
    label: "Feed", to: "/feed",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7M6 17a1 1 0 110 2 1 1 0 010-2z" />
      </svg>
    ),
  },
  {
    key: "resources", group: "academic",
    label: "Resources", to: "/resources",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    key: "blogs", group: "academic",
    label: "Blogs", to: "/blogs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    key: "class-messages", group: "academic",
    label: "Class Messages", to: "/class-messages",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    key: "programs", group: "academic",
    label: "Programs", to: "/programs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-3-2.5l3 2.5 3-2.5" />
      </svg>
    ),
  },
  {
    key: "hostels", group: "campus",
    label: "Hostels", to: "/hostels",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
  {
    key: "marketplace", group: "campus",
    label: "Marketplace", to: "/marketplace",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    key: "lostfound", group: "campus",
    label: "Lost & Found", to: "/lost-found",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    key: "feedback", group: "campus",
    label: "Voice Your Say", to: "/feedback",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    key: "gpa", group: "tools",
    label: "GPA Calculator", to: "/gpa-calculator",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: "focus", group: "tools",
    label: "Focus Timer", to: "/focus-timer",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "about", group: "info",
    label: "About", to: "/about",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "support", group: "info",
    label: "Support", to: "/support",
    roles: ["student"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    key: "support", group: "info",
    label: "Support", to: "/admin-dashboard/support",
    roles: ["admin"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },

  // ── Future pages: uncomment + add route in App.jsx ──
  // { key: "calendar",   group: "academic", label: "Calendar",   to: "/calendar" },
  // { key: "timetable",  group: "academic", label: "Timetable",  to: "/timetable" },
  // { key: "notices",    group: "campus",   label: "Notices",    to: "/notices" },
  // { key: "attendance", group: "academic", label: "Attendance", to: "/attendance" },
  // { key: "results",    group: "academic", label: "Results",    to: "/results" },
  // { key: "library",    group: "academic", label: "Library",    to: "/library" },
];

/* Role-specific panel links shown at the top of nav */
const ROLE_ITEMS = [
  {
    role:  "faculty",
    key:   "faculty",
    label: "Faculty Panel",
    to:    "/faculty-dashboard",
    dot:   "bg-blue-400",
    darkAccent:  "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300 hover:border-blue-400/50 bg-gradient-to-r",
    lightAccent: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    role:  "admin",
    key:   "admin",
    label: "Admin Panel",
    to:    "/admin-dashboard",
    dot:   "bg-emerald-400",
    darkAccent:  "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300 hover:border-emerald-400/50 bg-gradient-to-r",
    lightAccent: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

/* ─────────────────────────────────────────
   Theme toggle (adapted for dark sidebar)
───────────────────────────────────────── */

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn-press flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors ${
        isDark
          ? "border-white/10 text-slate-500 hover:bg-white/10 hover:text-slate-300"
          : "border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      }`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
};

/* ─────────────────────────────────────────
   AppLayout
───────────────────────────────────────── */

const AppLayout = ({
  activePage = "",
  user,
  title = "",
  subtitle = "",
  icon = null,
  topBarRight = null,
  sidebarExtra = null,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const activeItem = NAV_ITEMS.find((i) => i.key === activePage);

  // ── Theme-aware sidebar class sets ────────────────────────────────────────
  const cx = {
    sidebar:       isDark ? "bg-slate-900 border-white/[0.06]"    : "bg-white border-slate-200",
    logoBorder:    isDark ? "border-white/[0.06]"                  : "border-slate-100",
    subtext:       isDark ? "text-slate-600"                       : "text-slate-400",
    sectionTitle:  isDark ? "text-slate-600"                       : "text-slate-400",
    navActive:     isDark ? "bg-white/10 text-white"               : "bg-sky-50 text-sky-700",
    navInactive:   isDark ? "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
    iconActive:    "text-sky-400",
    iconInactive:  isDark ? "text-slate-500 group-hover:text-slate-300"
                          : "text-slate-400 group-hover:text-slate-700",
    activeDot:     "bg-sky-400",
    dockBorder:    isDark ? "border-white/[0.06]"                  : "border-slate-100",
    dockCard:      isDark ? "bg-white/[0.04] hover:bg-white/[0.08]": "hover:bg-slate-50",
    dockName:      isDark ? "text-slate-200"                       : "text-slate-800",
    roleBadge: {
      admin:   isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700",
      faculty: isDark ? "bg-blue-500/20 text-blue-400"       : "bg-blue-100 text-blue-700",
      student: isDark ? "bg-sky-500/20 text-sky-400"         : "bg-sky-100 text-sky-700",
    },
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ── Mobile overlay ─────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className={`fixed inset-0 z-30 backdrop-blur-sm lg:hidden ${isDark ? "bg-black/70" : "bg-black/40"}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════════════════════════════
          SIDEBAR
      ══════════════════════════════════ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-[232px] flex-col border-r
          transition-transform duration-300 ease-in-out
          ${cx.sidebar}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <div className={`flex h-14 shrink-0 items-center gap-3 border-b px-4 ${cx.logoBorder}`}>
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-blue-500/20">
            <img src={uniLinkLogo} alt="UniLink" className="h-5 w-5 rounded-lg" />
          </div>
          <div className="min-w-0">
            <span className="bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-sm font-black tracking-tight text-transparent">
              UniLink
            </span>
            <p className={`text-[9px] font-semibold uppercase tracking-widest ${cx.subtext}`}>Campus Portal</p>
          </div>
        </div>

        {/* ── Nav ──────────────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

          {/* Role panel shortcut — shown at the top for faculty/admin */}
          {ROLE_ITEMS.filter((r) => r.role === user?.role).map((item) => (
            <Link
              key={item.key}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`mb-3 flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                isDark ? item.darkAccent : item.lightAccent
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
              {item.icon}
              {item.label}
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-auto h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}

          {/* Grouped navigation */}
          {NAV_GROUPS.map((group) => {
            const items = NAV_ITEMS.filter(
              (item) => item.group === group.key && (!item.roles || item.roles.includes(user?.role))
            );
            if (items.length === 0) return null;

            return (
              <div key={group.key} className="mb-4">
                <p className={`mb-1 px-2 text-[9px] font-bold uppercase tracking-widest ${cx.sectionTitle}`}>
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const isActive = activePage === item.key;
                    return (
                      <Link
                        key={item.key}
                        to={item.to}
                        onClick={() => setSidebarOpen(false)}
                        className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
                          isActive ? cx.navActive : cx.navInactive
                        }`}
                      >
                        {/* Active left accent bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-sky-400" />
                        )}

                        {/* Icon */}
                        <span className={`shrink-0 transition-colors ${isActive ? cx.iconActive : cx.iconInactive}`}>
                          {item.icon}
                        </span>

                        {item.label}

                        {/* Active dot */}
                        {isActive && (
                          <span className={`ml-auto h-1.5 w-1.5 rounded-full ${cx.activeDot}`} />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Page-specific extra section (e.g. resource type filters) */}
          {sidebarExtra && (
            <div className="mb-4">
              <p className={`mb-1 px-2 text-[9px] font-bold uppercase tracking-widest ${cx.sectionTitle}`}>
                Filter
              </p>
              <div className="space-y-0.5">
                {sidebarExtra}
              </div>
            </div>
          )}
        </nav>

        {/* ── User dock ────────────────────────────────────────────────────── */}
        <div className={`shrink-0 border-t p-3 ${cx.dockBorder}`}>
          <Link
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors ${cx.dockCard}`}
          >
            <UserAvatar
              user={user}
              className={`h-7 w-7 shrink-0 rounded-full ring-1 ${isDark ? "ring-white/10" : "ring-slate-200"}`}
              textSize="text-xs"
            />
            <div className="min-w-0 flex-1">
              <p className={`truncate text-xs font-bold ${cx.dockName}`}>{user?.fullName || "User"}</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className={`rounded px-1 py-px text-[8px] font-bold uppercase tracking-wide ${
                  cx.roleBadge[user?.role] || cx.roleBadge.student
                }`}>
                  {user?.role}
                </span>
              </div>
            </div>
            <ThemeToggle />
          </Link>
        </div>
      </aside>

      {/* ══════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════ */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">

          {/* Left: hamburger (mobile) + breadcrumb */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 lg:hidden"
              aria-label="Open sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb */}
            <nav className="flex min-w-0 items-center gap-1 text-sm">
              <Link to="/home" className="shrink-0 text-slate-400 transition-colors hover:text-slate-600">
                Home
              </Link>
              {activeItem && (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="truncate font-semibold text-slate-700">{title || activeItem.label}</span>
                </>
              )}
            </nav>
          </div>

          {/* Right: notification bell */}
          <NotificationBell userRole={user?.role} />
        </header>

        {/* ── Scrollable page content ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">

          {/* Page header */}
          {(title || icon) && (
            <div className="mb-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="rounded-xl bg-sky-100 p-2 text-sky-600">
                      {icon}
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900">{title}</h1>
                    {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
                  </div>
                </div>

                {/* Desktop: topBarRight next to title */}
                {topBarRight && (
                  <div className="hidden sm:block">{topBarRight}</div>
                )}
              </div>

              {/* Mobile: topBarRight stacked below */}
              {topBarRight && (
                <div className="sm:hidden">{topBarRight}</div>
              )}
            </div>
          )}

          {/* Page content */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
