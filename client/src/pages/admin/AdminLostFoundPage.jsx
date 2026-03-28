import { useEffect, useMemo, useState } from "react";
import Pagination from "../../components/ui/Pagination";
import { API_BASE, apiFetch } from "../../lib/api";
import { MotionPage } from "../../lib/motion";

// Number of lost-and-found items shown per page in the admin list
const ITEMS_PER_PAGE = 10;

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected", "Resolved"];

const statusBadge = (status) => {
  const map = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
    resolved: "bg-sky-100 text-sky-700",
  };
  return map[status] || "bg-slate-100 text-slate-600";
};

const typeBadge = (type) => {
  const map = {
    lost: "bg-rose-100 text-rose-700",
    found: "bg-blue-100 text-blue-700",
  };
  return map[type?.toLowerCase()] || "bg-slate-100 text-slate-600";
};

const AdminLostFoundPage = () => {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const loadItems = async () => {
    const data = await apiFetch("/lost-found/all", { method: "GET" });
    setItems(data.items || data.lostFound || data || []);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoading(true);
        setError("");
        await loadItems();
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, []);

  // Filter items by active tab
  const filtered = useMemo(() => {
    if (activeTab === "All") return items;
    return items.filter(
      (item) => item.status?.toLowerCase() === activeTab.toLowerCase()
    );
  }, [items, activeTab]);

  // Calculate total pages and slice for the current page
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // Reset to page 1 when switching tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApprove = async (id) => {
    await apiFetch(`/lost-found/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ status: "approved" }),
    });
    setItems((prev) =>
      prev.map((item) =>
        item._id === id || item.id === id
          ? { ...item, status: "approved" }
          : item
      )
    );
  };

  const handleReject = async (id) => {
    await apiFetch(`/lost-found/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ status: "rejected" }),
    });
    setItems((prev) =>
      prev.map((item) =>
        item._id === id || item.id === id
          ? { ...item, status: "rejected" }
          : item
      )
    );
  };

  const handleDelete = async (id) => {
    await apiFetch(`/lost-found/${id}`, { method: "DELETE" });
    setItems((prev) =>
      prev.filter((item) => item._id !== id && item.id !== id)
    );
  };

  /** Resolve an image URL */
  const imageUrl = (item) => {
    if (!item.imageUrl) return null;
    return item.imageUrl;
  };

  return (
    <MotionPage className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Lost & Found Management
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Review, approve, or reject user-submitted lost and found items.
        </p>
      </section>

      {/* Filter Tabs + List */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-sky-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="mt-3 text-sm font-semibold text-slate-500">
            Loading items...
          </p>
        )}
        {!isLoading && error && (
          <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <p className="mt-3 text-sm text-slate-600">No items found.</p>
        )}

        {/* Paginated item cards */}
        {!isLoading && !error && filtered.length > 0 && (
          <>
            <div className="mt-4 space-y-3">
              {paginated.map((item) => {
                const id = item._id || item.id;
                const thumb = imageUrl(item);
                return (
                  <article
                    key={id}
                    className="flex flex-wrap items-start gap-4 rounded-xl border border-slate-200 p-4"
                  >
                    {/* Thumbnail */}
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={item.title}
                        className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-400">
                        No image
                      </div>
                    )}

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {/* Type badge (Lost / Found) */}
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${typeBadge(
                            item.type
                          )}`}
                        >
                          {item.type || "Unknown"}
                        </span>
                        {/* Status badge */}
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadge(
                            item.status
                          )}`}
                        >
                          {item.status || "pending"}
                        </span>
                      </div>
                      {item.location && (
                        <p className="mt-1.5 text-xs text-slate-600">
                          <span className="font-semibold text-slate-500">
                            Location:
                          </span>{" "}
                          {item.location}
                        </p>
                      )}
                      <p className="mt-1.5 text-xs font-semibold text-slate-500">
                        {item.user?.name || item.posterName || "Unknown"} ·{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-shrink-0 items-center gap-2">
                      {item.status !== "approved" && (
                        <button
                          type="button"
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                          onClick={() => handleApprove(id)}
                        >
                          Approve
                        </button>
                      )}
                      {item.status !== "rejected" && (
                        <button
                          type="button"
                          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                          onClick={() => handleReject(id)}
                        >
                          Reject
                        </button>
                      )}
                      <button
                        type="button"
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50"
                        onClick={() => handleDelete(id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            {/* Pagination controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>
    </MotionPage>
  );
};

export default AdminLostFoundPage;
