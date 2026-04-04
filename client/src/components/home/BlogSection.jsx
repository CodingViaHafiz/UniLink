import { Link, useNavigate } from "react-router-dom";
import { MotionSection } from "../../lib/motion";
import BlogCard from "../blog/BlogCard";

const BlogSection = ({ blogs, isLoading, error }) => {
  const navigate = useNavigate();
  const preview = blogs.slice(0, 3);

  return (
    <MotionSection
      id="blogs"
      className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-6 sm:px-6 lg:px-8"
    >
      <div className="mb-7 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 sm:text-xl">Latest Blogs</h2>
            <p className="text-xs text-slate-500">Insights and updates from faculty and administrators.</p>
          </div>
        </div>

        {/* Header-level CTA — visible on sm+ when there's content */}
        {!isLoading && !error && preview.length > 0 && (
          <Link
            to="/blogs"
            className="group hidden shrink-0 items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 transition-all duration-200 hover:bg-violet-100 sm:inline-flex"
          >
            View all
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 h-3 w-20 animate-pulse rounded-full bg-slate-100" />
              <div className="mb-2 h-5 w-3/4 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
              <div className="mt-1.5 h-3 w-2/3 animate-pulse rounded-full bg-slate-100" />
              <div className="mt-4 h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
            </div>
          ))}
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
          <p className="text-sm font-semibold text-slate-500">No blogs published yet.</p>
        </div>
      )}

      {/* Grid + CTA */}
      {!isLoading && !error && preview.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {preview.map((blog) => (
              <BlogCard key={blog.id} blog={blog} onReadMore={(b) => navigate("/blogs", { state: { viewBlog: b } })} />
            ))}
          </div>

          {/* Bottom CTA — visible on mobile (header CTA hidden on mobile) */}
          <div className="mt-8 flex justify-center sm:hidden">
            <Link
              to="/blogs"
              className="group inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-5 py-2.5 text-sm font-bold text-violet-700 transition-all duration-200 hover:bg-violet-100 hover:shadow-sm"
            >
              View all blogs
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </>
      )}
    </MotionSection>
  );
};

export default BlogSection;
