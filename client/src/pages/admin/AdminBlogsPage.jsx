import { useEffect, useMemo, useState } from "react";
import Pagination from "../../components/ui/Pagination";
import { API_BASE, apiFetch } from "../../lib/api";
import { MotionPage } from "../../lib/motion";

// Number of blog items shown per page in the admin list
const ITEMS_PER_PAGE = 10;

const AdminBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  // Track which page the admin is currently viewing
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", content: "", category: "general" });
  const [imageFile, setImageFile] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const loadBlogs = async () => {
    const data = await apiFetch("/blogs", { method: "GET" });
    setBlogs(data.blogs || []);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoading(true);
        setError("");
        await loadBlogs();
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, []);

  const handleDelete = async (id) => {
    await apiFetch(`/blogs/${id}`, { method: "DELETE" });
    setBlogs((previous) => previous.filter((blog) => blog.id !== id));
  };

  // Calculate total pages and slice blogs for the current page
  const totalPages = Math.ceil(blogs.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return blogs.slice(start, start + ITEMS_PER_PAGE);
  }, [blogs, currentPage]);

  // Scroll to top when changing pages for better UX
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePublish = async (event) => {
    event.preventDefault();
    setIsPublishing(true);
    setFeedback({ type: "", text: "" });

    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("content", form.content);
      payload.append("category", form.category);
      if (imageFile) payload.append("image", imageFile);

      const response = await fetch(`${API_BASE}/blogs`, {
        method: "POST",
        credentials: "include",
        body: payload,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Failed to publish blog.");

      setBlogs((previous) => [data.blog, ...previous]);
      setForm({ title: "", content: "", category: "general" });
      setImageFile(null);
      setFeedback({ type: "success", text: "Blog published successfully." });
    } catch (submitError) {
      setFeedback({ type: "error", text: submitError.message });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <MotionPage className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Blog Management</h1>
        <p className="mt-2 text-sm text-slate-600">Publish updates or remove outdated posts.</p>
        <form className="mt-4 space-y-3" onSubmit={handlePublish}>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="Blog title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            >
              <option value="general">General</option>
              <option value="announcement">Announcement</option>
              <option value="academic">Academic</option>
              <option value="research">Research</option>
              <option value="campus">Campus Life</option>
            </select>
          </div>
          <textarea
            className="h-32 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Write the blog content"
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            minLength={20}
            required
          />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
          />
          {feedback.text && (
            <p
              className={[
                "rounded-lg px-3 py-2 text-sm font-semibold",
                feedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
              ].join(" ")}
            >
              {feedback.text}
            </p>
          )}
          <button
            type="submit"
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white"
            disabled={isPublishing}
          >
            {isPublishing ? "Publishing..." : "Publish Blog"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">All Blogs</h2>

        {isLoading && <p className="mt-3 text-sm font-semibold text-slate-500">Loading blogs...</p>}
        {!isLoading && error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}

        {!isLoading && !error && blogs.length === 0 && <p className="mt-3 text-sm text-slate-600">No blogs yet.</p>}

        {/* Paginated blog list */}
        {!isLoading && !error && blogs.length > 0 && (
          <>
            <div className="mt-4 space-y-3">
              {paginated.map((blog) => (
                <article key={blog.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{blog.role}</p>
                      <h3 className="text-base font-bold text-slate-900">{blog.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{blog.content}</p>
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        {blog.author} · {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700"
                      onClick={() => handleDelete(blog.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
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

export default AdminBlogsPage;






