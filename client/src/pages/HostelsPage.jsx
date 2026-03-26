import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import Pagination from "../components/ui/Pagination";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";

const ITEMS_PER_PAGE = 9;

const HostelsPage = () => {
  const { user } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await apiFetch("/hostels", { method: "GET" });
        setHostels(data.hostels || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return hostels;
    const q = search.toLowerCase();
    return hostels.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        (h.description && h.description.toLowerCase().includes(q))
    );
  }, [hostels, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset to page 1 when search changes
  useMemo(() => { setCurrentPage(1); }, [search]);

  const hostelIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
  );

  /* Search bar for top bar */
  const searchBar = (
    <div className="relative w-64">
      <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="Search hostels..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none ring-emerald-200 transition-shadow placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2"
      />
      {search && (
        <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );

  return (
    <AppLayout
      activePage="hostels"
      user={user}
      title="Hostel Listings"
      subtitle={isLoading ? "Loading..." : `${filtered.length} ${filtered.length === 1 ? "hostel" : "hostels"}${search ? ` matching "${search}"` : ""}`}
      icon={hostelIcon}
      topBarRight={searchBar}
    >
      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="h-44 w-full bg-slate-200" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-2/3 rounded-lg bg-slate-200" />
                <div className="h-3 w-1/2 rounded-lg bg-slate-200" />
                <div className="h-3 w-full rounded-lg bg-slate-200" />
                <div className="flex gap-2 pt-1">
                  <div className="h-8 flex-1 rounded-xl bg-slate-200" />
                  <div className="h-8 w-16 rounded-xl bg-slate-200" />
                </div>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-600">No hostels found</p>
          <p className="mt-1 text-xs text-slate-400">
            {search ? `No results for "${search}"` : "No hostels have been listed yet."}
          </p>
          {search && (
            <button type="button" onClick={() => setSearch("")} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700">
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Hostel grid */}
      {!isLoading && !error && paginated.length > 0 && (
        <>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((hostel) => (
            <article
              key={hostel.id}
              className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Image */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                {hostel.imageUrl ? (
                  <img
                    src={hostel.imageUrl}
                    alt={hostel.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                )}
                <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                  {hostel.price}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-bold text-slate-900">{hostel.name}</h3>

                <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{hostel.location}</span>
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{hostel.contact}</span>
                </div>

                {hostel.description && (
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500 line-clamp-3">
                    {hostel.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {hostel.mapUrl && /^https?:\/\//i.test(hostel.mapUrl) && (
                    <>
                      <a
                        href={hostel.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-press inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        View on Map
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hostel.location)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-press inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Directions
                      </a>
                    </>
                  )}
                  {hostel.contact && (
                    <a
                      href={`tel:${hostel.contact}`}
                      className="btn-press inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </AppLayout>
  );
};

export default HostelsPage;
