import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeNavbar from "../components/home/HomeNavbar";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";
import { MotionPage } from "../lib/motion";

const HostelsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">Accommodation</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Hostel Listings</h1>
          <p className="mt-2 max-w-lg text-sm text-slate-500">
            Browse verified hostels curated by the UniLink admin team.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              placeholder="Search by name, location, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-emerald-200 transition-shadow placeholder:text-slate-400 focus:ring-2"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          {!isLoading && !error && (
            <p className="text-xs font-semibold text-slate-400">
              {filtered.length} {filtered.length === 1 ? "hostel" : "hostels"} found
              {search && ` matching "${search}"`}
            </p>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <p className="text-sm font-semibold text-slate-500">No hostels found.</p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-3 text-xs font-bold text-emerald-600 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Hostel Grid */}
        {!isLoading && !error && filtered.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((hostel) => (
              <article
                key={hostel.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  )}
                  {/* Price badge */}
                  <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    {hostel.price}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-bold text-slate-900">{hostel.name}</h3>

                  {/* Location */}
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{hostel.location}</span>
                  </div>

                  {/* Contact */}
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{hostel.contact}</span>
                  </div>

                  {/* Description */}
                  {hostel.description && (
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500 line-clamp-3">
                      {hostel.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    {hostel.mapUrl && (
                      <a
                        href={hostel.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        View on Map
                      </a>
                    )}
                    {hostel.contact && (
                      <a
                        href={`tel:${hostel.contact}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
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
        )}
      </section>
    </MotionPage>
  );
};

export default HostelsPage;
