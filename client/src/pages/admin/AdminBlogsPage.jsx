import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { MotionPage } from "../../lib/motion";

const AdminBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", content: "" });
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

  const handlePublish = async (event) => {
    event.preventDefault();
    setIsPublishing(true);
    setFeedback({ type: "", text: "" });

    try {
      const data = await apiFetch("/blogs", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setBlogs((previous) => [data.blog, ...previous]);
      setForm({ title: "", content: "" });
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
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Blog title"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
          <textarea
            className="h-32 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Write the announcement"
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            minLength={20}
            required
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

        {!isLoading && !error && blogs.length > 0 && (
          <div className="mt-4 space-y-3">
            {blogs.map((blog) => (
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
        )}
      </section>
    </MotionPage>
  );
};

export default AdminBlogsPage;






