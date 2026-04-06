import { useCallback, useEffect, useRef, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";
import socket from "../lib/socket";

/* ── Message bubble ───────────────────────────────────────────────────────── */

const MessageBubble = ({ msg, userId }) => {
  const isMine = msg.senderId === userId;
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} px-4 py-1`}>
      <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
        {!isMine && (
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700">
              {msg.senderName?.charAt(0)?.toUpperCase()}
            </div>
            <span className="text-xs font-bold text-slate-500">{msg.senderName}</span>
            <span className="rounded px-1 py-0.5 text-[8px] font-bold uppercase bg-emerald-100 text-emerald-700">
              admin
            </span>
          </div>
        )}
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
            isMine
              ? "rounded-br-sm bg-blue-600 text-white"
              : "rounded-bl-sm bg-white text-slate-800 border border-slate-200"
          }`}
        >
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
          placeholder="Type your message… (Enter to send)"
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-blue-300 focus:bg-white disabled:opacity-50"
          style={{ maxHeight: 100 }}
        />
        <button
          type="submit"
          disabled={isSending || !content.trim() || disabled}
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

/* ── Start conversation form ──────────────────────────────────────────────── */

const StartForm = ({ onStarted }) => {
  const [subject, setSubject]     = useState("");
  const [firstMsg, setFirstMsg]   = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !firstMsg.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const { conversation } = await apiFetch("/support/conversations", {
        method: "POST",
        body:   JSON.stringify({ subject }),
      });
      await apiFetch(`/support/conversations/${conversation.id}/messages`, {
        method: "POST",
        body:   JSON.stringify({ content: firstMsg }),
      });
      onStarted(conversation.id);
    } catch (err) {
      // 409 = already has open conversation
      if (err.message.includes("open support")) {
        onStarted(null); // trigger a refetch
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-black text-slate-900">Contact Support</h2>
          <p className="mt-1 text-xs text-slate-500">Describe your issue and the admin will respond shortly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Fee payment issue, Document request…"
              required
              maxLength={200}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">Message</label>
            <textarea
              value={firstMsg}
              onChange={(e) => setFirstMsg(e.target.value)}
              placeholder="Describe your issue in detail…"
              required
              rows={4}
              maxLength={2000}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:bg-white"
            />
          </div>
          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={isLoading || !subject.trim() || !firstMsg.trim()}
            className="btn-press w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Sending…" : "Start Conversation"}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ── Page ─────────────────────────────────────────────────────────────────── */

const SupportChatPage = () => {
  const { user } = useAuth();

  const [conversation, setConversation]     = useState(null);   // active open conversation
  const [messages, setMessages]             = useState([]);
  const [hasMore, setHasMore]               = useState(false);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs]   = useState(false);
  const [pastConvs, setPastConvs]           = useState([]);      // resolved ones

  const scrollRef     = useRef(null);
  const convIdRef     = useRef(null);  // stale-closure guard

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  useEffect(() => { convIdRef.current = conversation?.id; }, [conversation]);

  // ── Fetch conversations ──────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    setIsLoadingConvs(true);
    try {
      const { conversations } = await apiFetch("/support/conversations");
      const open     = conversations.find((c) => c.status === "open");
      const resolved = conversations.filter((c) => c.status === "resolved");
      setConversation(open || null);
      setPastConvs(resolved);
    } catch {
      // silent
    } finally {
      setIsLoadingConvs(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // ── Load messages when conversation is set ───────────────────────────────
  useEffect(() => {
    if (!conversation?.id) return;

    const load = async () => {
      setIsLoadingMsgs(true);
      setMessages([]);
      try {
        const { messages: msgs, hasMore: more } = await apiFetch(
          `/support/conversations/${conversation.id}/messages`
        );
        setMessages(msgs || []);
        setHasMore(more || false);
        // Mark as read
        apiFetch(`/support/conversations/${conversation.id}/read`, { method: "PATCH" }).catch(() => {});
      } catch {
        // silent
      } finally {
        setIsLoadingMsgs(false);
      }
    };
    load();
  }, [conversation?.id]);

  // Scroll to bottom after messages load
  useEffect(() => {
    if (!isLoadingMsgs && messages.length > 0) setTimeout(scrollToBottom, 100);
  }, [isLoadingMsgs]);

  // ── Socket ───────────────────────────────────────────────────────────────
  useEffect(() => {
    socket.connect();

    socket.on("support-message", ({ message, conversation: updatedConv }) => {
      if (message.conversationId !== convIdRef.current) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setConversation(updatedConv);
      // Mark as read since user is looking at it
      apiFetch(`/support/conversations/${message.conversationId}/read`, { method: "PATCH" }).catch(() => {});
      setTimeout(scrollToBottom, 50);
    });

    socket.on("support-conversation-resolved", (updatedConv) => {
      if (updatedConv.id !== convIdRef.current) return;
      setConversation(updatedConv);
    });

    return () => {
      if (convIdRef.current) {
        socket.emit("leave-support-room", { conversationId: convIdRef.current });
      }
      socket.off("support-message");
      socket.off("support-conversation-resolved");
      socket.disconnect();
    };
  }, [scrollToBottom]);

  // ── Join room when conversation loads ────────────────────────────────────
  useEffect(() => {
    if (!conversation?.id) return;
    socket.emit("join-support-room", { conversationId: conversation.id });
    return () => {
      socket.emit("leave-support-room", { conversationId: conversation.id });
    };
  }, [conversation?.id]);

  // ── Load older messages ──────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!hasMore || messages.length === 0 || !conversation?.id) return;
    try {
      const oldest = messages[0].id;
      const { messages: older, hasMore: more } = await apiFetch(
        `/support/conversations/${conversation.id}/messages?before=${oldest}`
      );
      setMessages((prev) => [...(older || []), ...prev]);
      setHasMore(more || false);
    } catch {
      // silent
    }
  }, [hasMore, messages, conversation?.id]);

  // ── After starting a new conversation ───────────────────────────────────
  const handleStarted = useCallback((newId) => {
    loadConversations();
  }, [loadConversations]);

  // ── Render ───────────────────────────────────────────────────────────────
  const isResolved = conversation?.status === "resolved";

  const statusBadge = conversation ? (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
      isResolved ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"
    }`}>
      {isResolved ? "Resolved" : "Open"}
    </span>
  ) : null;

  return (
    <AppLayout activePage="support" user={user} title="Support Chat" topBarRight={statusBadge}>
      <div className="-mx-4 -my-6 sm:-mx-6 flex flex-col overflow-hidden" style={{ height: "calc(100vh - 3.5rem)" }}>

        {isLoadingConvs && (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          </div>
        )}

        {/* No active conversation → start form */}
        {!isLoadingConvs && !conversation && (
          <StartForm onStarted={handleStarted} />
        )}

        {/* Active conversation → chat view */}
        {!isLoadingConvs && conversation && (
          <>
            {/* Conversation header */}
            <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">{conversation.subject}</p>
                  <p className="text-[10px] text-slate-400">
                    Started {new Date(conversation.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                  isResolved ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {isResolved ? "Resolved" : "Open"}
                </span>
              </div>
            </div>

            {/* Resolved notice */}
            {isResolved && (
              <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-2 text-center text-xs font-semibold text-slate-500">
                This conversation has been resolved.{" "}
                <button
                  type="button"
                  onClick={() => setConversation(null)}
                  className="font-bold text-blue-600 underline hover:text-blue-700"
                >
                  Start a new request
                </button>
              </div>
            )}

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
                      <MessageBubble msg={msg} userId={user?.id} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Compose (disabled if resolved) */}
            <ComposeBar conversationId={conversation.id} disabled={isResolved} />
            {isResolved && (
              <div className="shrink-0 border-t border-slate-200 bg-slate-50 py-2.5 text-center text-xs text-slate-400">
                This conversation is resolved — you cannot send more messages
              </div>
            )}
          </>
        )}

        {/* Past resolved conversations */}
        {!isLoadingConvs && !conversation && pastConvs.length > 0 && (
          <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-4 py-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Past Requests</p>
            <div className="space-y-1">
              {pastConvs.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setConversation(c)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs hover:bg-white"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-700">{c.subject}</p>
                    <p className="truncate text-slate-400">{c.lastMessagePreview || "No messages"}</p>
                  </div>
                  <span className="ml-3 shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-500">Resolved</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SupportChatPage;
