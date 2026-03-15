import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ResourceUpload from "../components/resources/ResourceUpload";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";
import { MotionPage } from "../lib/motion";

const tabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: "upload",
    label: "Upload Resource",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    id: "resources",
    label: "My Resources",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: "blogs",
    label: "My Blogs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
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

const FacultyDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    () => ({ totalResources: resources.length, totalBlogs: blogs.length }),
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
      setBlogs((prev) => [data.blog, ...prev]);
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
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const handleBlogDelete = async (id) => {
    await apiFetch(`/blogs/${id}`, { method: "DELETE" });
    setBlogs((prev) => prev.filter((b) => b.id !== id));
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
    setResources((prev) => prev.map((r) => (r.id === data.resource.id ? data.resource : r)));
    setResourceEditing(null);
  };

  const saveBlogEdit = async () => {
    const data = await apiFetch(`/blogs/${blogEditing.id}`, {
      method: "PUT",
      body: JSON.stringify({ title: blogEditing.title, content: blogEditing.content }),
    });
    setBlogs((prev) => prev.map((b) => (b.id === data.blog.id ? data.blog : b)));
    setBlogEditing(null);
  };

  const switchTab = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  return (
    <MotionPage className="min-h-screen bg-slate-50">
      {/* ── Mobile Top Bar ── */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Faculty</p>
          <p className="text-sm font-black text-slate-900">{tabs.find((t) => t.id === activeTab)?.label}</p>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen((p) => !p)}
          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700"
        >
          {sidebarOpen ? "Close" : "Menu"}
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:py-8 lg:flex-row lg:px-6">
        {/* ── Sidebar ── */}
        <aside
          className={`shrink-0 lg:block lg:w-60 ${sidebarOpen ? "block" : "hidden"}`}
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {/* Profile */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-blue-700">
                {user?.fullName?.charAt(0)?.toUpperCase() || "F"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{user?.fullName || "Faculty"}</p>
                <p className="truncate text-xs text-slate-400">{user?.email || ""}</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  onClick={() => switchTab(tab.id)}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <Link
                to="/home"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="min-w-0 flex-1 space-y-6">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-20">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* ── Dashboard Tab ── */}
          {!isLoading && !error && activeTab === "dashboard" && (
            <>
              <div className="hidden items-center justify-between lg:flex">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Faculty Panel</p>
                  <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                    Welcome, {user?.fullName?.split(" ")[0] || "Faculty"}
                  </h1>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="shrink-0 rounded-xl bg-sky-50 p-3 text-sky-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">{totals.totalResources}</p>
                    <p className="text-xs font-semibold text-slate-500">Resources Uploaded</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="shrink-0 rounded-xl bg-violet-50 p-3 text-violet-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">{totals.totalBlogs}</p>
                    <p className="text-xs font-semibold text-slate-500">Blogs Published</p>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-slate-900">Quick Actions</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("upload")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Resource
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("blogs")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Write Blog
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Upload Tab ── */}
          {!isLoading && !error && activeTab === "upload" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-black text-slate-900">Upload Academic Resource</h2>
              <p className="mt-1 text-sm text-slate-500">
                Share verified notes, past papers, or timetables with students.
              </p>
              <div className="mt-5">
                <ResourceUpload onSuccess={(resource) => setResources((prev) => [resource, ...prev])} />
              </div>
            </section>
          )}

          {/* ── Resources Tab ── */}
          {!isLoading && !error && activeTab === "resources" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">My Resources</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  {resources.length}
                </span>
              </div>

              {resources.length === 0 ? (
                <div className="mt-8 flex flex-col items-center py-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-sm font-semibold text-slate-500">No resources uploaded yet.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("upload")}
                    className="mt-3 text-xs font-bold text-blue-600 hover:underline"
                  >
                    Upload your first resource
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {resources.map((resource) => (
                    <div key={resource.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      {resourceEditing?.id === resource.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                            value={resourceEditing.title}
                            onChange={(e) => setResourceEditing((p) => ({ ...p, title: e.target.value }))}
                          />
                          <textarea
                            className="h-24 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                            value={resourceEditing.description}
                            onChange={(e) => setResourceEditing((p) => ({ ...p, description: e.target.value }))}
                          />
                          <select
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                            value={resourceEditing.type}
                            onChange={(e) => setResourceEditing((p) => ({ ...p, type: e.target.value }))}
                          >
                            <option value="notes">Notes</option>
                            <option value="past-papers">Past Papers</option>
                            <option value="timetable">Timetable</option>
                          </select>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                              onClick={saveResourceEdit}
                            >
                              Save Changes
                            </button>
                            <button
                              type="button"
                              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-white"
                              onClick={() => setResourceEditing(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${typeBadge[resource.type] || "bg-slate-100 text-slate-600"}`}>
                                {typeLabel[resource.type] || resource.type}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(resource.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            </div>
                            <h3 className="mt-1.5 text-sm font-bold text-slate-900">{resource.title}</h3>
                            <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                              {resource.description || "No description provided."}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              className="rounded-xl border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                              onClick={() => setResourceEditing({ ...resource, description: resource.description || "" })}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50"
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

          {/* ── Blogs Tab ── */}
          {!isLoading && !error && activeTab === "blogs" && (
            <div className="space-y-6">
              {/* Write Blog */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-black text-slate-900">Write a Blog</h2>
                <p className="mt-1 text-sm text-slate-500">Share insights and updates with the community.</p>
                <form className="mt-5 space-y-4" onSubmit={handleBlogSubmit}>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none ring-blue-200 focus:ring-2"
                    placeholder="Blog title"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm((p) => ({ ...p, title: e.target.value }))}
                    required
                  />
                  <textarea
                    className="h-36 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none ring-blue-200 focus:ring-2"
                    placeholder="Share your blog content..."
                    value={blogForm.content}
                    onChange={(e) => setBlogForm((p) => ({ ...p, content: e.target.value }))}
                    minLength={20}
                    required
                  />
                  {feedback.text && (
                    <p
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                        feedback.type === "success"
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      {feedback.text}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                    disabled={isPublishing}
                  >
                    {isPublishing ? "Publishing..." : "Publish Blog"}
                  </button>
                </form>
              </section>

              {/* Blog List */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900">My Blogs</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                    {blogs.length}
                  </span>
                </div>

                {blogs.length === 0 ? (
                  <div className="mt-8 flex flex-col items-center py-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <p className="text-sm font-semibold text-slate-500">No blogs published yet.</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {blogs.map((blog) => (
                      <div key={blog.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        {blogEditing?.id === blog.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                              value={blogEditing.title}
                              onChange={(e) => setBlogEditing((p) => ({ ...p, title: e.target.value }))}
                            />
                            <textarea
                              className="h-28 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                              value={blogEditing.content}
                              onChange={(e) => setBlogEditing((p) => ({ ...p, content: e.target.value }))}
                              minLength={20}
                            />
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                                onClick={saveBlogEdit}
                              >
                                Save Changes
                              </button>
                              <button
                                type="button"
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-white"
                                onClick={() => setBlogEditing(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-slate-400">
                                {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                              <h3 className="mt-1 text-sm font-bold text-slate-900">{blog.title}</h3>
                              <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{blog.content}</p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                className="rounded-xl border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                                onClick={() => setBlogEditing({ ...blog })}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50"
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
              </section>
            </div>
          )}
        </main>
      </div>
    </MotionPage>
  );
};

export default FacultyDashboardPage;
