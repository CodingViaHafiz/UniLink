import { useCallback, useEffect, useRef, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { API_BASE, apiFetch } from "../lib/api";
import socket from "../lib/socket";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const TYPE_CONFIG = {
  message:    { label: "Message",    icon: "💬", badge: "bg-slate-100 text-slate-600" },
  assignment: { label: "Assignment", icon: "📋", badge: "bg-amber-100 text-amber-700" },
  notice:     { label: "Notice",     icon: "📢", badge: "bg-sky-100 text-sky-700" },
};

// activeSemester meanings:
//   null  → faculty "All Semesters" view — show / send to everyone
//   0     → student with no semester assigned — see only null-semester messages
//   N≥1   → see semester=null + semester=N messages; send to semester N
const buildApiSemesterParam = (activeSemester) => {
  if (activeSemester === null) return "";
  return `&semester=${activeSemester}`;
};

const shouldShowMessage = (msg, activeSemester) => {
  if (activeSemester === null) return true;
  if (activeSemester === 0)    return msg.semester === null;
  return msg.semester === null || msg.semester === activeSemester;
};

/* ── Attachment link ──────────────────────────────────────────────────────── */

const AttachmentLink = ({ url, name }) => (
  <a
    href={`${API_BASE.replace("/api", "")}${url}`}
    download={name}
    target="_blank"
    rel="noreferrer"
    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
    {name || "Download attachment"}
  </a>
);

/* ── Message bubble ───────────────────────────────────────────────────────── */

const MessageBubble = ({ msg, userId, isAdmin, isFaculty, onDelete }) => {
  const cfg       = TYPE_CONFIG[msg.type] || TYPE_CONFIG.message;
  const canDelete = isAdmin || (isFaculty && msg.senderId === userId);

  return (
    <div className="group px-4 py-3 transition-colors hover:bg-slate-50/60">
      <div className="flex gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
          {msg.senderName?.charAt(0)?.toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-bold text-slate-900">{msg.senderName}</span>

            <span className={`rounded px-1 py-0.5 text-[8px] font-bold uppercase leading-none ${msg.senderRole === "admin" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
              {msg.senderRole}
            </span>

            <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase leading-none ${cfg.badge}`}>
              {cfg.icon} {cfg.label}
            </span>

            {/* Semester target badge */}
            {msg.semester ? (
              <span className="rounded px-1.5 py-0.5 text-[8px] font-bold uppercase leading-none bg-indigo-100 text-indigo-700">
                Sem {msg.semester}
              </span>
            ) : (
              <span className="rounded px-1.5 py-0.5 text-[8px] font-bold uppercase leading-none bg-slate-100 text-slate-400">
                All
              </span>
            )}

            <span className="text-[10px] text-slate-400">
              {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>

            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete(msg.id)}
                className="ml-auto rounded px-1.5 py-0.5 text-[10px] text-slate-300 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
              >
                ✕
              </button>
            )}
          </div>

          {msg.title && <p className="mt-1 text-sm font-black text-slate-900">{msg.title}</p>}

          <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{msg.content}</p>

          {msg.dueDate && (
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Due: {new Date(msg.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
            </div>
          )}

          {msg.attachmentUrl && <AttachmentLink url={msg.attachmentUrl} name={msg.attachmentName} />}
        </div>
      </div>
    </div>
  );
};

/* ── Compose bar ──────────────────────────────────────────────────────────── */

const ComposeBar = ({ programmeId, activeSemester }) => {
  const [type, setType]           = useState("message");
  const [title, setTitle]         = useState("");
  const [content, setContent]     = useState("");
  const [dueDate, setDueDate]     = useState("");
  const [file, setFile]           = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileRef     = useRef(null);
  const textareaRef = useRef(null);

  const needsTitle = type === "assignment" || type === "notice";

  const reset = () => {
    setType("message"); setTitle(""); setContent(""); setDueDate(""); setFile(null);
    if (fileRef.current)     fileRef.current.value = "";
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const autoGrow = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (needsTitle && !title.trim()) return;

    setIsSending(true);
    try {
      const form = new FormData();
      form.append("programmeId", programmeId);
      form.append("type", type);
      form.append("content", content);
      if (needsTitle) form.append("title", title);
      if (type === "assignment" && dueDate) form.append("dueDate", dueDate);
      if (file) form.append("attachment", file);
      // activeSemester null = all; 0 = shouldn't compose; N = specific
      if (activeSemester && activeSemester >= 1) form.append("semester", activeSemester);

      await apiFetch("/class-messages", { method: "POST", body: form });
      // Real-time arrival via socket — no local state update needed
      reset();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  const semesterLabel = activeSemester === null
    ? "All Semesters"
    : `Semester ${activeSemester}`;

  return (
    <form onSubmit={handleSubmit} className="shrink-0 space-y-2 border-t border-slate-200 bg-white px-3 py-2.5">
      {/* Type + target row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => setType(key)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                type === key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {cfg.icon} {cfg.label}
            </button>
          ))}
        </div>
        {/* Sending-to indicator */}
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${activeSemester && activeSemester >= 1 ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
          → {semesterLabel}
        </span>
      </div>

      {needsTitle && (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={type === "assignment" ? "Assignment title" : "Notice title"}
          required
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none focus:border-blue-300 focus:bg-white"
        />
      )}

      {type === "assignment" && (
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600 outline-none focus:border-blue-300 focus:bg-white"
        />
      )}

      {file && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span className="flex-1 truncate text-xs text-slate-600">{file.name}</span>
          <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }} className="text-[10px] text-slate-400 hover:text-rose-500">✕</button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <label className="shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-400 hover:text-slate-600">
          <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </label>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => { setContent(e.target.value); autoGrow(e); }}
          onKeyDown={handleKeyDown}
          placeholder="Write a message…"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
          style={{ maxHeight: 120 }}
        />

        <button
          type="submit"
          disabled={isSending || !content.trim() || (needsTitle && !title.trim())}
          className="btn-press mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
        >
          {isSending
            ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
          }
        </button>
      </div>
    </form>
  );
};

/* ── Page ─────────────────────────────────────────────────────────────────── */

const ClassMessagesPage = () => {
  const { user } = useAuth();

  const [programmes, setProgrammes]                   = useState([]);
  const [activeProgrammeId, setActiveProgrammeId]     = useState(null);
  const [activeSemester, setActiveSemester]           = useState(null); // null=all, 0=unset, N=specific
  const [messages, setMessages]                       = useState([]);
  const [isLoadingProgrammes, setIsLoadingProgrammes] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages]     = useState(false);
  const [hasMore, setHasMore]                         = useState(false);
  const [error, setError]                             = useState("");

  const scrollRef            = useRef(null);
  const prevProgrammeRef     = useRef(null);
  const activeProgrammeIdRef = useRef(null);  // stale-closure guard for socket
  const activeSemesterRef    = useRef(null);  // stale-closure guard for socket

  const isAdmin   = user?.role === "admin";
  const isFaculty = user?.role === "faculty";
  const isStudent = user?.role === "student";
  const canPost   = isAdmin || isFaculty;
  const userId    = user?.id;

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  // Keep refs in sync
  useEffect(() => { activeProgrammeIdRef.current = activeProgrammeId; }, [activeProgrammeId]);
  useEffect(() => { activeSemesterRef.current    = activeSemester;    }, [activeSemester]);

  // ── For students: auto-derive activeSemester from their profile ────────────
  useEffect(() => {
    if (!isStudent) return;
    // currentSemester null → show only null-semester (all-programme) messages
    setActiveSemester(user?.currentSemester ?? 0);
  }, [isStudent, user?.currentSemester]);

  // ── Load programmes ────────────────────────────────────────────────────────
  useEffect(() => {
    apiFetch("/programs", { method: "GET" })
      .then((data) => setProgrammes(data.programs || []))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoadingProgrammes(false));
  }, []);

  // ── Auto-select programme ─────────────────────────────────────────────────
  useEffect(() => {
    if (programmes.length === 0 || activeProgrammeId) return;

    if (isStudent && user?.program) {
      const match = programmes.find(
        (p) =>
          p.code.toLowerCase() === user.program.toLowerCase() ||
          p.name.toLowerCase() === user.program.toLowerCase()
      );
      setActiveProgrammeId(match ? match.id : programmes[0].id);
    } else {
      setActiveProgrammeId(programmes[0].id);
    }
  }, [programmes, user, isStudent, activeProgrammeId]);

  // ── Socket: connect once, cleanup on unmount ──────────────────────────────
  useEffect(() => {
    socket.connect();

    socket.on("class-message", (msg) => {
      if (msg.programmeId !== activeProgrammeIdRef.current) return;
      if (!shouldShowMessage(msg, activeSemesterRef.current)) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(scrollToBottom, 50);
    });

    socket.on("class-message-deleted", (msgId) => {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    });

    return () => {
      if (prevProgrammeRef.current) {
        socket.emit("leave-programme-room", { programmeId: prevProgrammeRef.current });
      }
      socket.off("class-message");
      socket.off("class-message-deleted");
      socket.disconnect();
    };
  }, [scrollToBottom]);

  // ── Switch programme: leave old room, join new, clear + reload messages ───
  useEffect(() => {
    if (!activeProgrammeId) return;

    if (prevProgrammeRef.current && prevProgrammeRef.current !== activeProgrammeId) {
      socket.emit("leave-programme-room", { programmeId: prevProgrammeRef.current });
    }
    prevProgrammeRef.current = activeProgrammeId;
    socket.emit("join-programme-room", { programmeId: activeProgrammeId });
  }, [activeProgrammeId]);

  // ── Reload messages when programme or semester changes ────────────────────
  useEffect(() => {
    if (!activeProgrammeId) return;

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      setMessages([]);
      setHasMore(false);
      setError("");
      try {
        const semParam = buildApiSemesterParam(activeSemester);
        const data = await apiFetch(
          `/class-messages?programmeId=${activeProgrammeId}${semParam}`,
          { method: "GET" }
        );
        setMessages(data.messages || []);
        setHasMore(data.hasMore || false);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    loadMessages();
  }, [activeProgrammeId, activeSemester]);

  // Scroll to bottom after initial load
  useEffect(() => {
    if (!isLoadingMessages && messages.length > 0) setTimeout(scrollToBottom, 150);
  }, [isLoadingMessages]);

  // ── Load older messages ───────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!hasMore || messages.length === 0) return;
    try {
      const semParam  = buildApiSemesterParam(activeSemester);
      const oldest    = messages[0].id;
      const data      = await apiFetch(
        `/class-messages?programmeId=${activeProgrammeId}&before=${oldest}${semParam}`,
        { method: "GET" }
      );
      setMessages((prev) => [...(data.messages || []), ...prev]);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error(err);
    }
  }, [hasMore, messages, activeProgrammeId, activeSemester]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (msgId) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await apiFetch(`/class-messages/${msgId}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
    }
  }, []);

  const activeProgramme   = programmes.find((p) => p.id === activeProgrammeId);
  const semesterOptions   = activeProgramme
    ? [
        { value: null,  label: "All Semesters" },
        ...Array.from({ length: activeProgramme.totalSemesters }, (_, i) => ({
          value: i + 1,
          label: `Semester ${i + 1}`,
        })),
      ]
    : [];

  // Top-bar right: semester badge for students
  const topBarRight = activeProgramme && isStudent ? (
    <div className="flex items-center gap-2">
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{activeProgramme.code}</span>
      {activeSemester && activeSemester >= 1
        ? <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">Semester {activeSemester}</span>
        : <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Semester not assigned</span>
      }
    </div>
  ) : null;

  return (
    <AppLayout activePage="class-messages" user={user} title="Class Messages" topBarRight={topBarRight}>
      <div className="-mx-4 -my-6 sm:-mx-6 flex flex-col overflow-hidden" style={{ height: "calc(100vh - 3.5rem)" }}>

        {/* ── Controls bar ─────────────────────────────────────────────────── */}
        {!isLoadingProgrammes && programmes.length > 0 && (
          <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-2.5">
            {canPost ? (
              /* Faculty / Admin: programme + semester selectors */
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-400">Programme</label>
                  <select
                    value={activeProgrammeId || ""}
                    onChange={(e) => { setActiveProgrammeId(e.target.value); setActiveSemester(null); }}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
                  >
                    {programmes.map((p) => (
                      <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                    ))}
                  </select>
                </div>

                {semesterOptions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-400">Semester</label>
                    <div className="flex gap-1">
                      {semesterOptions.map(({ value, label }) => (
                        <button
                          key={String(value)}
                          type="button"
                          onClick={() => setActiveSemester(value)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                            activeSemester === value
                              ? value === null
                                ? "bg-slate-700 text-white"
                                : "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {value === null ? "All" : value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Student: read-only info row */
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-400">Viewing:</span>
                <span className="font-bold text-slate-700">{activeProgramme?.name}</span>
                {activeSemester && activeSemester >= 1 && (
                  <>
                    <span className="text-slate-300">/</span>
                    <span className="font-bold text-indigo-600">Semester {activeSemester}</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── No semester warning for students ──────────────────────────────── */}
        {isStudent && activeSemester === 0 && (
          <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2">
            <p className="text-xs font-semibold text-amber-800">
              Your semester has not been assigned yet — showing programme-wide announcements only. Contact the administrator.
            </p>
          </div>
        )}

        {/* ── Message list ─────────────────────────────────────────────────── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl">

            {hasMore && (
              <div className="flex justify-center py-3">
                <button type="button" onClick={loadMore} className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-200">
                  Load older messages
                </button>
              </div>
            )}

            {isLoadingProgrammes && (
              <div className="flex items-center justify-center py-20">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              </div>
            )}

            {!isLoadingProgrammes && isLoadingMessages && (
              <div className="space-y-3 px-4 py-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex animate-pulse gap-2.5">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 rounded bg-slate-200" />
                      <div className="h-3 w-full rounded bg-slate-200" />
                      <div className="h-3 w-2/3 rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoadingProgrammes && !isLoadingMessages && error && (
              <div className="px-4 py-6 text-center text-sm text-rose-600">{error}</div>
            )}

            {!isLoadingProgrammes && programmes.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-sm font-bold text-slate-500">No programmes found.</p>
                <p className="mt-1 text-xs text-slate-400">Ask the admin to add programmes first.</p>
              </div>
            )}

            {!isLoadingMessages && !error && messages.length === 0 && activeProgramme && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-500">No messages yet</p>
                <p className="mt-1 text-xs text-slate-400">
                  {canPost ? "Send the first message to this class!" : "Check back later."}
                </p>
              </div>
            )}

            {/* Messages with date dividers */}
            {!isLoadingMessages && !error && messages.map((msg, idx) => {
              const prev     = messages[idx - 1];
              const showDate = !prev || new Date(msg.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();
              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex items-center justify-center py-3">
                      <span className="rounded-full bg-slate-100 px-3 py-0.5 text-[10px] font-semibold text-slate-400">
                        {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    msg={msg}
                    userId={userId}
                    isAdmin={isAdmin}
                    isFaculty={isFaculty}
                    onDelete={handleDelete}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Compose / footer ─────────────────────────────────────────────── */}
        {canPost && activeProgrammeId && (
          <ComposeBar programmeId={activeProgrammeId} activeSemester={activeSemester} />
        )}

        {!canPost && (
          <div className="shrink-0 border-t border-slate-200 bg-slate-50 py-3 text-center text-xs text-slate-400">
            Only faculty and admin can send messages
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ClassMessagesPage;
