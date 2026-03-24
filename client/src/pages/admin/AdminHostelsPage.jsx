import { useEffect, useMemo, useState } from "react";
import Pagination from "../../components/ui/Pagination";
import { API_BASE, apiFetch } from "../../lib/api";
import { MotionPage } from "../../lib/motion";

// Number of hostel items shown per page in the admin list
const ITEMS_PER_PAGE = 10;

const emptyForm = {
  name: "",
  location: "",
  price: "",
  contact: "",
  description: "",
  mapUrl: "",
};

const AdminHostelsPage = () => {
  const [hostels, setHostels] = useState([]);
  // Track which page the admin is currently viewing
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHostels = async () => {
    const data = await apiFetch("/hostels", { method: "GET" });
    setHostels(data.hostels || []);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoading(true);
        setError("");
        await loadHostels();
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, []);

  const submitHostel = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (imageFile) payload.append("image", imageFile);

      const response = await fetch(`${API_BASE}/hostels${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        body: payload,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to save hostel.");
      }

      if (editingId) {
        setHostels((previous) => previous.map((hostel) => (hostel.id === data.hostel.id ? data.hostel : hostel)));
      } else {
        setHostels((previous) => [data.hostel, ...previous]);
      }

      setError("");
      setForm(emptyForm);
      setImageFile(null);
      setEditingId(null);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (hostel) => {
    setEditingId(hostel.id);
    setForm({
      name: hostel.name,
      location: hostel.location,
      price: hostel.price,
      contact: hostel.contact,
      description: hostel.description || "",
      mapUrl: hostel.mapUrl || "",
    });
  };

  const handleDelete = async (id) => {
    await apiFetch(`/hostels/${id}`, { method: "DELETE" });
    setHostels((previous) => previous.filter((hostel) => hostel.id !== id));
  };

  // Calculate total pages and slice hostels for the current page
  const totalPages = Math.ceil(hostels.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return hostels.slice(start, start + ITEMS_PER_PAGE);
  }, [hostels, currentPage]);

  // Scroll to top when changing pages for better UX
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MotionPage className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Hostel Listings</h1>
        <p className="mt-2 text-sm text-slate-600">Add or update verified hostels available to students.</p>

        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={submitHostel}>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Hostel name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Location"
            value={form.location}
            onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
            required
          />
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Rent (e.g. 22000 PKR)"
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            required
          />
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Contact"
            value={form.contact}
            onChange={(event) => setForm((prev) => ({ ...prev, contact: event.target.value }))}
            required
          />
          <input
            type="url"
            className="md:col-span-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Google Maps link (right-click location → Share → Copy link)"
            value={form.mapUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, mapUrl: event.target.value }))}
          />
          <textarea
            className="md:col-span-2 h-24 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Short description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <input
            type="file"
            className="md:col-span-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
          />

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : editingId ? "Update Hostel" : "Add Hostel"}
            </button>
            {editingId && (
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setImageFile(null);
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
        {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">All Hostels</h2>
        {isLoading && <p className="mt-3 text-sm font-semibold text-slate-500">Loading hostels...</p>}
        {!isLoading && !error && hostels.length === 0 && <p className="mt-3 text-sm text-slate-600">No hostels added yet.</p>}

        {/* Paginated hostel list */}
        {!isLoading && hostels.length > 0 && (
          <>
            <div className="mt-4 space-y-3">
              {paginated.map((hostel) => (
                <div key={hostel.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{hostel.name}</h3>
                      <p className="text-sm text-slate-600">{hostel.location}</p>
                      <p className="mt-2 text-sm font-semibold text-emerald-700">{hostel.price}</p>
                      <p className="text-sm text-slate-600">{hostel.contact}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700"
                        onClick={() => startEdit(hostel)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700"
                        onClick={() => handleDelete(hostel.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination controls — only shown when there are multiple pages */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </section>
    </MotionPage>
  );
};

export default AdminHostelsPage;

