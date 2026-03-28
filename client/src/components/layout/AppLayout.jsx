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
 *   1. Add one entry to NAV_ITEMS below
 *   2. Use <AppLayout activePage="yourKey"> in the new page
 *   That's it — nothing else changes.
 * ──────────────────────────────────────────────────────
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import uniLinkLogo from "../../assets/unilink-logo-campus.svg";
import { useTheme } from "../../context/ThemeProvider";

/* ─────────────────────────────────────────
   Navigation config
   To add a new page: add one object here.
───────────────────────────────────────── */

const NAV_ITEMS = [
  {
    key: "home",
    label: "Home",
    to: "/home",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: "resources",
    label: "Resources",
    to: "/resources",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    key: "blogs",
    label: "Blogs",
    to: "/blogs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    key: "hostels",
    label: "Hostels",
    to: "/hostels",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
  {
    key: "about",
    label: "About",
    to: "/about",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },

  {
    key: "feed",
    label: "Feed",
    to: "/feed",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    key: "gpa",
    label: "GPA Calculator",
    to: "/gpa-calculator",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },

  {
    key: "focus",
    label: "Focus Timer",
    to: "/focus-timer",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },

  {
    key: "feedback",
    label: "Voice Your Say",
    to: "/feedback",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    key: "marketplace",
    label: "Marketplace",
    to: "/marketplace",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    key: "lostfound",
    label: "Lost & Found",
    to: "/lost-found",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },

  // ── Future pages: uncomment + add route in App.jsx ──
  // { key: "calendar",   label: "Calendar",   to: "/calendar",   icon: <CalendarIcon /> },
  // { key: "timetable",  label: "Timetable",  to: "/timetable",  icon: <TimetableIcon /> },
  // { key: "notices",    label: "Notices",    to: "/notices",    icon: <BellIcon /> },
  // { key: "forum",      label: "Forum",      to: "/forum",      icon: <ForumIcon /> },
  // { key: "attendance", label: "Attendance", to: "/attendance", icon: <AttendanceIcon /> },
  // { key: "results",    label: "Results",    to: "/results",    icon: <ResultsIcon /> },
  // { key: "library",    label: "Library",    to: "/library",    icon: <LibraryIcon /> },
];

/* Role-based nav items (only shown for the matching role) */
const ROLE_ITEMS = [
  {
    role: "faculty",
    key: "faculty",
    label: "Faculty Panel",
    to: "/faculty-dashboard",
    color: "text-blue-600 hover:bg-blue-50",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    role: "admin",
    key: "admin",
    label: "Admin Panel",
    to: "/admin-dashboard",
    color: "text-emerald-600 hover:bg-emerald-50",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

/* ─────────────────────────────────────────
   Theme toggle (reusable mini component)
───────────────────────────────────────── */

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-press flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
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
  const activeItem = NAV_ITEMS.find((i) => i.key === activePage);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════════════════════
          SIDEBAR
      ══════════════════════════ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-200 bg-white
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-slate-100 px-4">
          <img src={uniLinkLogo} alt="UniLink" className="h-8 w-8 rounded-full" />
          <span className="bg-linear-to-r from-sky-500 to-blue-600 bg-clip-text text-sm font-black tracking-tight text-transparent">
            UniLink
          </span>
        </div>

        {/* Scrollable nav area */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">

          {/* Main navigation */}
          <div>
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Navigation
            </p>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors ${activePage === item.key
                  ? "bg-sky-50 text-sky-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                {item.icon}
                {item.label}
                {activePage === item.key && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sky-500" />
                )}
              </Link>
            ))}

            {/* Role-based items */}
            {ROLE_ITEMS.filter((r) => r.role === user?.role).map((item) => (
              <Link
                key={item.key}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors ${item.color}`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Page-specific extra section (e.g. resource type filters) */}
          {sidebarExtra && (
            <div>
              <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Filter
              </p>
              {sidebarExtra}
            </div>
          )}
        </nav>

        {/* User profile */}
        <div className="shrink-0 border-t border-slate-100 p-3">
          <Link
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-black text-sky-700">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-800">{user?.fullName || "User"}</p>
              <p className="truncate text-[10px] capitalize text-slate-400">{user?.role}</p>
            </div>
            <ThemeToggle />
          </Link>
        </div>
      </aside>

      {/* ══════════════════════════
          MAIN CONTENT
      ══════════════════════════ */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          {/* Left: hamburger + breadcrumb */}
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

          {/* Right slot reserved for future use */}
        </header>

        {/* Scrollable content */}
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
