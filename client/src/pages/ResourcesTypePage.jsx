import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ResourceViewerModal from "../components/resources/ResourceViewerModal";
import Pagination from "../components/ui/Pagination";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";

const ITEMS_PER_PAGE = 9;

/* ─────────────────────────────────────────
   Resource type config
───────────────────────────────────────── */

const TYPES = [
  {
    key: "all",
    label: "All Resources",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    key: "notes",
    label: "Notes",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    key: "past-papers",
    label: "Past Papers",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    key: "timetable",
    label: "Timetable",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const typeBadge = {
  notes: "bg-sky-100 text-sky-700",
  "past-papers": "bg-violet-100 text-violet-700",
  timetable: "bg-emerald-100 text-emerald-700",
};

const typeLabel = { notes: "Notes", "past-papers": "Past Papers", timetable: "Timetable" };

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */

const ResourcesPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState(null);
  const [searchQuery, setSearchQueryState] = useState(searchParams.get("q") || "");

  const [currentPage, setCurrentPage] = useState(1);

  const activeType = searchParams.get("type") || "all";

  const setActiveType = (type) => {
    const params = new URLSearchParams(searchParams);
    if (type === "all") params.delete("type");
    else params.set("type", type);
    setSearchParams(params, { replace: true });
    setCurrentPage(1);
  };

  const setSearchQuery = (q) => {
    setSearchQueryState(q);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    if (!q) params.delete("q");
    else params.set("q", q);
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await apiFetch("/resources", { method: "GET" });
        setResources(data.resources || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = resources;
    if (activeType !== "all") list = list.filter((r) => r.type === activeType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          (r.uploadedBy && r.uploadedBy.toLowerCase().includes(q))
      );
    }
    return list;
  }, [resources, activeType, searchQuery]);

  const counts = useMemo(() => {
    const c = { all: resources.length };
    TYPES.slice(1).forEach((t) => { c[t.key] = resources.filter((r) => r.type === t.key).length; });
    return c;
  }, [resources]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeTypeObj = TYPES.find((t) => t.key === activeType) || TYPES[0];

  /* Sidebar filter buttons passed to AppLayout */
  const sidebarExtra = (
    <div className="space-y-0.5">
      {TYPES.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => setActiveType(t.key)}
          className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors ${
            activeType === t.key
              ? "bg-sky-50 text-sky-700"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          {t.icon}
          <span className="flex-1 text-left">{t.label}</span>
          {counts[t.key] > 0 && (
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
              activeType === t.key ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500"
            }`}>
              {counts[t.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  /* Top bar right: segmented filter + search */
  const topBarContent = (
    <div className="flex items-center gap-3">
      <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 p-1 no-scrollbar">
        {TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveType(t.key)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeType === t.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="relative w-48">
        <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-sm outline-none ring-sky-200 transition-shadow placeholder:text-slate-400 focus:border-sky-300 focus:ring-2"
        />
        {searchQuery && (
          <button type="button" onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <AppLayout
      activePage="resources"
      user={user}
      title={activeTypeObj.label}
      subtitle={isLoading ? "Loading..." : `${filtered.length} ${filtered.length === 1 ? "resource" : "resources"}${searchQuery ? ` matching "${searchQuery}"` : ""}`}
      icon={activeTypeObj.icon}
      topBarRight={topBarContent}
      sidebarExtra={sidebarExtra}
    >
      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="h-3 w-20 rounded-full bg-slate-200" />
              <div className="h-5 w-3/4 rounded-lg bg-slate-200" />
              <div className="h-3 w-full rounded-lg bg-slate-200" />
              <div className="h-3 w-5/6 rounded-lg bg-slate-200" />
              <div className="flex gap-2 pt-1">
                <div className="h-8 flex-1 rounded-xl bg-slate-200" />
                <div className="h-8 w-20 rounded-xl bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">{error}</div>
      )}

      {/* Empty */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 rounded-2xl bg-slate-50 p-5 text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-600">No resources found</p>
          <p className="mt-1 text-xs text-slate-400">
            {searchQuery ? `No results for "${searchQuery}"` : "Nothing uploaded in this category yet."}
          </p>
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")} className="mt-4 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700">
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Resource grid */}
      {!isLoading && !error && paginated.length > 0 && (
        <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paginated.map((resource) => (
            <article key={resource.id} className="card-hover flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className={`w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${typeBadge[resource.type] || "bg-slate-100 text-slate-600"}`}>
                {typeLabel[resource.type] || resource.type}
              </span>
              <h3 className="mt-3 text-sm font-bold leading-snug text-slate-900 line-clamp-2">{resource.title}</h3>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-500 line-clamp-3">
                {resource.description || "No description provided."}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-black text-slate-500">
                  {resource.uploadedBy?.charAt(0)?.toUpperCase()}
                </div>
                <span className="truncate font-semibold">{resource.uploadedBy}</span>
                <span className="mx-1 text-slate-300">·</span>
                <span className="shrink-0">{new Date(resource.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewing(resource)}
                  className="btn-press inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-sky-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </button>
                <a
                  href={resource.fileUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="btn-press inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
              </div>
            </article>
          ))}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}

      {viewing && <ResourceViewerModal resource={viewing} onClose={() => setViewing(null)} />}
    </AppLayout>
  );
};

export default ResourcesPage;
