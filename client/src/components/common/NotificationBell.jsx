/**
 * NotificationBell — persistent notification icon shown in AppLayout's top bar.
 *
 * - Fetches unread count via HTTP on mount.
 * - Listens for real-time "notification" socket events whenever the socket is
 *   connected (does NOT manage socket lifecycle — the active page owns that).
 * - Clicking the bell opens a dropdown and marks all notifications as read.
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import socket from "../../lib/socket";

/* ── Notification type → label / color ───────────────────────────────────── */

const TYPE_META = {
  // Support
  support_new:          { label: "New Request",     color: "bg-blue-100 text-blue-700" },
  support_message:      { label: "Support",         color: "bg-blue-100 text-blue-700" },
  support_reply:        { label: "Support Reply",   color: "bg-emerald-100 text-emerald-700" },
  support_resolved:     { label: "Resolved",        color: "bg-slate-100 text-slate-500" },
  // Class messages
  class_message:        { label: "Class",           color: "bg-indigo-100 text-indigo-700" },
  // Marketplace
  marketplace_new:      { label: "Marketplace",     color: "bg-violet-100 text-violet-700" },
  marketplace_approved: { label: "Approved",        color: "bg-emerald-100 text-emerald-700" },
  marketplace_rejected: { label: "Rejected",        color: "bg-rose-100 text-rose-700" },
  // Lost & Found
  lostfound_new:        { label: "Lost & Found",    color: "bg-amber-100 text-amber-700" },
  lostfound_approved:   { label: "Approved",        color: "bg-emerald-100 text-emerald-700" },
  lostfound_rejected:   { label: "Rejected",        color: "bg-rose-100 text-rose-700" },
  // Feedback
  feedback_new:         { label: "Feedback",        color: "bg-pink-100 text-pink-700" },
  // Feed
  feed_post:            { label: "New Post",         color: "bg-teal-100 text-teal-700" },
  // Users
  user_registered:      { label: "New User",         color: "bg-sky-100 text-sky-700" },
};

const getMeta = (type) => TYPE_META[type] || { label: "Notice", color: "bg-slate-100 text-slate-500" };

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/* ── Component ────────────────────────────────────────────────────────────── */

const NotificationBell = ({ userRole }) => {
  const [unreadCount, setUnreadCount]       = useState(0);
  const [notifications, setNotifications]   = useState([]);
  const [isOpen, setIsOpen]                 = useState(false);
  const [isLoading, setIsLoading]           = useState(false);
  const [isClearing, setIsClearing]         = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  // ── Fetch initial unread count ───────────────────────────────────────────
  useEffect(() => {
    apiFetch("/notifications?limit=15")
      .then(({ notifications: notifs, unreadCount: count }) => {
        setNotifications(notifs || []);
        setUnreadCount(count || 0);
      })
      .catch(() => {});
  }, []);

  // ── Listen for real-time notifications ───────────────────────────────────
  // Note: does NOT call socket.connect() — the active page owns that.
  // This listener fires only when a page has the socket connected.
  useEffect(() => {
    const handleNotification = (notif) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [notif, ...prev].slice(0, 20));
    };
    socket.on("notification", handleNotification);
    return () => socket.off("notification", handleNotification);
  }, []);

  // ── Close dropdown when clicking outside ────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // ── Toggle dropdown + mark all read when opening ─────────────────────────
  const handleToggle = async () => {
    const opening = !isOpen;
    setIsOpen(opening);

    if (opening && unreadCount > 0) {
      setIsLoading(true);
      try {
        await apiFetch("/notifications/read-all", { method: "PATCH" });
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    }
  };

  // ── Clear all notifications ──────────────────────────────────────────────
  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await apiFetch("/notifications", { method: "DELETE" });
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      // silent
    } finally {
      setIsClearing(false);
    }
  };

  // ── Navigate on notification click ───────────────────────────────────────
  const handleNotifClick = (notif) => {
    setIsOpen(false);
    const { type, data } = notif;
    if (["support_new", "support_message", "support_reply", "support_resolved"].includes(type)) {
      navigate(userRole === "admin" ? "/admin-dashboard/support" : "/support");
    } else if (type === "class_message") {
      navigate("/class-messages");
    } else if (["marketplace_new", "marketplace_approved", "marketplace_rejected"].includes(type)) {
      navigate(userRole === "admin" ? "/admin-dashboard/marketplace" : "/marketplace");
    } else if (["lostfound_new", "lostfound_approved", "lostfound_rejected"].includes(type)) {
      navigate(userRole === "admin" ? "/admin-dashboard/lost-found" : "/lost-found");
    } else if (type === "feedback_new") {
      navigate("/admin-dashboard/feedback");
    } else if (type === "user_registered") {
      navigate("/admin-dashboard/users");
    } else if (type === "feed_post") {
      navigate("/feed");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        type="button"
        onClick={handleToggle}
        className="btn-press relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-0.5 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <span className="text-xs font-black text-slate-800">Notifications</span>
            {isLoading && (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-400">No notifications yet</div>
            )}
            {notifications.map((notif) => {
              const meta = getMeta(notif.type);
              return (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => handleNotifClick(notif)}
                  className={`flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                    !notif.read ? "bg-blue-50/60" : ""
                  }`}
                >
                  {/* Unread dot */}
                  <div className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full">
                    {!notif.read && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-slate-400">{timeAgo(notif.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 text-xs font-bold text-slate-800">{notif.title}</p>
                    {notif.body && (
                      <p className="truncate text-[11px] text-slate-500">{notif.body}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2">
            {notifications.length > 0 ? (
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isClearing}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-600 disabled:opacity-50"
              >
                {isClearing ? "Clearing…" : "Clear all"}
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
