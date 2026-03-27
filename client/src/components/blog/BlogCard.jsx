const CATEGORY_LABEL = {
  announcement: "Announcement",
  academic: "Academic",
  research: "Research",
  campus: "Campus Life",
  general: "General",
};

const getReadTime = (content) => Math.max(1, Math.ceil((content || "").split(/\s+/).length / 200));

const BlogCard = ({ blog, onReadMore }) => {
  const readTime = getReadTime(blog.content);
  const date = new Date(blog.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  return (
    <article
      className="group cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => onReadMore(blog)}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        {blog.imageUrl ? (
          <img
            src={blog.imageUrl}
            alt={blog.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        )}
        {/* Category badge on image */}
        <span className="absolute bottom-3 left-3 rounded-md bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
          {CATEGORY_LABEL[blog.category] || "General"}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="text-base font-bold leading-snug text-slate-900 line-clamp-2 sm:text-lg">
          {blog.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 line-clamp-2">
          {blog.content}
        </p>

        {/* Footer — author + read time */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600">
              {blog.author?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">{blog.author}</p>
              <p className="text-[10px] text-slate-400">{date}</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-slate-400">{readTime} min read</span>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
