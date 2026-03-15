import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import uniLinkLogo from "../../assets/unilink-logo-campus.svg";

const primaryLinks = [
  { label: "Home", to: "/home", hash: "home" },
  { label: "Blogs", to: "/blogs", hash: "blogs" },
];

const secondaryLinks = [
  { label: "Hostels", to: "/hostels" },
  { label: "About", to: "/about" },
];

const resourceLink = { label: "Resources", to: "/resources" };

const HomeNavbar = ({ user, onLogout, isLoggingOut }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const getLinkTo = (item) => {
    if (!item.hash) {
      return item.to;
    }

    if (location.pathname === "/home") {
      return `/home#${item.hash}`;
    }

    return item.to;
  };

  return (
    <header className="sticky top-0 z-50 px-3 py-3 sm:px-6">
      <nav className="mx-auto w-full max-w-7xl">
        <div className="hidden items-center justify-between rounded-full border border-sky-100 bg-white/90 px-3 py-2 text-slate-800 shadow-[0_14px_34px_-18px_rgba(2,132,199,0.45)] backdrop-blur lg:flex">
          <Link className="inline-flex items-center gap-2 rounded-full pr-3" to="/home" aria-label="Go to home page">
            <img src={uniLinkLogo} alt="UniLink logo" className="h-10 w-10 rounded-full" />
            <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-sm font-black tracking-tight text-transparent">
              UniLink
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {primaryLinks.map((item) => (
              <Link
                key={item.label}
                className="rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-slate-600 transition-colors hover:bg-sky-50 hover:text-sky-700"
                to={getLinkTo(item)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              className="rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-slate-600 transition-colors hover:bg-sky-50 hover:text-sky-700"
              to={resourceLink.to}
            >
              {resourceLink.label}
            </Link>
            {secondaryLinks.map((item) => (
              <Link
                key={item.label}
                className="rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-slate-600 transition-colors hover:bg-sky-50 hover:text-sky-700"
                to={getLinkTo(item)}
              >
                {item.label}
              </Link>
            ))}
            {user?.role === "faculty" && (
              <Link
                className="rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-blue-600 transition-colors hover:bg-blue-50"
                to="/faculty-dashboard"
              >
                Faculty
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                className="rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-emerald-600 transition-colors hover:bg-emerald-50"
                to="/admin-dashboard"
              >
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100"
              onClick={onLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>

          <div className="rounded-3xl border border-sky-100 bg-white/95 p-3 text-slate-800 shadow-[0_14px_34px_-18px_rgba(2,132,199,0.4)] backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-2">
            <Link className="inline-flex min-w-0 items-center gap-2 rounded-full pr-2" to="/home">
              <img src={uniLinkLogo} alt="UniLink logo" className="h-10 w-10 rounded-full" />
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-sm font-black tracking-tight text-transparent">
                UniLink
              </span>
            </Link>
            <button
              type="button"
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700"
              onClick={() => setMenuOpen((previous) => !previous)}
            >
              Menu
            </button>
          </div>

          {menuOpen && (
            <div className="mt-3 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
              {primaryLinks.map((item) => (
                <Link
                  key={item.label}
                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white"
                  to={getLinkTo(item)}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white"
                to={resourceLink.to}
                onClick={() => setMenuOpen(false)}
              >
                {resourceLink.label}
              </Link>
              {secondaryLinks.map((item) => (
                <Link
                  key={item.label}
                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white"
                  to={getLinkTo(item)}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {user?.role === "faculty" && (
                <Link
                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                  to="/faculty-dashboard"
                  onClick={() => setMenuOpen(false)}
                >
                  Faculty Dashboard
                </Link>
              )}
              {user?.role === "admin" && (
                <Link
                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
                  to="/admin-dashboard"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                type="button"
                className="mt-1 w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-left text-sm font-bold text-rose-700"
                onClick={onLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default HomeNavbar;

