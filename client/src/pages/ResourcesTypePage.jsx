import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import HomeNavbar from "../components/home/HomeNavbar";
import ResourceViewerModal from "../components/resources/ResourceViewerModal";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";
import { MotionPage } from "../lib/motion";

const TYPES = [
  { key: "all", label: "All" },
  { key: "notes", label: "Notes" },
  { key: "past-papers", label: "Past Papers" },
  { key: "timetable", label: "Timetable" },
];

const typeBadge = {
  notes: "bg-sky-100 text-sky-700",
  "past-papers": "bg-violet-100 text-violet-700",
  timetable: "bg-emerald-100 text-emerald-700",
};

const typeLabel = {
  notes: "Notes",
  "past-papers": "Past Papers",
  timetable: "Timetable",
};

const ResourcesPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState(null);

  // Filter state from URL params
  const activeType = searchParams.get("type") || "all";
  const searchQuery = searchParams.get("q") || "";

  const setActiveType = (type) => {
    const params = new URLSearchParams(searchParams);
    if (type === "all") params.delete("type");
    else params.set("type", type);
    setSearchParams(params, { replace: true });
  };

  const setSearchQuery = (q) => {
    const params = new URLSearchParams(searchParams);
    if (!q) params.delete("q");
    else params.set("q", q);
    setSearchParams(params, { replace: true });
  };

  // Fetch ALL resources once
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

  // Filter + search
  const filtered = useMemo(() => {
    let list = resources;
    if (activeType !== "all") {
      list = list.filter((r) => r.type === activeType);
    }
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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <MotionPage className="min-h-screen bg-slate-50">
      <HomeNavbar user={user} onLogout={handleLogout} isLoggingOut={isLoggingOut} />

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">Academic</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Resources</h1>
            <p className="mt-2 max-w-lg text-sm text-slate-500">
              Browse notes, past papers, and timetables shared by faculty and admins.
            </p>
          </div>
          {/* <Link
            to="/home"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Back to Home
          </Link> */}
        </div>

        {/* Search + Filter Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, description, or uploader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-sky-200 transition-shadow placeholder:text-slate-400 focus:ring-2"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* Type Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveType(t.key)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${activeType === t.key
                  ? "bg-sky-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!isLoading && !error && (
          <p className="mb-4 text-xs font-semibold text-slate-400">
            {filtered.length} {filtered.length === 1 ? "resource" : "resources"} found
            {activeType !== "all" && ` in ${typeLabel[activeType]}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-semibold text-slate-500">No resources found.</p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-3 text-xs font-bold text-sky-600 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Resource Grid */}
        {!isLoading && !error && filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((resource) => (
              <article
                key={resource.id}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Type badge */}
                <span
                  className={`w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${typeBadge[resource.type] || "bg-slate-100 text-slate-600"
                    }`}
                >
                  {typeLabel[resource.type] || resource.type}
                </span>

                <h3 className="mt-3 text-base font-bold leading-snug text-slate-900 line-clamp-2">
                  {resource.title}
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500 line-clamp-3">
                  {resource.description || "No description provided."}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-semibold">{resource.uploadedBy}</span>
                  <span className="mx-1">-</span>
                  <span>{new Date(resource.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setViewing(resource)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-sky-700"
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
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
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
        )}
      </section>

      {viewing && (
        <ResourceViewerModal resource={viewing} onClose={() => setViewing(null)} />
      )}
    </MotionPage>
  );
};

export default ResourcesPage;
