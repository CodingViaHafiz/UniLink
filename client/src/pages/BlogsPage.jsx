import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import BlogCard from "../components/blog/BlogCard";
import BlogModal from "../components/blog/BlogModal";
import Pagination from "../components/ui/Pagination";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";

const ITEMS_PER_PAGE = 9;

const BlogsPage = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewing, setViewing] = useState(null);

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

  const totalPages = Math.ceil(blogs.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return blogs.slice(start, start + ITEMS_PER_PAGE);
  }, [blogs, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const blogIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );

  return (
    <AppLayout
      activePage="blogs"
      user={user}
      title="Blogs"
      subtitle={isLoading ? "Loading..." : `${blogs.length} ${blogs.length === 1 ? "article" : "articles"}`}
      icon={blogIcon}
    >
      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="h-3 w-16 rounded-full bg-slate-200" />
              <div className="h-5 w-3/4 rounded-lg bg-slate-200" />
              <div className="h-3 w-full rounded-lg bg-slate-200" />
              <div className="h-3 w-5/6 rounded-lg bg-slate-200" />
              <div className="mt-4 h-8 w-full rounded-xl bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">{error}</div>
      )}

      {/* Empty */}
      {!isLoading && !error && blogs.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 rounded-2xl bg-slate-50 p-5 text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-600">No blogs published yet.</p>
        </div>
      )}

      {/* Blog grid */}
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

      {viewing && <BlogModal blog={viewing} onClose={() => setViewing(null)} />}
    </AppLayout>
  );
};

export default BlogsPage;
