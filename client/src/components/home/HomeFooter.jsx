const HomeFooter = () => {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-black text-white">
              U
            </span>
            <span className="text-lg font-black text-white">UniLink</span>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            A secure, role-aware university platform for students, faculty, and administration.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.13em] text-white">Quick Links</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>
              <a href="#home" className="hover:text-white">
                Home
              </a>
            </li>
            <li>
              <a href="#blogs" className="hover:text-white">
                Blogs
              </a>
            </li>
            <li>
              <a href="#about" className="hover:text-white">
                About
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.13em] text-white">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>support@unilink.edu</li>
            <li>+1 (555) 010-4455</li>
            <li>Academic Center, Main Campus</li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.13em] text-white">Social</p>
          <div className="mt-3 flex gap-2">
            <a className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 hover:border-slate-500 hover:text-white" href="#!">
              X
            </a>
            <a className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 hover:border-slate-500 hover:text-white" href="#!">
              LinkedIn
            </a>
            <a className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 hover:border-slate-500 hover:text-white" href="#!">
              YouTube
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-500">
        Copyright {new Date().getFullYear()} UniLink. All rights reserved.
      </div>
    </footer>
  );
};

export default HomeFooter;
