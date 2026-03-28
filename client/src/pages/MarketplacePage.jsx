import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import Pagination from "../components/ui/Pagination";
import { useAuth } from "../hooks/useAuth";
import { apiFetch, API_BASE } from "../lib/api";

const ITEMS_PER_PAGE = 9;

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "textbooks", label: "Textbooks" },
  { key: "electronics", label: "Electronics" },
  { key: "notes", label: "Notes" },
  { key: "other", label: "Other" },
];

const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c.key !== "all");

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

/* ─────────────────────────────────────────
   MarketplacePage
───────────────────────────────────────── */

const MarketplacePage = () => {
  const { user } = useAuth();

  /* ── Tabs ── */
  const [activeTab, setActiveTab] = useState("browse");

  /* ── Browse state ── */
  const [listings, setListings] = useState([]);
  const [browseLoading, setBrowseLoading] = useState(true);
  const [browseError, setBrowseError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [browsePage, setBrowsePage] = useState(1);
  const [contactVisible, setContactVisible] = useState({});

  /* ── My Listings state ── */
  const [myListings, setMyListings] = useState([]);
  const [myLoading, setMyLoading] = useState(false);
  const [myError, setMyError] = useState("");
  const [myPage, setMyPage] = useState(1);

  /* ── Create form state ── */
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "textbooks",
    whatsapp: "",
  });
  const [formImage, setFormImage] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  /* ─────────────────────────────────────────
     Data fetching
  ───────────────────────────────────────── */

  const loadBrowse = async () => {
    try {
      setBrowseLoading(true);
      setBrowseError("");
      const data = await apiFetch("/marketplace", { method: "GET" });
      setListings(data.listings || []);
    } catch (err) {
      setBrowseError(err.message);
    } finally {
      setBrowseLoading(false);
    }
  };

  const loadMine = async () => {
    try {
      setMyLoading(true);
      setMyError("");
      const data = await apiFetch("/marketplace/mine", { method: "GET" });
      setMyListings(data.listings || []);
    } catch (err) {
      setMyError(err.message);
    } finally {
      setMyLoading(false);
    }
  };

  useEffect(() => {
    loadBrowse();
  }, []);

  useEffect(() => {
    if (activeTab === "mine") loadMine();
  }, [activeTab]);

  /* ─────────────────────────────────────────
     Browse filtering + pagination
  ───────────────────────────────────────── */

  const filtered = useMemo(() => {
    let result = listings;
    if (activeCategory !== "all") {
      result = result.filter((l) => l.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title?.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [listings, activeCategory, search]);

  const browseTotalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const browsePaginated = useMemo(() => {
    const start = (browsePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, browsePage]);

  useEffect(() => {
    setBrowsePage(1);
  }, [activeCategory, search]);

  /* ── My Listings pagination ── */
  const myTotalPages = Math.ceil(myListings.length / ITEMS_PER_PAGE);
  const myPaginated = useMemo(() => {
    const start = (myPage - 1) * ITEMS_PER_PAGE;
    return myListings.slice(start, start + ITEMS_PER_PAGE);
  }, [myListings, myPage]);

  /* ─────────────────────────────────────────
     Handlers
  ───────────────────────────────────────── */

  const handleBrowsePageChange = (page) => {
    setBrowsePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMyPageChange = (page) => {
    setMyPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleContact = (id) => {
    setContactVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await apiFetch(`/marketplace/${id}`, { method: "DELETE" });
      setMyListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formData.title.trim() || !formData.price || !formData.whatsapp.trim()) {
      setFormError("Title, price, and WhatsApp contact are required.");
      return;
    }

    try {
      setFormSubmitting(true);
      const body = new FormData();
      body.append("title", formData.title.trim());
      body.append("description", formData.description.trim());
      body.append("price", formData.price);
      body.append("category", formData.category);
      body.append("contact", formData.whatsapp.trim());
      if (formImage) body.append("image", formImage);

      await fetch(`${API_BASE}/marketplace`, {
        method: "POST",
        credentials: "include",
        body,
      }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to create listing.");
        return data;
      });

      setFormSuccess("Listing submitted! It will appear after admin approval.");
      setFormData({ title: "", description: "", price: "", category: "textbooks", whatsapp: "" });
      setFormImage(null);
      loadMine();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  /* ─────────────────────────────────────────
     Helpers
  ───────────────────────────────────────── */

  const SERVER_BASE = API_BASE.replace("/api", "");

  const getImageSrc = (listing) => {
    if (listing.imageUrl) return listing.imageUrl;
    return null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getCategoryLabel = (key) =>
    CATEGORIES.find((c) => c.key === key)?.label || key;

  /* ─────────────────────────────────────────
     Icon
  ───────────────────────────────────────── */

  const marketplaceIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  );

  /* ─────────────────────────────────────────
     Render: Listing Card (Browse)
  ───────────────────────────────────────── */

  const renderBrowseCard = (listing) => {
    const imgSrc = getImageSrc(listing);
    return (
      <div
        key={listing._id}
        className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
      >
        {/* Image */}
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={listing.title}
            className="aspect-[16/10] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-sky-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
        )}

        {/* Body */}
        <div className="flex flex-1 flex-col p-4">
          {/* Category badge + price */}
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700">
              {getCategoryLabel(listing.category)}
            </span>
            <span className="text-base font-black text-slate-900">
              {"\u20B9"}{Number(listing.price).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Title */}
          <h3 className="mb-1 line-clamp-2 text-sm font-bold text-slate-800">
            {listing.title}
          </h3>

          {/* Description */}
          {listing.description && (
            <p className="mb-3 line-clamp-2 text-xs text-slate-500">
              {listing.description}
            </p>
          )}

          {/* Spacer */}
          <div className="mt-auto" />

          {/* Seller + date */}
          <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-600">
              {listing.seller?.fullName || listing.sellerName || "Seller"}
            </span>
            <span>{formatDate(listing.createdAt)}</span>
          </div>

          {/* Contact button */}
          <button
            type="button"
            onClick={() => toggleContact(listing._id)}
            className="mt-1 w-full rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
          >
            {contactVisible[listing._id] ? (
              <span className="flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                </svg>
                {listing.whatsapp}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact Seller
              </span>
            )}
          </button>
        </div>
      </div>
    );
  };

  /* ─────────────────────────────────────────
     Render: My Listing Card
  ───────────────────────────────────────── */

  const renderMyCard = (listing) => {
    const imgSrc = getImageSrc(listing);
    const status = listing.status || "pending";
    return (
      <div
        key={listing._id}
        className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
      >
        {/* Image */}
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={listing.title}
            className="aspect-[16/10] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
        )}

        {/* Body */}
        <div className="flex flex-1 flex-col p-4">
          {/* Status + category */}
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[status]}`}
            >
              {status}
            </span>
            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700">
              {getCategoryLabel(listing.category)}
            </span>
          </div>

          {/* Title + price */}
          <h3 className="mb-1 line-clamp-2 text-sm font-bold text-slate-800">
            {listing.title}
          </h3>
          <p className="mb-3 text-base font-black text-slate-900">
            {"\u20B9"}{Number(listing.price).toLocaleString("en-IN")}
          </p>

          <div className="mt-auto" />

          {/* Date */}
          <p className="mb-2 text-[11px] text-slate-400">
            Posted {formatDate(listing.createdAt)}
          </p>

          {/* Delete */}
          <button
            type="button"
            onClick={() => handleDelete(listing._id)}
            className="w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100"
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Listing
            </span>
          </button>
        </div>
      </div>
    );
  };

  /* ─────────────────────────────────────────
     Skeleton loader
  ───────────────────────────────────────── */

  const renderSkeletons = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="aspect-[16/10] bg-slate-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 rounded-lg bg-slate-200" />
            <div className="h-3 w-full rounded-lg bg-slate-200" />
            <div className="h-3 w-1/2 rounded-lg bg-slate-200" />
            <div className="h-8 w-full rounded-xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );

  /* ─────────────────────────────────────────
     Empty state
  ───────────────────────────────────────── */

  const renderEmpty = (message) => (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-20 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mb-4 h-10 w-10 text-slate-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      <p className="text-sm font-bold text-slate-600">{message}</p>
    </div>
  );

  /* ─────────────────────────────────────────
     Main render
  ───────────────────────────────────────── */

  return (
    <AppLayout
      activePage="marketplace"
      user={user}
      title="Student Marketplace"
      subtitle={
        activeTab === "browse"
          ? browseLoading
            ? "Loading..."
            : `${filtered.length} ${filtered.length === 1 ? "listing" : "listings"}`
          : `${myListings.length} ${myListings.length === 1 ? "listing" : "listings"}`
      }
      icon={marketplaceIcon}
    >
      {/* ── Tab switcher ── */}
      <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1">
        {[
          { key: "browse", label: "Browse" },
          { key: "mine", label: "My Listings" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
         BROWSE TAB
      ══════════════════════════════════════ */}
      {activeTab === "browse" && (
        <>
          {/* Search */}
          <div className="mb-4">
            <div className="relative max-w-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search listings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
              />
            </div>
          </div>

          {/* Category filter pills */}
          <div className="mb-6 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${activeCategory === cat.key
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {browseLoading && renderSkeletons()}

          {/* Error */}
          {!browseLoading && browseError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
              {browseError}
            </div>
          )}

          {/* Empty */}
          {!browseLoading &&
            !browseError &&
            filtered.length === 0 &&
            renderEmpty(
              search || activeCategory !== "all"
                ? "No listings match your filters."
                : "No listings available yet."
            )}

          {/* Grid */}
          {!browseLoading && !browseError && browsePaginated.length > 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {browsePaginated.map(renderBrowseCard)}
              </div>
              <Pagination
                currentPage={browsePage}
                totalPages={browseTotalPages}
                onPageChange={handleBrowsePageChange}
              />
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════
         MY LISTINGS TAB
      ══════════════════════════════════════ */}
      {activeTab === "mine" && (
        <>
          {/* ── Create Listing (collapsible) ── */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => {
                setFormOpen((o) => !o);
                setFormError("");
                setFormSuccess("");
              }}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-sky-100 p-1.5 text-sky-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-slate-800">
                  Create New Listing
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 text-slate-400 transition-transform ${formOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {formOpen && (
              <form onSubmit={handleCreate} className="border-t border-slate-100 px-5 py-5">
                <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  Listings are reviewed by admin before being published.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Title */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      placeholder="e.g. Engineering Mathematics Textbook"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={3}
                      placeholder="Describe the item, condition, etc."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      Price ({"\u20B9"}) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      min="0"
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      WhatsApp Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleFormChange}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
                    />
                  </div>

                  {/* Image */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormImage(e.target.files[0] || null)}
                      className="w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-sky-700 hover:file:bg-sky-100"
                    />
                  </div>
                </div>

                {/* Feedback */}
                {formError && (
                  <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                    {formSuccess}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="mt-4 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
                >
                  {formSubmitting ? "Submitting..." : "Submit Listing"}
                </button>
              </form>
            )}
          </div>

          {/* ── My listings grid ── */}
          {myLoading && renderSkeletons()}

          {!myLoading && myError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
              {myError}
            </div>
          )}

          {!myLoading &&
            !myError &&
            myListings.length === 0 &&
            renderEmpty("You haven't created any listings yet.")}

          {!myLoading && !myError && myPaginated.length > 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myPaginated.map(renderMyCard)}
              </div>
              <Pagination
                currentPage={myPage}
                totalPages={myTotalPages}
                onPageChange={handleMyPageChange}
              />
            </>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default MarketplacePage;
