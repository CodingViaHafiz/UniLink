import { useEffect, useMemo, useState } from "react";
import Pagination from "../../components/ui/Pagination";
import { API_BASE, apiFetch } from "../../lib/api";
import { MotionPage } from "../../lib/motion";

// Number of marketplace items shown per page in the admin list
const ITEMS_PER_PAGE = 10;

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected"];

const statusBadge = (status) => {
  const map = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
  };
  return map[status] || "bg-slate-100 text-slate-600";
};

const AdminMarketplacePage = () => {
  const [listings, setListings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const loadListings = async () => {
    const data = await apiFetch("/marketplace/all", { method: "GET" });
    setListings(data.listings || data.items || data || []);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoading(true);
        setError("");
        await loadListings();
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
    if (activeTab === "All") return listings;
    return listings.filter(
      (item) => item.status?.toLowerCase() === activeTab.toLowerCase()
    );
  }, [listings, activeTab]);

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
    await apiFetch(`/marketplace/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ status: "approved" }),
    });
    setListings((prev) =>
      prev.map((item) =>
        item._id === id || item.id === id
          ? { ...item, status: "approved" }
          : item
      )
    );
  };

  const handleReject = async (id) => {
    await apiFetch(`/marketplace/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ status: "rejected" }),
    });
    setListings((prev) =>
      prev.map((item) =>
        item._id === id || item.id === id
          ? { ...item, status: "rejected" }
          : item
      )
    );
  };

  const handleDelete = async (id) => {
    await apiFetch(`/marketplace/${id}`, { method: "DELETE" });
    setListings((prev) =>
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
          Marketplace Management
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Review, approve, or reject user-submitted marketplace listings.
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
            Loading listings...
          </p>
        )}
        {!isLoading && error && (
          <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <p className="mt-3 text-sm text-slate-600">No listings found.</p>
        )}

        {/* Paginated listing cards */}
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
                      <p className="mt-0.5 text-sm font-semibold text-sky-700">
                        {item.price != null
                          ? `Rs. ${item.price}`
                          : "Price not set"}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {item.category && (
                          <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                            {item.category}
                          </span>
                        )}
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadge(
                            item.status
                          )}`}
                        >
                          {item.status || "pending"}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        {item.seller?.name || item.sellerName || "Unknown seller"}{" "}
                        · {new Date(item.createdAt).toLocaleDateString()}
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

export default AdminMarketplacePage;
