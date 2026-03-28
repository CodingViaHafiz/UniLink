import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import Pagination from "../components/ui/Pagination";
import { useAuth } from "../hooks/useAuth";
import { API_BASE, apiFetch } from "../lib/api";

const ITEMS_PER_PAGE = 9;

const TABS = [
  { key: "lost", label: "Lost Items" },
  { key: "found", label: "Found Items" },
  { key: "mine", label: "My Posts" },
];

/* ── Status badge colours ─────────────────────────────────────────────────── */

const publicBadge = (status) => {
  const map = {
    lost: "bg-rose-100 text-rose-700",
    found: "bg-sky-100 text-sky-700",
    resolved: "bg-emerald-100 text-emerald-700",
  };
  return map[status] || "bg-slate-100 text-slate-600";
};

const myPostBadge = (status) => {
  const map = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    resolved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
  };
  return map[status] || "bg-slate-100 text-slate-600";
};

/* ── Image URL helper ─────────────────────────────────────────────────────── */

const imgUrl = (path) =>
  path ? `${API_BASE.replace("/api", "")}${path}` : null;

/* ── Item Card (public grid) ──────────────────────────────────────────────── */

const ItemCard = ({ item }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
    {/* Image */}
    {item.imageUrl ? (
      <img
        src={imgUrl(item.imageUrl)}
        alt={item.title}
        className="aspect-video w-full object-cover"
      />
    ) : (
      <div className="flex aspect-video items-center justify-center bg-slate-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )}

    <div className="space-y-2 p-4">
      {/* Title + badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h3>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${publicBadge(item.status === "resolved" ? "resolved" : item.type)}`}>
          {item.status === "resolved" ? "Resolved" : item.type === "lost" ? "Lost" : "Found"}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">{item.description}</p>

      {/* Location + date */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
        {item.location && (
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {item.location}
          </span>
        )}
        {item.date && (
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(item.date).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Contact */}
      {item.contact && (
        <p className="text-[11px] font-medium text-slate-500">
          <span className="font-bold text-slate-600">Contact:</span> {item.contact}
        </p>
      )}

      {/* Posted date */}
      <p className="text-[10px] text-slate-300">
        Posted {new Date(item.createdAt).toLocaleDateString()}
      </p>
    </div>
  </div>
);

/* ── My Post Card ─────────────────────────────────────────────────────────── */

const MyPostCard = ({ item, onResolve, onDelete, isDeleting, isResolving }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
    {item.imageUrl ? (
      <img
        src={imgUrl(item.imageUrl)}
        alt={item.title}
        className="aspect-video w-full object-cover"
      />
    ) : (
      <div className="flex aspect-video items-center justify-center bg-slate-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )}

    <div className="space-y-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h3>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${myPostBadge(item.status)}`}>
          {item.status}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">{item.description}</p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
        {item.location && (
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {item.location}
          </span>
        )}
        {item.date && (
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(item.date).toLocaleDateString()}
          </span>
        )}
      </div>

      {item.contact && (
        <p className="text-[11px] font-medium text-slate-500">
          <span className="font-bold text-slate-600">Contact:</span> {item.contact}
        </p>
      )}

      <p className="text-[10px] text-slate-300">
        Posted {new Date(item.createdAt).toLocaleDateString()}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {item.status === "approved" && (
          <button
            type="button"
            onClick={() => onResolve(item._id)}
            disabled={isResolving}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {isResolving ? "Resolving..." : "Mark Resolved"}
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(item._id)}
          disabled={isDeleting}
          className="rounded-lg border border-rose-200 px-3 py-1.5 text-[11px] font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

/* ── Report Item Form ─────────────────────────────────────────────────────── */

const ReportForm = ({ onCreated }) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [contact, setContact] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const reset = () => {
    setType("lost");
    setTitle("");
    setDescription("");
    setLocation("");
    setDate("");
    setContact("");
    removeImage();
    setFormError("");
    setFormSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!title.trim() || !description.trim()) {
      setFormError("Title and description are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append("type", type);
      form.append("title", title.trim());
      form.append("description", description.trim());
      if (location.trim()) form.append("location", location.trim());
      if (date) form.append("date", date);
      if (contact.trim()) form.append("contact", contact.trim());
      if (image) form.append("image", image);

      await apiFetch("/lost-found", { method: "POST", body: form });
      setFormSuccess("Item reported successfully! It will appear after admin approval.");
      reset();
      onCreated?.();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50"
      >
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-sky-100 p-1.5 text-sky-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm font-bold text-slate-800">Report a Lost or Found Item</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible form */}
      {open && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t border-slate-100 px-5 py-5">
          {/* Admin notice */}
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            Posts are reviewed by admin before being published.
          </p>

          {/* Type toggle */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("lost")}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-colors ${
                  type === "lost"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                I Lost Something
              </button>
              <button
                type="button"
                onClick={() => setType("found")}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-colors ${
                  type === "found"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                I Found Something
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Blue backpack near library"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item in detail..."
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
            />
          </div>

          {/* Location + Date row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Main Library, 2nd Floor"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
              />
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">Contact Info</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. Phone number or email"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">Image (optional)</label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-24 rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[10px] text-white transition-colors hover:bg-slate-900"
                >
                  x
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs text-slate-500 transition-colors hover:border-sky-300 hover:bg-sky-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Click to upload an image</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* Error / Success */}
          {formError && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{formError}</p>
          )}
          {formSuccess && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{formSuccess}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-sky-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      )}
    </div>
  );
};

/* ── Skeleton loader ──────────────────────────────────────────────────────── */

const CardSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="aspect-video bg-slate-200" />
    <div className="space-y-3 p-4">
      <div className="h-4 w-3/4 rounded-lg bg-slate-200" />
      <div className="h-3 w-full rounded-lg bg-slate-200" />
      <div className="h-3 w-1/2 rounded-lg bg-slate-200" />
    </div>
  </div>
);

/* ── Main Page ────────────────────────────────────────────────────────────── */

const LostFoundPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("lost");
  const [items, setItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState(null);
  const [actionType, setActionType] = useState(null); // "resolve" | "delete"

  /* ── Fetch public items ── */
  const loadPublic = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await apiFetch("/lost-found", { method: "GET" });
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ── Fetch my items ── */
  const loadMine = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await apiFetch("/lost-found/mine", { method: "GET" });
      setMyItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "mine") {
      loadMine();
    } else {
      loadPublic();
    }
  }, [activeTab, loadPublic, loadMine]);

  /* ── Filtered + paginated items ── */
  const filtered = useMemo(() => {
    let result = activeTab === "mine" ? myItems : items.filter((i) => i.type === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.title.toLowerCase().includes(q));
    }
    return result;
  }, [items, myItems, activeTab, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  /* ── Actions ── */
  const handleResolve = async (id) => {
    if (!window.confirm("Mark this item as resolved?")) return;
    setActionId(id);
    setActionType("resolve");
    try {
      await apiFetch(`/lost-found/${id}/resolve`, { method: "PATCH" });
      setMyItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, status: "resolved" } : i))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setActionId(null);
      setActionType(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    setActionId(id);
    setActionType("delete");
    try {
      await apiFetch(`/lost-found/${id}`, { method: "DELETE" });
      setMyItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionId(null);
      setActionType(null);
    }
  };

  const handleItemCreated = () => {
    loadMine();
  };

  /* ── Icon ── */
  const searchIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  return (
    <AppLayout
      activePage="lostfound"
      user={user}
      title="Lost & Found"
      subtitle={
        isLoading
          ? "Loading..."
          : activeTab === "mine"
          ? `${filtered.length} ${filtered.length === 1 ? "post" : "posts"}`
          : `${filtered.length} ${filtered.length === 1 ? "item" : "items"}`
      }
      icon={searchIcon}
    >
      {/* ── Tab bar ── */}
      <div className="mb-5 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              activeTab === tab.key
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Report form (only on My Posts tab) ── */}
      {activeTab === "mine" && <ReportForm onCreated={handleItemCreated} />}

      {/* ── Search input (Lost / Found tabs) ── */}
      {activeTab !== "mine" && (
        <div className="mb-4">
          <div className="relative max-w-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search items by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
            />
          </div>
        </div>
      )}

      {/* ── Search input (My Posts tab) ── */}
      {activeTab === "mine" && (
        <div className="mb-4">
          <div className="relative max-w-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search your posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
            />
          </div>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* ── Empty ── */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-20 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-sm font-bold text-slate-600">
            {search
              ? "No items match your search."
              : activeTab === "mine"
              ? "You haven't posted anything yet."
              : `No ${activeTab} items at the moment.`}
          </p>
          {activeTab === "mine" && !search && (
            <p className="mt-1 text-xs text-slate-400">
              Use the form above to report a lost or found item.
            </p>
          )}
        </div>
      )}

      {/* ── Items grid ── */}
      {!isLoading && !error && paginated.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeTab === "mine"
              ? paginated.map((item) => (
                  <MyPostCard
                    key={item._id}
                    item={item}
                    onResolve={handleResolve}
                    onDelete={handleDelete}
                    isResolving={actionId === item._id && actionType === "resolve"}
                    isDeleting={actionId === item._id && actionType === "delete"}
                  />
                ))
              : paginated.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </AppLayout>
  );
};

export default LostFoundPage;
