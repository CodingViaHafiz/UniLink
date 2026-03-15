import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { MotionSection } from "../../lib/motion";

const roleBadge = {
  faculty: "bg-blue-100 text-blue-700",
  admin: "bg-emerald-100 text-emerald-700",
};

/* ── Blog Detail Modal ─────────────────────────────────────────────────── */

const BlogModal = ({ blog, onClose }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(15,23,42,0.55)" }}
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                roleBadge[blog.role] || "bg-slate-100 text-slate-600"
              }`}
            >
              {blog.role}
            </span>
            <h2 className="mt-2 text-lg font-black leading-snug text-slate-900">
              {blog.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-slate-200 p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
            {blog.content}
          </p>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-500">{blog.author}</span>
              <span className="mx-1.5">-</span>
              <span>
                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Blog Section ──────────────────────────────────────────────────────── */

const BlogSection = ({ blogs, isLoading, error }) => {
  const [viewing, setViewing] = useState(null);
  const preview = blogs.slice(0, 6);

  return (
    <MotionSection
      id="blogs"
      className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8"
    >
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
            Knowledge Hub
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Latest Blogs
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Insights and updates from faculty and administrators.
          </p>
        </div>
        {blogs.length > 6 && (
          <Link
            to="/blogs"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            View All
          </Link>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && blogs.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-14 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="text-sm font-semibold text-slate-500">
            No blogs published yet.
          </p>
        </div>
      )}

      {/* Blog Grid */}
      {!isLoading && !error && preview.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((blog) => (
            <article
              key={blog.id}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span
                className={`w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  roleBadge[blog.role] || "bg-slate-100 text-slate-600"
                }`}
              >
                {blog.role}
              </span>
              <h3 className="mt-3 text-base font-bold leading-snug text-slate-900 line-clamp-2">
                {blog.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 line-clamp-3">
                {blog.content}
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-semibold">{blog.author}</span>
                <span className="mx-1">-</span>
                <span>
                  {new Date(blog.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setViewing(blog)}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Read More
              </button>
            </article>
          ))}
        </div>
      )}

      {/* Blog Modal — portal to body to escape will-change-transform stacking context */}
      {viewing && createPortal(
        <BlogModal blog={viewing} onClose={() => setViewing(null)} />,
        document.body
      )}
    </MotionSection>
  );
};

export default BlogSection;
