import { Link } from "react-router-dom";

const HomeFooter = () => {
  return (
    <footer className="relative mt-8 overflow-hidden">

      {/* Geometric background — overlapping triangles in app sky-blue shades */}
      <div className="absolute inset-0">
        {/* Base — fills the entire footer so no transparent area */}
        <div className="absolute inset-0 bg-sky-500" />
        {/* Left triangle — light sky */}
        <div className="absolute inset-0" style={{ clipPath: "polygon(0 0, 0 100%, 55% 100%)", backgroundColor: "#0284c7" }} />
        {/* Center-right triangle — deeper sky */}
        <div className="absolute inset-0" style={{ clipPath: "polygon(100% 15%, 35% 100%, 100% 100%)", backgroundColor: "#0369a1" }} />
        {/* Bottom overlap triangle — darkest sky */}
        <div className="absolute inset-0" style={{ clipPath: "polygon(45% 100%, 100% 40%, 100% 100%)", backgroundColor: "#075985" }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 pb-8 pt-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-sm font-black text-white backdrop-blur">
                U
              </span>
              <span className="text-lg font-black text-white">UniLink</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              A secure, role-aware academic platform connecting students, faculty,
              and administration under one roof.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.13em] text-white">
              Navigate
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li><Link to="/home" className="transition-colors hover:text-white">Home</Link></li>
              <li><Link to="/resources" className="transition-colors hover:text-white">Resources</Link></li>
              <li><Link to="/blogs" className="transition-colors hover:text-white">Blogs</Link></li>
              <li><Link to="/hostels" className="transition-colors hover:text-white">Hostels</Link></li>
              <li><Link to="/feed" className="transition-colors hover:text-white">Feed</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.13em] text-white">
              Contact
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@unilink.edu
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +92 (51) 111-0044
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Main Campus, Islamabad
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.13em] text-white">
              Quick Actions
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/feedback" className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition-colors hover:bg-white/25">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Give Feedback
              </Link>
              <Link to="/about" className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition-colors hover:bg-white/25">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About Us
              </Link>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Built with React, Node.js, MongoDB, and Socket.io. A modern academic platform for the digital campus.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/50">
          &copy; {new Date().getFullYear()} UniLink. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
