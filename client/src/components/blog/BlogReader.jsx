/**
 * BlogReader — full article view that renders INSIDE AppLayout's content area.
 * Not a modal/portal — just a regular component.
 */

const CATEGORY_LABEL = {
  announcement: "Announcement",
  academic: "Academic",
  research: "Research",
  campus: "Campus Life",
  general: "General",
};

const getReadTime = (content) => Math.max(1, Math.ceil((content || "").split(/\s+/).length / 200));

const BlogReader = ({ blog, onBack, allBlogs = [], onSwitch }) => {
  const readTime = getReadTime(blog.content);
  const date = new Date(blog.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  const popular = allBlogs.filter((b) => b.id !== blog.id).slice(0, 4);

  return (
    <div>
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to blogs
      </button>

      {/* Hero image */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-100">
        <div className="aspect-[21/9] w-full">
          {blog.imageUrl ? (
            <img src={blog.imageUrl} alt={blog.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-800 via-blue-900 to-cyan-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white/20 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          )}
        </div>
        {/* Title overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent px-5 pb-5 pt-14 sm:px-8 sm:pb-6">
          <h1 className="text-xl font-black leading-snug text-white sm:text-2xl lg:text-3xl">
            {blog.title}
          </h1>
        </div>
      </div>

      {/* Author row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
            {blog.author?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{blog.author}</p>
            <p className="text-[11px] text-slate-400">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            {CATEGORY_LABEL[blog.category] || "General"}
          </span>
          <span className="text-[11px] font-semibold text-slate-400">{readTime} min read</span>
        </div>
      </div>

      {/* Content + Sidebar */}
      <div className="flex flex-col gap-8 pt-6 lg:flex-row">
        {/* Article */}
        <article className="min-w-0 flex-1">
          <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700 sm:text-base sm:leading-8">
            {blog.content}
          </div>
        </article>

        {/* Popular Posts */}
        {popular.length > 0 && (
          <aside className="shrink-0 lg:w-64 xl:w-72">
            <h4 className="mb-4 text-xs font-black uppercase tracking-wide text-slate-400">Popular Posts</h4>
            <div className="space-y-2.5">
              {popular.map((post) => {
                const postDate = new Date(post.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" });
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => {
                      onSwitch(post);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex w-full gap-3 rounded-xl border border-slate-100 p-2.5 text-left transition-all hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold leading-snug text-slate-900 line-clamp-2">{post.title}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{post.author} · {postDate}</p>
                      <span className="mt-0.5 inline-block text-[10px] font-bold text-sky-600">Read More →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default BlogReader;
