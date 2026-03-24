import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { MotionCard, MotionStagger, staggerChild } from "../lib/motion";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────
   Static data
───────────────────────────────────────── */

const features = [
  {
    title: "Academic Resources",
    description: "Verified notes, past papers, and timetables uploaded by faculty — accessible to every enrolled student.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: "bg-sky-50 text-sky-600",
  },
  {
    title: "Hostel Listings",
    description: "Curated, admin-verified hostel listings with pricing, contact info, and Google Maps directions.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Faculty Blogs",
    description: "Faculty members share insights, tutorials, and updates through a built-in blogging system.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
    color: "bg-violet-50 text-violet-600",
  },
  {
    title: "Role-Based Access",
    description: "Secure enrollment-based registration for students, admin-managed faculty accounts, and granular role permissions.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: "bg-amber-50 text-amber-600",
  },
];

const premiumPlans = [
  {
    title: "Sponsored Hostel Listings",
    audience: "Hostel Owners",
    description: "Featured placement at the top of hostel listings with a gold badge. Maximum visibility for verified hostels.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    badge: "bg-amber-100 text-amber-700",
  },
  {
    title: "Company Internship Posts",
    audience: "Companies & Recruiters",
    description: "Post internship and job opportunities directly to the student feed. Reach verified, enrolled students instantly.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    badge: "bg-blue-100 text-blue-700",
  },
  {
    title: "Premium Resources",
    audience: "Students",
    description: "Exclusive study material, recorded lectures, and premium notes. Unlock with a student premium subscription.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    badge: "bg-violet-100 text-violet-700",
  },
  {
    title: "Scholarship Promotions",
    audience: "Organizations & NGOs",
    description: "Promote scholarships and grants to the entire student body through highlighted feed posts with a sponsored badge.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    badge: "bg-emerald-100 text-emerald-700",
  },
];

const techStack = [
  { name: "React", role: "Frontend UI" },
  { name: "Tailwind CSS", role: "Styling" },
  { name: "Node.js", role: "Runtime" },
  { name: "Express", role: "Backend API" },
  { name: "MongoDB", role: "Database" },
  { name: "JWT", role: "Authentication" },
  { name: "Socket.io", role: "Real-time (planned)" },
  { name: "Nodemailer", role: "Email" },
];

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */

const AboutPage = () => {
  const { user } = useAuth();

  const aboutIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <AppLayout
      activePage="about"
      user={user}
      title="About UniLink"
      subtitle="The academic hub built for students"
      icon={aboutIcon}
    >
      <div className="mx-auto max-w-4xl space-y-12">

        {/* ── Hero blurb ── */}
        <MotionCard>
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">About UniLink</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              The Academic Hub Built for Students
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
              UniLink centralizes academic resources, hostel information, and faculty insights into one clean,
              role-secured platform — designed to serve students, faculty, and administrators.
            </p>
          </div>
        </MotionCard>

        {/* ── What We Deliver ── */}
        <section>
          <h2 className="mb-5 text-lg font-black text-slate-900">What We Deliver</h2>
          <MotionStagger className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <motion.div key={f.title} variants={staggerChild} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${f.color}`}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </MotionStagger>
        </section>

        {/* ── Tech Stack ── */}
        <MotionCard>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-black text-slate-900">Built With</h2>
            <div className="flex flex-wrap gap-2.5">
              {techStack.map((t) => (
                <div key={t.name} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                  <span className="text-sm font-bold text-slate-900">{t.name}</span>
                  <span className="text-xs text-slate-400">{t.role}</span>
                </div>
              ))}
            </div>
          </section>
        </MotionCard>

        {/* ── UniLink Premium ── */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-amber-600 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Future Plans</p>
              <h2 className="text-lg font-black text-slate-900">UniLink Premium</h2>
            </div>
          </div>

          <MotionStagger className="grid gap-4 sm:grid-cols-2">
            {premiumPlans.map((plan) => (
              <motion.div
                key={plan.title}
                variants={staggerChild}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-linear-to-br from-amber-100 to-amber-50 opacity-60" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      {plan.icon}
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${plan.badge}`}>
                      {plan.audience}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-slate-900">{plan.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{plan.description}</p>
                </div>
              </motion.div>
            ))}
          </MotionStagger>

          <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-center">
            <p className="text-xs font-semibold text-amber-700">
              These features are part of UniLink's long-term roadmap. All premium services would be
              admin-managed with offline payment support (bank transfer, JazzCash, EasyPaisa) before
              integrating a full payment gateway.
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <MotionCard>
          <section className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <h2 className="text-xl font-black text-slate-900">Ready to Explore?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Head back to the dashboard and explore resources, hostels, and blogs.
            </p>
            <Link
              to="/home"
              className="btn-press mt-5 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </section>
        </MotionCard>

      </div>
    </AppLayout>
  );
};

export default AboutPage;
