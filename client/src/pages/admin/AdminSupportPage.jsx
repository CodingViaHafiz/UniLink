import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { apiFetch } from "../../lib/api";
import socket from "../../lib/socket";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/* ── Conversation list item ───────────────────────────────────────────────── */

const ConvItem = ({ conv, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors ${
      isActive ? "bg-sky-50 ring-1 ring-sky-200" : "hover:bg-slate-50"
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-black text-blue-700">
            {conv.studentName?.charAt(0)?.toUpperCase()}
          </div>
          <span className="truncate text-xs font-bold text-slate-800">{conv.studentName}</span>
        </div>
        <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-700">{conv.subject}</p>
        {conv.lastMessagePreview && (
          <p className="truncate text-[10px] text-slate-400">{conv.lastMessagePreview}</p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {conv.unreadByAdmin > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
            {conv.unreadByAdmin}
          </span>
        )}
        <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase ${
          conv.status === "open" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
        }`}>
          {conv.status}
        </span>
        <span className="text-[9px] text-slate-400">{timeAgo(conv.lastMessageAt)}</span>
      </div>
    </div>
  </button>
);

/* ── Message bubble ───────────────────────────────────────────────────────── */

const MessageBubble = ({ msg }) => {
  const isAdmin = msg.senderRole === "admin";
  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"} px-4 py-1`}>
      <div className={`max-w-[75%] flex flex-col gap-0.5 ${isAdmin ? "items-end" : "items-start"}`}>
        {!isAdmin && (
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[9px] font-black text-blue-700">
              {msg.senderName?.charAt(0)?.toUpperCase()}
            </div>
            <span className="text-[10px] font-bold text-slate-500">{msg.senderName}</span>
          </div>
        )}
        <div className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          isAdmin
            ? "rounded-br-sm bg-emerald-600 text-white"
            : "rounded-bl-sm bg-white text-slate-800 border border-slate-200"
        }`}>
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
        <span className="text-[10px] text-slate-400 px-1">
          {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};

/* ── Compose bar ──────────────────────────────────────────────────────────── */

const ComposeBar = ({ conversationId, disabled }) => {
  const [content, setContent]     = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef(null);

  const autoGrow = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || disabled) return;
    setIsSending(true);
    try {
      await apiFetch(`/support/conversations/${conversationId}/messages`, {
        method: "POST",
        body:   JSON.stringify({ content }),
      });
      setContent("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  return (
    <form onSubmit={handleSubmit} className="shrink-0 border-t border-slate-200 bg-white px-3 py-2.5">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => { setContent(e.target.value); autoGrow(e); }}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Conversation is resolved" : "Reply to student… (Enter to send)"}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white disabled:opacity-50"
          style={{ maxHeight: 100 }}
        />
        <button
          type="submit"
          disabled={isSending || !content.trim() || disabled}
          className="btn-press mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40"
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

const AdminSupportPage = () => {
  const { user } = useAuth();

  const [conversations, setConversations]       = useState([]);
  const [activeConvId, setActiveConvId]         = useState(null);
  const [messages, setMessages]                 = useState([]);
  const [hasMore, setHasMore]                   = useState(false);
  const [isLoadingConvs, setIsLoadingConvs]     = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs]       = useState(false);
  const [isResolving, setIsResolving]           = useState(false);
  const [filter, setFilter]                     = useState("open");  // "open" | "all"

  const scrollRef    = useRef(null);
  const activeIdRef  = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  useEffect(() => { activeIdRef.current = activeConvId; }, [activeConvId]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;

  // ── Fetch conversations ──────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoadingConvs(true);
      try {
        const { conversations: convs } = await apiFetch("/support/conversations");
        setConversations(convs || []);
      } catch {
        // silent
      } finally {
        setIsLoadingConvs(false);
      }
    };
    load();
  }, []);

  // ── Load messages for active conversation ────────────────────────────────
  useEffect(() => {
    if (!activeConvId) return;
    const load = async () => {
      setIsLoadingMsgs(true);
      setMessages([]);
      setHasMore(false);
      try {
        const { messages: msgs, hasMore: more } = await apiFetch(
          `/support/conversations/${activeConvId}/messages`
        );
        setMessages(msgs || []);
        setHasMore(more || false);
        apiFetch(`/support/conversations/${activeConvId}/read`, { method: "PATCH" }).catch(() => {});
        // Reset unread count in local state
        setConversations((prev) =>
          prev.map((c) => c.id === activeConvId ? { ...c, unreadByAdmin: 0 } : c)
        );
      } catch {
        // silent
      } finally {
        setIsLoadingMsgs(false);
      }
    };
    load();
  }, [activeConvId]);

  // Scroll to bottom after messages load
  useEffect(() => {
    if (!isLoadingMsgs && messages.length > 0) setTimeout(scrollToBottom, 100);
  }, [isLoadingMsgs]);

  // ── Socket (admin auto-joins support:admin on connection in server.js) ───
  useEffect(() => {
    socket.connect();

    // New conversation from a student
    socket.on("support-conversation", (conv) => {
      setConversations((prev) => {
        if (prev.some((c) => c.id === conv.id)) return prev;
        return [conv, ...prev];
      });
    });

    // Conversation metadata updated (new message, resolved, etc.)
    socket.on("support-conversation-updated", (updated) => {
      setConversations((prev) =>
        prev.map((c) => c.id === updated.id ? updated : c)
      );
      // If this conversation is currently open, don't show unread badge
      if (updated.id === activeIdRef.current) {
        setConversations((prev) =>
          prev.map((c) => c.id === updated.id ? { ...c, unreadByAdmin: 0 } : c)
        );
      }
    });

    // New message in the active conversation
    socket.on("support-message", ({ message, conversation: updatedConv }) => {
      if (message.conversationId !== activeIdRef.current) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setConversations((prev) =>
        prev.map((c) => c.id === updatedConv.id ? { ...updatedConv, unreadByAdmin: 0 } : c)
      );
      apiFetch(`/support/conversations/${message.conversationId}/read`, { method: "PATCH" }).catch(() => {});
      setTimeout(scrollToBottom, 50);
    });

    socket.on("support-conversation-resolved", (updated) => {
      setConversations((prev) =>
        prev.map((c) => c.id === updated.id ? updated : c)
      );
    });

    return () => {
      if (activeIdRef.current) {
        socket.emit("leave-support-room", { conversationId: activeIdRef.current });
      }
      socket.off("support-conversation");
      socket.off("support-conversation-updated");
      socket.off("support-message");
      socket.off("support-conversation-resolved");
      socket.disconnect();
    };
  }, [scrollToBottom]);

  // ── Join/leave support room when active conversation changes ─────────────
  useEffect(() => {
    if (!activeConvId) return;
    socket.emit("join-support-room", { conversationId: activeConvId });
    return () => {
      socket.emit("leave-support-room", { conversationId: activeConvId });
    };
  }, [activeConvId]);

  // ── Load older messages ──────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!hasMore || messages.length === 0 || !activeConvId) return;
    try {
      const oldest = messages[0].id;
      const { messages: older, hasMore: more } = await apiFetch(
        `/support/conversations/${activeConvId}/messages?before=${oldest}`
      );
      setMessages((prev) => [...(older || []), ...prev]);
      setHasMore(more || false);
    } catch {
      // silent
    }
  }, [hasMore, messages, activeConvId]);

  // ── Resolve conversation ─────────────────────────────────────────────────
  const handleResolve = async () => {
    if (!activeConvId || !window.confirm("Mark this conversation as resolved?")) return;
    setIsResolving(true);
    try {
      await apiFetch(`/support/conversations/${activeConvId}/resolve`, { method: "PATCH" });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsResolving(false);
    }
  };

  // ── Filtered list ────────────────────────────────────────────────────────
  const filteredConvs = filter === "open"
    ? conversations.filter((c) => c.status === "open")
    : conversations;

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadByAdmin || 0), 0);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">Support Chat</h1>
          <p className="text-xs text-slate-400">Respond to student support requests in real-time</p>
        </div>
        {totalUnread > 0 && (
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
            {totalUnread} unread
          </span>
        )}
      </div>

      {/* Split panel */}
      <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" style={{ height: "calc(100vh - 12rem)" }}>

        {/* ── Left: conversation list ─────────────────────────────────────── */}
        <aside className={`flex flex-col border-r border-slate-200 ${activeConvId ? "hidden lg:flex" : "flex"} w-full lg:w-72 xl:w-80 shrink-0`}>
          {/* Filter tabs */}
          <div className="shrink-0 flex gap-1 border-b border-slate-100 p-2">
            {["open", "all"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold capitalize transition-colors ${
                  filter === f ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {f === "open" ? `Open${conversations.filter(c => c.status === "open").length ? ` (${conversations.filter(c => c.status === "open").length})` : ""}` : "All"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoadingConvs && (
              <div className="flex items-center justify-center py-12">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              </div>
            )}

            {!isLoadingConvs && filteredConvs.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400">
                {filter === "open" ? "No open conversations." : "No conversations yet."}
              </div>
            )}

            {filteredConvs.map((conv) => (
              <ConvItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConvId}
                onClick={() => setActiveConvId(conv.id)}
              />
            ))}
          </div>
        </aside>

        {/* ── Right: chat area ────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {!activeConvId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-6">
              <div className="rounded-2xl bg-slate-100 p-5 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-500">Select a conversation</p>
              <p className="text-xs text-slate-400">Choose a student request from the left to start replying.</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="shrink-0 flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Back button on mobile */}
                  <button
                    type="button"
                    onClick={() => setActiveConvId(null)}
                    className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 lg:hidden"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">{activeConv?.subject}</p>
                    <p className="text-[10px] text-slate-400">
                      {activeConv?.studentName} · {activeConv && new Date(activeConv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                    activeConv?.status === "open" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                  }`}>
                    {activeConv?.status}
                  </span>
                  {activeConv?.status === "open" && (
                    <button
                      type="button"
                      onClick={handleResolve}
                      disabled={isResolving}
                      className="btn-press rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {isResolving ? "Resolving…" : "Resolve"}
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto py-3">
                <div className="mx-auto max-w-2xl">
                  {hasMore && (
                    <div className="flex justify-center py-2">
                      <button type="button" onClick={loadMore} className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-200">
                        Load older messages
                      </button>
                    </div>
                  )}

                  {isLoadingMsgs && (
                    <div className="flex items-center justify-center py-12">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                    </div>
                  )}

                  {!isLoadingMsgs && messages.length === 0 && (
                    <div className="py-12 text-center text-xs text-slate-400">No messages yet.</div>
                  )}

                  {!isLoadingMsgs && messages.map((msg, idx) => {
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
                        <MessageBubble msg={msg} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Compose */}
              <ComposeBar
                conversationId={activeConvId}
                disabled={activeConv?.status === "resolved"}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportPage;
