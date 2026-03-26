import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";

/**
 * NoticeBanner — shows pinned feed posts as dismissible banners on the home page.
 *
 * - Fetches from GET /api/feed/pinned (lightweight, max 5)
 * - Dismissed notices are stored in sessionStorage (reappear next session)
 * - If no pinned posts exist, renders nothing
 */

const DISMISSED_KEY = "unilink-dismissed-notices";

const getDismissed = () => {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) || "[]");
  } catch {
    return [];
  }
};

const NoticeBanner = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/feed/pinned", { method: "GET" });
        const dismissed = getDismissed();
        setNotices((data.notices || []).filter((n) => !dismissed.includes(n.id)));
      } catch {
        // Silently fail — banner is non-critical
      }
    };
    load();
  }, []);

  const dismiss = (id) => {
    const dismissed = getDismissed();
    dismissed.push(id);
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  if (notices.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
      <div className="space-y-2 py-2">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="group flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 shadow-sm sm:items-center sm:px-4"
          >
            {/* Icon */}
            <div className="mt-0.5 shrink-0 sm:mt-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold leading-relaxed text-amber-900 sm:text-sm">
                <span className="line-clamp-2 sm:line-clamp-1">{notice.content}</span>
              </p>
              <p className="mt-0.5 text-[10px] text-amber-600">
                {notice.author} · {new Date(notice.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1.5">
              <Link
                to="/feed"
                className="rounded-lg bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700 transition-colors hover:bg-amber-200 sm:text-xs"
              >
                View
              </Link>
              <button
                type="button"
                onClick={() => dismiss(notice.id)}
                className="rounded-lg p-1 text-amber-400 transition-colors hover:bg-amber-100 hover:text-amber-700"
                aria-label="Dismiss notice"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeBanner;
