import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import BlogCard from "../components/blog/BlogCard";
import BlogReader from "../components/blog/BlogReader";
import Pagination from "../components/ui/Pagination";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";

const ITEMS_PER_PAGE = 9;

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "announcement", label: "Announcement" },
  { key: "academic", label: "Academic" },
  { key: "research", label: "Research" },
  { key: "campus", label: "Campus Life" },
  { key: "general", label: "General" },
];

const BlogsPage = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await apiFetch("/blogs", { method: "GET" });
        setBlogs(data.blogs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = blogs;
    if (activeCategory !== "all") {
      result = result.filter((b) => b.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }
    return result;
  }, [blogs, activeCategory, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => { setCurrentPage(1); }, [activeCategory, search]);

  const blogIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );

  return (
    <AppLayout
      activePage="blogs"
      user={user}
      title={viewing ? "Reading" : "Blog"}
      subtitle={viewing ? viewing.title : isLoading ? "Loading..." : `${filtered.length} ${filtered.length === 1 ? "article" : "articles"}`}
      icon={blogIcon}
    >
      {/* ── Reading view ── */}
      {viewing && (
        <BlogReader
          blog={viewing}
          onBack={() => setViewing(null)}
          allBlogs={blogs}
          onSwitch={setViewing}
        />
      )}

      {/* ── List view ── */}
      {!viewing && (
        <>
          {/* Search */}
          <div className="mb-4">
            <div className="relative max-w-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search topics"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
              />
            </div>
          </div>

          {/* Category filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  activeCategory === cat.key
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="aspect-16/9 bg-slate-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 rounded-lg bg-slate-200" />
                    <div className="h-3 w-full rounded-lg bg-slate-200" />
                    <div className="flex items-center gap-2 pt-2">
                      <div className="h-8 w-8 rounded-full bg-slate-200" />
                      <div className="h-3 w-24 rounded bg-slate-200" />
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
              <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <p className="text-sm font-bold text-slate-600">
                {search || activeCategory !== "all" ? "No blogs match your filters." : "No blogs published yet."}
              </p>
            </div>
          )}

          {/* Grid */}
          {!isLoading && !error && paginated.length > 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paginated.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} onReadMore={setViewing} />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default BlogsPage;
