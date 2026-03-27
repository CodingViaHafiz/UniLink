import { Link } from "react-router-dom";
import { MotionSection } from "../../lib/motion";
import BlogCard from "../blog/BlogCard";

const BlogSection = ({ blogs, isLoading, error }) => {
  const preview = blogs.slice(0, 3);

  return (
    <MotionSection
      id="blogs"
      className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-6 sm:px-6 lg:px-8"
    >
      <div className="mb-7">
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Latest Blogs
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Insights and updates from faculty and administrators.
        </p>
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
          <p className="text-sm font-semibold text-slate-500">No blogs published yet.</p>
        </div>
      )}

      {/* Grid + CTA */}
      {!isLoading && !error && preview.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {preview.map((blog) => (
              <BlogCard key={blog.id} blog={blog} onReadMore={() => {}} />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              to="/blogs"
              className="group inline-flex items-center gap-2 border-b-2 border-slate-300 pb-0.5 text-sm font-bold text-slate-600 transition-all duration-200 hover:border-violet-500 hover:text-violet-600"
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
