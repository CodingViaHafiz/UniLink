const roleBadge = {
  faculty: "bg-blue-100 text-blue-700",
  admin: "bg-emerald-100 text-emerald-700",
};

const BlogCard = ({ blog, onReadMore }) => (
  <article className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
    <span className={`w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${roleBadge[blog.role] || "bg-slate-100 text-slate-600"}`}>
      {blog.role}
    </span>
    <h3 className="mt-3 text-base font-bold leading-snug text-slate-900 line-clamp-2">{blog.title}</h3>
    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 line-clamp-3">{blog.content}</p>

    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span className="font-semibold">{blog.author}</span>
      <span className="mx-1">-</span>
      <span>{new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
    </div>

    <button
      type="button"
      onClick={() => onReadMore(blog)}
      className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
    >
      Read More
    </button>
  </article>
);

export default BlogCard;
