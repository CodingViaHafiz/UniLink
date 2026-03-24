import { useEffect, useMemo, useState } from "react";
import ResourceUpload from "../../components/resources/ResourceUpload";
import Pagination from "../../components/ui/Pagination";
import { apiFetch } from "../../lib/api";
import { MotionPage } from "../../lib/motion";

// Number of resource rows shown per page in the admin table
const ITEMS_PER_PAGE = 10;

const AdminResourcesPage = () => {
  const [resources, setResources] = useState([]);
  // Track which page the admin is currently viewing
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResources = async () => {
    const data = await apiFetch("/resources", { method: "GET" });
    setResources(data.resources || []);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoading(true);
        setError("");
        await loadResources();
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, []);

  const handleDelete = async (id) => {
    await apiFetch(`/resources/${id}`, { method: "DELETE" });
    setResources((previous) => previous.filter((resource) => resource.id !== id));
  };

  // Calculate total pages and slice resources for the current page
  const totalPages = Math.ceil(resources.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return resources.slice(start, start + ITEMS_PER_PAGE);
  }, [resources, currentPage]);

  // Scroll to top when changing pages for better UX
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MotionPage className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Resource Management</h1>
        <p className="mt-2 text-sm text-slate-600">Upload and manage all academic resources in one place.</p>
        <div className="mt-4">
          <ResourceUpload onSuccess={(resource) => setResources((prev) => [resource, ...prev])} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">All Resources</h2>

        {isLoading && <p className="mt-3 text-sm font-semibold text-slate-500">Loading resources...</p>}
        {!isLoading && error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}

        {!isLoading && !error && resources.length === 0 && (
          <p className="mt-3 text-sm text-slate-600">No resources uploaded yet.</p>
        )}

        {/* Paginated resource table */}
        {!isLoading && !error && resources.length > 0 && (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-180 border-collapse">
                <thead>
                  <tr>
                    {["Title", "Type", "Uploaded By", "Date", "Action"].map((header) => (
                      <th
                        key={header}
                        className="border-b border-slate-200 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((resource) => (
                    <tr key={resource.id} className="border-b border-slate-100 text-sm text-slate-700">
                      <td className="px-3 py-3 font-semibold text-slate-900">{resource.title}</td>
                      <td className="px-3 py-3 capitalize">{resource.type}</td>
                      <td className="px-3 py-3">{resource.uploadedBy}</td>
                      <td className="px-3 py-3">{new Date(resource.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700"
                          onClick={() => handleDelete(resource.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination controls — only shown when there are multiple pages */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </section>
    </MotionPage>
  );
};

export default AdminResourcesPage;
