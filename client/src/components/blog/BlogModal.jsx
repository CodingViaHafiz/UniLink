import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const CATEGORY_LABEL = {
  announcement: "Announcement",
  academic: "Academic",
  research: "Research",
  campus: "Campus Life",
  general: "General",
};

const getReadTime = (content) => Math.max(1, Math.ceil((content || "").split(/\s+/).length / 200));

const BlogModal = ({ blog: initialBlog, onClose, allBlogs = [] }) => {
  const [blog, setBlog] = useState(initialBlog);
  const readTime = getReadTime(blog.content);
  const date = new Date(blog.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  const popular = allBlogs.filter((b) => b.id !== blog.id).slice(0, 4);

  // Switch to a different blog (from popular posts)
  const switchBlog = (newBlog) => {
    setBlog(newBlog);
    window.document.getElementById("blog-reader-top")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 bg-white" id="blog-reader-top">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">Blog</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-xs font-semibold text-slate-600 line-clamp-1 max-w-xs">{blog.title}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Back
        </button>
      </div>

      {/* Scrollable content */}
      <div className="h-[calc(100vh-49px)] overflow-y-auto">
        {/* Hero image */}
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-100">
          {blog.imageUrl ? (
            <img src={blog.imageUrl} alt={blog.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-800 via-blue-900 to-cyan-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          )}
          {/* Title overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent px-6 pb-6 pt-16 sm:px-12 lg:px-20">
            <h1 className="max-w-3xl text-2xl font-black leading-snug text-white sm:text-3xl lg:text-4xl">
              {blog.title}
            </h1>
          </div>
        </div>

        {/* Author row */}
        <div className="mx-auto max-w-5xl px-6 sm:px-12 lg:px-20">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-600">
                {blog.author?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{blog.author}</p>
                <p className="text-xs text-slate-400">{date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {CATEGORY_LABEL[blog.category] || "General"}
              </span>
              <span className="text-xs font-semibold text-slate-400">{readTime} min read</span>
            </div>
          </div>
        </div>

        {/* Content + Sidebar */}
        <div className="mx-auto max-w-5xl px-6 py-8 sm:px-12 lg:flex lg:gap-10 lg:px-20">
          {/* Article */}
          <article className="min-w-0 flex-1">
            <div className="whitespace-pre-wrap text-base leading-8 text-slate-700">
              {blog.content}
            </div>
          </article>

          {/* Popular Posts sidebar */}
          {popular.length > 0 && (
            <aside className="mt-10 shrink-0 lg:mt-0 lg:w-72">
              <h4 className="mb-4 text-sm font-black uppercase tracking-wide text-slate-400">Popular Posts</h4>
              <div className="space-y-3">
                {popular.map((post) => {
                  const postDate = new Date(post.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" });
                  return (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => switchBlog(post)}
                      className="flex w-full gap-3 rounded-xl border border-slate-100 p-3 text-left transition-all hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {post.imageUrl ? (
                          <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold leading-snug text-slate-900 line-clamp-2">{post.title}</p>
                        <p className="mt-1.5 text-[11px] text-slate-400">
                          {post.author} · {postDate}
                        </p>
                        <span className="mt-1 inline-block text-[10px] font-bold text-sky-600 hover:text-sky-700">
                          Read More →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BlogModal;
