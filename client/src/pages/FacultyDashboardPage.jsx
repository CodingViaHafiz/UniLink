import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ResourceUpload from "../components/resources/ResourceUpload";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";
import { MotionPage } from "../lib/motion";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "upload", label: "Upload Resource" },
  { id: "resources", label: "My Resources" },
  { id: "blogs", label: "My Blogs" },
];

const FacultyDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [resources, setResources] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [resourceEditing, setResourceEditing] = useState(null);
  const [blogEditing, setBlogEditing] = useState(null);
  const [blogForm, setBlogForm] = useState({ title: "", content: "" });
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const totals = useMemo(
    () => ({
      totalResources: resources.length,
      totalBlogs: blogs.length,
    }),
    [blogs.length, resources.length]
  );

  const loadResources = async () => {
    const data = await apiFetch("/resources/mine", { method: "GET" });
    setResources(data.resources || []);
  };

  const loadBlogs = async () => {
    const data = await apiFetch("/blogs/mine", { method: "GET" });
    setBlogs(data.blogs || []);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoading(true);
        setError("");
        await Promise.all([loadResources(), loadBlogs()]);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, []);

  const handleBlogSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ type: "", text: "" });
    setIsPublishing(true);

    try {
      const data = await apiFetch("/blogs", {
        method: "POST",
        body: JSON.stringify(blogForm),
      });
      setBlogs((previous) => [data.blog, ...previous]);
      setBlogForm({ title: "", content: "" });
      setFeedback({ type: "success", text: "Blog published successfully." });
    } catch (submitError) {
      setFeedback({ type: "error", text: submitError.message });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleResourceDelete = async (id) => {
    await apiFetch(`/resources/${id}`, { method: "DELETE" });
    setResources((previous) => previous.filter((resource) => resource.id !== id));
  };

  const handleBlogDelete = async (id) => {
    await apiFetch(`/blogs/${id}`, { method: "DELETE" });
    setBlogs((previous) => previous.filter((blog) => blog.id !== id));
  };

  const saveResourceEdit = async () => {
    const data = await apiFetch(`/resources/${resourceEditing.id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: resourceEditing.title,
        description: resourceEditing.description,
        type: resourceEditing.type,
      }),
    });
    setResources((previous) => previous.map((resource) => (resource.id === data.resource.id ? data.resource : resource)));
    setResourceEditing(null);
  };

  const saveBlogEdit = async () => {
    const data = await apiFetch(`/blogs/${blogEditing.id}`, {
      method: "PUT",
      body: JSON.stringify({ title: blogEditing.title, content: blogEditing.content }),
    });
    setBlogs((previous) => previous.map((blog) => (blog.id === data.blog.id ? data.blog : blog)));
    setBlogEditing(null);
  };

  return (
    <MotionPage className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row">
        <aside className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:w-64">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Faculty Panel</p>
            <h1 className="text-lg font-black text-slate-900">Welcome {user?.fullName || "Faculty"}</h1>
          </div>
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={[
                  "w-full rounded-xl px-3 py-2 text-left text-sm font-semibold",
                  activeTab === tab.id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50",
                ].join(" ")}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link
            to="/home"
            className="mt-5 inline-flex w-full justify-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
          >
            Back to Home
          </Link>
        </aside>

        <main className="flex-1 space-y-6">
          {isLoading && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">
              Loading dashboard...
            </section>
          )}

          {!isLoading && error && (
            <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">{error}</section>
          )}

          {!isLoading && !error && activeTab === "dashboard" && (
            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Resources</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">{totals.totalResources}</h2>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Blogs</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">{totals.totalBlogs}</h2>
              </div>
            </section>
          )}

          {!isLoading && !error && activeTab === "upload" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">Upload Academic Resource</h2>
              <p className="mt-2 text-sm text-slate-600">Share verified notes, past papers, or timetables with students.</p>
              <div className="mt-4">
                <ResourceUpload onSuccess={(resource) => setResources((prev) => [resource, ...prev])} />
              </div>
            </section>
          )}

          {!isLoading && !error && activeTab === "resources" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">My Resources</h2>
              {resources.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">You have not uploaded any resources yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {resources.map((resource) => (
                    <div key={resource.id} className="rounded-xl border border-slate-200 p-4">
                      {resourceEditing?.id === resource.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            value={resourceEditing.title}
                            onChange={(event) =>
                              setResourceEditing((prev) => ({ ...prev, title: event.target.value }))
                            }
                          />
                          <textarea
                            className="h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            value={resourceEditing.description}
                            onChange={(event) =>
                              setResourceEditing((prev) => ({ ...prev, description: event.target.value }))
                            }
                          />
                          <select
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            value={resourceEditing.type}
                            onChange={(event) => setResourceEditing((prev) => ({ ...prev, type: event.target.value }))}
                          >
                            <option value="notes">Notes</option>
                            <option value="past-papers">Past Papers</option>
                            <option value="timetable">Timetable</option>
                          </select>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white"
                              onClick={saveResourceEdit}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                              onClick={() => setResourceEditing(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-base font-bold text-slate-900">{resource.title}</h3>
                            <p className="text-sm text-slate-600">{resource.description || "No description provided."}</p>
                            <p className="mt-2 text-xs font-semibold text-slate-500">
                              {resource.type} · {new Date(resource.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700"
                              onClick={() => setResourceEditing({ ...resource, description: resource.description || "" })}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700"
                              onClick={() => handleResourceDelete(resource.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {!isLoading && !error && activeTab === "blogs" && (
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900">Write a Blog</h2>
                <form className="mt-4 space-y-3" onSubmit={handleBlogSubmit}>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Blog title"
                    value={blogForm.title}
                    onChange={(event) => setBlogForm((prev) => ({ ...prev, title: event.target.value }))}
                    required
                  />
                  <textarea
                    className="h-32 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Share your blog content"
                    value={blogForm.content}
                    onChange={(event) => setBlogForm((prev) => ({ ...prev, content: event.target.value }))}
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
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"
                    disabled={isPublishing}
                  >
                    {isPublishing ? "Publishing..." : "Publish Blog"}
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900">My Blogs</h2>
                {blogs.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-600">You have not published any blogs yet.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {blogs.map((blog) => (
                      <div key={blog.id} className="rounded-xl border border-slate-200 p-4">
                        {blogEditing?.id === blog.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                              value={blogEditing.title}
                              onChange={(event) => setBlogEditing((prev) => ({ ...prev, title: event.target.value }))}
                            />
                            <textarea
                              className="h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                              value={blogEditing.content}
                              onChange={(event) => setBlogEditing((prev) => ({ ...prev, content: event.target.value }))}
                              minLength={20}
                            />
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white"
                                onClick={saveBlogEdit}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                                onClick={() => setBlogEditing(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <h3 className="text-base font-bold text-slate-900">{blog.title}</h3>
                              <p className="text-sm text-slate-600">{blog.content}</p>
                              <p className="mt-2 text-xs font-semibold text-slate-500">
                                {new Date(blog.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700"
                                onClick={() => setBlogEditing({ ...blog })}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700"
                                onClick={() => handleBlogDelete(blog.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </MotionPage>
  );
};

export default FacultyDashboardPage;




