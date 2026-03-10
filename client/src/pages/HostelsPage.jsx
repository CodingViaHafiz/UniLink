import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  useEffect(() => {
    const loadHostels = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await apiFetch("/hostels", { method: "GET" });
        setHostels(data.hostels || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadHostels();
  }, []);

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
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">Hostels</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Verified Hostel Listings</h1>
            <p className="mt-2 text-sm text-slate-600">Browse curated hostels added by the UniLink admin team.</p>
          </div>
          <Link
            to="/home"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600"
          >
            Back to Home
          </Link>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">Loading hostels...</div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">{error}</div>
        )}

        {!isLoading && !error && hostels.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">
            No hostels published yet.
          </div>
        )}

        {!isLoading && !error && hostels.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {hostels.map((hostel) => (
              <article key={hostel.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="h-44 w-full bg-slate-100">
                  {hostel.imageUrl ? (
                    <img src={hostel.imageUrl} alt={hostel.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-semibold text-slate-400">
                      No image available
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900">{hostel.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{hostel.location}</p>
                  <p className="mt-3 text-sm font-semibold text-emerald-700">Rent: {hostel.price}</p>
                  <p className="mt-1 text-sm text-slate-600">Contact: {hostel.contact}</p>
                  {hostel.description && <p className="mt-3 text-sm text-slate-600">{hostel.description}</p>}
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
