import { useCallback, useEffect, useRef, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { API_BASE, SERVER_URL, apiFetch } from "../lib/api";

const resolveImg = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SERVER_URL}${url}`;
};
import socket from "../lib/socket";

const REACTIONS = [
  { key: "love", emoji: "❤️" },
  { key: "thumbsup", emoji: "👍" },
];

/* ── Post Bubble ──────────────────────────────────────────────────────────── */

const PostBubble = ({ post, userId, onReact, onVote, onDelete, onPin, isAdmin, isFaculty }) => {
  const isMine = post.authorId === userId;
  const hasVoted = post.poll?.options.some((o) => o.voters.includes(userId));
  const totalVotes = post.poll?.options.reduce((sum, o) => sum + o.votes, 0) || 0;

  return (
    <div className={`group flex ${isMine ? "justify-end" : "justify-start"} px-4 py-1`}>
      {/* Avatar — only for others, aligned to top of bubble */}
      {!isMine && (
        <div className="mr-2 mt-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-black text-sky-700">
          {post.author?.charAt(0)?.toUpperCase()}
        </div>
      )}

      <div className={`flex max-w-[75%] flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}>
        {/* Header row: name (others) + hover actions */}
        <div className={`flex items-center gap-1.5 px-1 ${isMine ? "flex-row-reverse" : ""}`}>
          {!isMine && (
            <>
              <span className="text-xs font-bold text-slate-700">{post.author}</span>
              <span className={`rounded px-1 py-0.5 text-[8px] font-bold uppercase leading-none ${post.role === "admin" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                {post.role}
              </span>
            </>
          )}
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            {(isAdmin || isFaculty) && (
              <button type="button" onClick={() => onPin(post.id)} className="rounded px-1 py-0.5 text-[11px] text-slate-400 hover:bg-amber-50 hover:text-amber-600" title={post.isPinned ? "Unpin" : "Pin"}>
                📌
              </button>
            )}
            {(isAdmin || (isFaculty && post.role !== "admin") || post.authorId === userId) && (
              <button type="button" onClick={() => onDelete(post.id)} className="rounded px-1 py-0.5 text-[10px] text-slate-400 hover:bg-rose-50 hover:text-rose-600">✕</button>
            )}
          </div>
        </div>

        {/* Bubble */}
        <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isMine
          ? "rounded-br-sm bg-sky-600 text-white"
          : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
          }`}>
          {/* Content */}
          <p className="whitespace-pre-wrap">{post.content}</p>

          {/* Image */}
          {post.imageUrl && (
            <img src={resolveImg(post.imageUrl)} alt="" className="mt-2 max-h-56 rounded-xl object-cover" />
          )}

          {/* Poll */}
          {post.poll && (
            <div className={`mt-2 max-w-sm space-y-1 rounded-xl border p-2.5 ${isMine ? "border-white/20 bg-white/10" : "border-slate-100 bg-slate-50"}`}>
              <p className={`text-xs font-bold ${isMine ? "text-white" : "text-slate-700"}`}>{post.poll.question}</p>
              {post.poll.options.map((opt) => {
                const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                const voted = opt.voters.includes(userId);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onVote(post.id, opt.id)}
                    className={`relative flex w-full items-center justify-between overflow-hidden rounded-lg border px-2.5 py-1.5 text-left text-xs font-semibold transition-colors ${voted
                      ? "border-sky-300 bg-sky-50 text-sky-700"
                      : isMine
                        ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                  >
                    {hasVoted && (
                      <div className={`absolute inset-y-0 left-0 transition-all ${isMine ? "bg-sky-500" : "bg-sky-100"}`} style={{ width: `${pct}%` }} />
                    )}
                    <span className="relative z-10">{opt.text}</span>
                    {hasVoted && <span className={`relative z-10 text-[10px] font-bold ${isMine ? "text-white" : voted ? "text-blue-500" : "text-slate-700"}`}>{pct}%</span>}
                  </button>
                );
              })}
              <p className={`text-[10px] ${isMine ? "text-white/60" : "text-slate-400"}`}>{totalVotes} {totalVotes === 1 ? "vote" : "votes"}</p>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="px-1 text-[10px] text-slate-400">
          {new Date(post.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </span>

        {/* Reactions */}
        <div className="flex items-center gap-1 px-1">
          {REACTIONS.map((r) => {
            const count = post.reactions[r.key]?.length || 0;
            const reacted = post.reactions[r.key]?.includes(userId);
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => onReact(post.id, r.key)}
                className={`btn-press inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${reacted ? "bg-sky-100 text-sky-700" : "text-slate-400 hover:bg-slate-100"}`}
              >
                {r.emoji} {count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ── Compose Bar ──────────────────────────────────────────────────────────── */

const ComposeBar = ({ onCreated }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [isPosting, setIsPosting] = useState(false);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else { setImagePreview(null); }
  };

  const removeImage = () => { setImage(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; };
  const addOption = () => { if (pollOptions.length < 6) setPollOptions([...pollOptions, ""]); };
  const updateOption = (idx, val) => { const u = [...pollOptions]; u[idx] = val; setPollOptions(u); };
  const removeOption = (idx) => { if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, i) => i !== idx)); };

  const reset = () => {
    setContent(""); removeImage(); setShowPoll(false); setPollQuestion(""); setPollOptions(["", ""]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  // Auto-fill content from poll question if user didn't type a message
  const effectiveContent = content.trim() || (showPoll && pollQuestion.trim() ? `📊 ${pollQuestion.trim()}` : "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!effectiveContent) return;

    if (showPoll) {
      if (!pollQuestion.trim()) { alert("Poll question is required."); return; }
      const validOptions = pollOptions.filter((o) => o.trim());
      if (validOptions.length < 2) { alert("At least 2 poll options are required."); return; }
    }

    setIsPosting(true);
    try {
      const form = new FormData();
      form.append("content", effectiveContent);
      if (image) form.append("image", image);
      if (showPoll && pollQuestion.trim()) {
        form.append("pollQuestion", pollQuestion);
        form.append("pollOptions", JSON.stringify(pollOptions.filter((o) => o.trim())));
      }
      await apiFetch("/feed", { method: "POST", body: form });
      onCreated?.();
      reset();
    } catch (err) { alert(err.message); }
    finally { setIsPosting(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  // Prevent Enter in poll inputs from submitting the form
  const stopEnter = (e) => { if (e.key === "Enter") e.preventDefault(); };

  const autoGrow = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  };

  return (
    <form onSubmit={handleSubmit} className="shrink-0 border-t border-slate-200 bg-white px-3 py-2">
      {/* Previews above input */}
      {(imagePreview || showPoll) && (
        <div className="mb-2 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
          {imagePreview && (
            <div className="relative inline-block">
              <img src={imagePreview} alt="" className="h-16 rounded-lg object-cover" />
              <button type="button" onClick={removeImage} className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[8px] text-white">✕</button>
            </div>
          )}
          {showPoll && (
            <div className="space-y-1.5">
              <input type="text" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} onKeyDown={stopEnter} placeholder="Poll question" className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-sky-300" />
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <input type="text" value={opt} onChange={(e) => updateOption(i, e.target.value)} onKeyDown={stopEnter} placeholder={`Option ${i + 1}`} className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-sky-300" />
                  {pollOptions.length > 2 && <button type="button" onClick={() => removeOption(i)} className="text-[10px] text-slate-400 hover:text-rose-500">✕</button>}
                </div>
              ))}
              {pollOptions.length < 6 && <button type="button" onClick={addOption} className="text-[10px] font-semibold text-sky-600">+ Add option</button>}
            </div>
          )}
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex shrink-0 items-center gap-0.5 pb-0.5">
          <label className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:text-slate-600">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </label>
          <button type="button" onClick={() => setShowPoll(!showPoll)} className={`rounded-lg p-1.5 ${showPoll ? "text-sky-600" : "text-slate-400 hover:text-slate-600"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => { setContent(e.target.value); autoGrow(e); }}
          onKeyDown={handleKeyDown}
          placeholder="Write a post..."
          rows={1}
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-sky-300 focus:bg-white"
          style={{ maxHeight: 100 }}
        />
        <button
          type="submit"
          disabled={isPosting || !effectiveContent}
          className="btn-press mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-40"
        >
          {isPosting ? (
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
          )}
        </button>
      </div>
    </form>
  );
};

/* ── Feed Page ────────────────────────────────────────────────────────────── */

const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const scrollRef = useRef(null);

  const canPost = user?.role === "faculty" || user?.role === "admin";
  const isAdmin = user?.role === "admin";
  const isFaculty = user?.role === "faculty"
  const userId = user?.id;

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch("/feed", { method: "GET" });
        setPosts(data.posts || []);
      } catch (err) { setError(err.message); }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  // Scroll to bottom after initial load so user sees latest messages
  useEffect(() => {
    if (!isLoading && posts.length > 0) setTimeout(scrollToBottom, 150);
  }, [isLoading]);

  useEffect(() => {
    socket.connect();
    socket.on("new-post", (post) => {
      setPosts((prev) => prev.some((p) => p.id === post.id) ? prev : [...prev, post]);
      setTimeout(scrollToBottom, 50);
    });
    socket.on("update-post", (updated) => setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p))));
    socket.on("delete-post", (postId) => setPosts((prev) => prev.filter((p) => p.id !== postId)));
    socket.on("online-count", (count) => setOnlineCount(count));
    return () => { socket.off("new-post"); socket.off("update-post"); socket.off("delete-post"); socket.off("online-count"); socket.disconnect(); };
  }, [scrollToBottom]);

  const handleReact = useCallback(async (postId, type) => {
    try { await apiFetch(`/feed/${postId}/react`, { method: "POST", body: JSON.stringify({ type }) }); } catch (err) { console.error(err); }
  }, []);
  const handleVote = useCallback(async (postId, optionId) => {
    try { await apiFetch(`/feed/${postId}/vote`, { method: "POST", body: JSON.stringify({ optionId }) }); } catch (err) { console.error(err); }
  }, []);
  const handleDelete = useCallback(async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try { await apiFetch(`/feed/${postId}`, { method: "DELETE" }); } catch (err) { console.error(err); }
  }, []);
  const handlePin = useCallback(async (postId) => {
    try { await apiFetch(`/feed/${postId}/pin`, { method: "PATCH" }); } catch (err) { console.error(err); }
  }, []);
  const handleCreated = useCallback(() => { }, []);

  const pinned = posts.filter((p) => p.isPinned);

  const onlineBadge = (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {onlineCount} online
    </div>
  );

  return (
    <AppLayout activePage="feed" user={user} topBarRight={onlineBadge}>
      {/* Full-height chat container — cancels parent padding, fills screen */}
      <div className="-mx-4 -my-6 sm:-mx-6 flex flex-col overflow-hidden" style={{ height: "calc(100vh - 3.5rem)" }}>

        {/* Pinned banner — sticky top like WhatsApp */}
        {pinned.length > 0 && (
          <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2">
            <div className="mx-auto flex max-w-2xl items-center gap-2">
              <span className="text-xs">📌</span>
              <p className="flex-1 truncate text-xs font-semibold text-amber-800">{pinned[0].content}</p>
              {pinned.length > 1 && (
                <span className="shrink-0 rounded-full bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">+{pinned.length - 1}</span>
              )}
              {(isAdmin || isFaculty) && (
                <button type="button" onClick={() => handlePin(pinned[0].id)} className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 hover:bg-amber-200">
                  Unpin
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl">
            {/* Loading */}
            {isLoading && (
              <div className="space-y-3 px-4 py-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex animate-pulse gap-2.5">
                    <div className="h-7 w-7 shrink-0 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-28 rounded bg-slate-200" />
                      <div className="h-3 w-full rounded bg-slate-200" />
                      <div className="h-3 w-2/3 rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!isLoading && !error && posts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-500">No posts yet</p>
                <p className="mt-1 text-xs text-slate-400">{canPost ? "Be the first to share an update!" : "Check back later."}</p>
              </div>
            )}

            {/* Error */}
            {!isLoading && error && (
              <div className="px-4 py-6 text-center text-sm text-rose-600">{error}</div>
            )}

            {/* Posts with date dividers */}
            {!isLoading && !error && posts.map((post, idx) => {
              const prev = posts[idx - 1];
              const showDate = !prev || new Date(post.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();
              return (
                <div key={post.id}>
                  {showDate && (
                    <div className="flex items-center justify-center py-3">
                      <span className="rounded-full bg-slate-100 px-3 py-0.5 text-[10px] font-semibold text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  )}
                  <PostBubble post={post} userId={userId} onReact={handleReact} onVote={handleVote} onDelete={handleDelete} onPin={handlePin} isAdmin={isAdmin} isFaculty={isFaculty} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Compose bar pinned at bottom */}
        {canPost && <ComposeBar onCreated={handleCreated} />}

        {!canPost && (
          <div className="shrink-0 border-t border-slate-200 bg-slate-50 py-3 text-center text-xs text-slate-400">
            Only faculty and admin can post
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default FeedPage;
