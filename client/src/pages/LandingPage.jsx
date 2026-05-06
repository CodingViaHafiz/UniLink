import { Link } from "react-router-dom";
import uniLinkLogo from "../assets/unilink-logo-campus.svg";
import { MotionPage } from "../lib/motion";

const features = [
  {
    title: "Campus Feed",
    text: "Stay updated with student posts, announcements, and campus discussions in one place.",
  },
  {
    title: "Study Tools",
    text: "GPA planner, focus sessions, and learning resources — all integrated.",
  },
  {
    title: "Student Services",
    text: "Hostels, lost & found, marketplace, and support — everything unified.",
  },
];

const LandingPage = () => {
  return (
    <MotionPage className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 px-4 py-4 backdrop-blur-md bg-white/70 border-b border-slate-200">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={uniLinkLogo} className="h-10 w-10" />
            <span className="text-lg font-extrabold">UniLink</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold rounded-full hover:bg-slate-100 transition"
            >
              Login
            </Link>
            <Link
              to="/login?mode=register"
              className="px-5 py-2 text-sm font-bold rounded-full bg-sky-600 text-white hover:bg-sky-700 transition shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="px-4 py-12 sm:py-24">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT */}
          <div>
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
              A smarter way to connect your{" "}
              <span className="text-sky-600">campus life</span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 max-w-xl">
              UniLink brings students, faculty, tools, and services into one
              fast and modern platform designed for real university needs.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/login?mode=register"
                className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-full shadow-lg hover:bg-sky-700 transition"
              >
                Start Free
              </Link>

              <Link
                to="/login"
                className="px-6 py-3 border border-slate-300 rounded-full font-semibold hover:bg-slate-100 transition"
              >
                Login
              </Link>
            </div>
          </div>

          {/* RIGHT (UI CARD MOCKUP) */}
          <div className="relative">
            <div className="rounded-3xl bg-white shadow-2xl border border-slate-200 p-6">
              <div className="space-y-4">
                <div className="p-4 bg-sky-50 rounded-xl">
                  <p className="font-semibold">Campus Updates</p>
                  <p className="text-sm text-slate-500">
                    New event announcements and discussions
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="font-semibold">Study Tools</p>
                  <p className="text-sm text-slate-500">
                    Focus timer and GPA planner
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="font-semibold">Marketplace</p>
                  <p className="text-sm text-slate-500">
                    Buy & sell student items easily
                  </p>
                </div>
              </div>
            </div>

            {/* Glow */}
            <div className="absolute -z-10 top-10 left-10 w-72 h-72 bg-sky-200 rounded-full blur-3xl opacity-40" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 py-16 bg-white">
        <div className="mx-auto max-w-7xl">

          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              Everything you need
            </h2>
            <p className="mt-4 text-slate-600">
              Designed for students, optimized for productivity.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-lg transition"
              >
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center bg-slate-900 text-white">
        <h2 className="text-3xl sm:text-4xl font-extrabold">
          Ready to upgrade your campus experience?
        </h2>

        <Link
          to="/login?mode=register"
          className="mt-8 inline-block px-8 py-3 bg-sky-500 rounded-full font-bold hover:bg-sky-600 transition shadow-lg"
        >
          Create Account
        </Link>
      </section>

    </MotionPage>
  );
};

export default LandingPage;