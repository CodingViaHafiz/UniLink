import { MotionSection } from "../../lib/motion";

const HeroSection = () => {
  return (
    <MotionSection
      id="home"
      className="hero-glow relative scroll-mt-24 overflow-hidden border-b border-slate-200 bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-800 text-white"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
        <div className="space-y-5">
          <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
            Connected Campus Platform
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Learn, collaborate, and publish in one academic network.
          </h1>
          <p className="max-w-xl text-sm text-blue-100 sm:text-base">
            UniLink brings students, faculty, and administrators together through verified updates, blogs, and role-based
            workflows designed for modern institutions.
          </p>
          <a
            href="#blogs"
            className="inline-flex rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-blue-50"
          >
            Explore Blogs
          </a>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur animate-float">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-100">What you get</p>
          <ul className="mt-4 space-y-3 text-sm text-blue-50">
            <li className="rounded-lg border border-white/20 bg-white/5 px-3 py-2">Role-aware access controls with secure JWT sessions</li>
            <li className="rounded-lg border border-white/20 bg-white/5 px-3 py-2">Unified home experience for every user type</li>
            <li className="rounded-lg border border-white/20 bg-white/5 px-3 py-2">Faculty and admin authored academic blogs</li>
          </ul>
        </div>
      </div>
    </MotionSection>
  );
};

export default HeroSection;
