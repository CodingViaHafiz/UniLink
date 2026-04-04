import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import uniLinkLogo from "../../assets/unilink-logo-campus.svg";
import UserAvatar from "../common/UserAvatar";
import { useTheme } from "../../context/ThemeProvider";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-press flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? (
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

const NAV_LINKS = [
  { label: "Home",           to: "/home" },
  { label: "Feed",           to: "/feed" },
  { label: "Class Messages", to: "/class-messages" },
  { label: "Blogs",          to: "/blogs" },
  { label: "Resources",      to: "/resources" },
  { label: "Hostels",        to: "/hostels" },
  { label: "About",          to: "/about" },
];

const HomeNavbar = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // A link is active if pathname matches exactly (for /home) or starts with its path
  const isActive = (to) =>
    to === "/home" ? location.pathname === "/home" : location.pathname.startsWith(to);

  const getLinkTo = (item) => {
    if (item.to === "/home" && location.pathname === "/home") return "/home#home";
    if (item.to === "/blogs" && location.pathname === "/home") return "/home#blogs";
    return item.to;
  };

  return (
    <header className="sticky top-0 z-50 px-3 py-3 sm:px-6">
      <nav className="mx-auto w-full max-w-7xl">

        {/* ── Desktop nav ─────────────────────────────────────────────────────── */}
        <div className="hidden items-center justify-between rounded-full border border-sky-100 bg-white/90 px-3 py-2 text-slate-800 shadow-[0_14px_34px_-18px_rgba(2,132,199,0.45)] backdrop-blur lg:flex">
          <Link className="inline-flex items-center gap-2 rounded-full pr-3" to="/home" aria-label="Go to home page">
            <img src={uniLinkLogo} alt="UniLink logo" className="h-10 w-10 rounded-full" />
            <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-sm font-black tracking-tight text-transparent">
              UniLink
            </span>
          </Link>

          <div className="flex items-center gap-0.5">
            {NAV_LINKS.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.label}
                  to={getLinkTo(item)}
                  className={`relative rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-colors ${
                    active
                      ? "bg-sky-50 text-sky-700"
                      : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-sky-500" />
                  )}
                </Link>
              );
            })}

            {user?.role === "faculty" && (
              <Link
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-colors ${
                  location.pathname.startsWith("/faculty-dashboard")
                    ? "bg-blue-50 text-blue-700"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
                to="/faculty-dashboard"
              >
                Faculty
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-colors ${
                  location.pathname.startsWith("/admin-dashboard")
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}
                to="/admin-dashboard"
              >
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/profile"
              className={`btn-press block rounded-full transition-all ${
                location.pathname === "/profile" ? "ring-2 ring-sky-400 ring-offset-1" : ""
              }`}
              title="Profile"
            >
              <UserAvatar user={user} className="h-9 w-9 rounded-full" textSize="text-xs" />
            </Link>
          </div>
        </div>

        {/* ── Mobile nav ──────────────────────────────────────────────────────── */}
        <div className="rounded-3xl border border-sky-100 bg-white/95 p-3 text-slate-800 shadow-[0_14px_34px_-18px_rgba(2,132,199,0.4)] backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-2">
            <Link className="inline-flex min-w-0 items-center gap-2 rounded-full pr-2" to="/home">
              <img src={uniLinkLogo} alt="UniLink logo" className="h-10 w-10 rounded-full" />
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-sm font-black tracking-tight text-transparent">
                UniLink
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                  menuOpen
                    ? "border-sky-200 bg-sky-50 text-sky-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-label="Toggle navigation menu"
              >
                {menuOpen ? "Close" : "Menu"}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="mt-3 space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-2">
              {NAV_LINKS.map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.label}
                    to={getLinkTo(item)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-sky-50 text-sky-700"
                        : "text-slate-700 hover:bg-white"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />}
                  </Link>
                );
              })}

              {user?.role === "faculty" && (
                <Link
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    location.pathname.startsWith("/faculty-dashboard")
                      ? "bg-blue-50 text-blue-700"
                      : "text-blue-700 hover:bg-blue-50"
                  }`}
                  to="/faculty-dashboard"
                  onClick={() => setMenuOpen(false)}
                >
                  Faculty Dashboard
                  {location.pathname.startsWith("/faculty-dashboard") && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  )}
                </Link>
              )}
              {user?.role === "admin" && (
                <Link
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    location.pathname.startsWith("/admin-dashboard")
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-emerald-700 hover:bg-emerald-50"
                  }`}
                  to="/admin-dashboard"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin Dashboard
                  {location.pathname.startsWith("/admin-dashboard") && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  )}
                </Link>
              )}

              <Link
                className={`mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  location.pathname === "/profile"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-sky-50 text-sky-700 hover:bg-sky-100"
                }`}
                to="/profile"
                onClick={() => setMenuOpen(false)}
              >
                <UserAvatar user={user} className="h-6 w-6 rounded-full" textSize="text-[10px]" />
                Profile
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default HomeNavbar;
