const BlogSection = ({ blogs, isLoading, error }) => {
  return (
    <section id="blogs" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-lg font-bold  uppercase tracking-[0.16em] text-blue-700 ">Knowledge Hub</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Latest Faculty and Admin Blogs</h2>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">Loading blogs...</div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">{error}</div>
      )}

      {!isLoading && !error && blogs.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">
          No blogs published yet. Faculty and admin posts will appear here.
        </div>
      )}

      {!isLoading && !error && blogs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {blogs.map((blog) => (
            <article key={blog.id} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">{blog.role}</p>
              <h3 className="mt-2 text-lg font-bold text-slate-900">{blog.title}</h3>
              <p className="mt-3 text-sm text-slate-600">
                {blog.content.length > 180 ? `${blog.content.slice(0, 180)}...` : blog.content}
              </p>
              <div className="mt-4 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
                <p>{blog.author}</p>
                <p>{new Date(blog.createdAt).toLocaleDateString()}</p>
              </div>
              <button
                type="button"
                className="mt-4 inline-flex w-fit rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700"
              >
                Read More
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default BlogSection;
