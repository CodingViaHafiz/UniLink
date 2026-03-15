import { Link } from "react-router-dom";

const HomeFooter = () => {
  return (
    <footer className="mt-8 border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-black text-white">
              U
            </span>
            <span className="text-lg font-black text-white">UniLink</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            A secure, role-aware academic platform connecting students, faculty,
            and administration under one roof.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.13em] text-white">
            Navigate
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>
              <Link to="/home" className="transition-colors hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link to="/resources" className="transition-colors hover:text-white">
                Resources
              </Link>
            </li>
            <li>
              <Link to="/blogs" className="transition-colors hover:text-white">
                Blogs
              </Link>
            </li>
            <li>
              <Link to="/hostels" className="transition-colors hover:text-white">
                Hostels
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.13em] text-white">
            Contact
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@unilink.edu
            </li>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +92 (51) 111-0044
            </li>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Main Campus, Islamabad
            </li>
          </ul>
        </div>

        {/* About */}
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.13em] text-white">
            About
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            UniLink is a MERN-stack university management platform built with
            role-based access, real-time features, and a modern responsive UI.
          </p>
          <Link
            to="/about"
            className="mt-3 inline-block text-xs font-bold text-blue-400 transition-colors hover:text-blue-300"
          >
            Learn more →
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} UniLink. All rights reserved.
      </div>
    </footer>
  );
};

export default HomeFooter;
