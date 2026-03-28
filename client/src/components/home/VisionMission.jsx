import { MotionSection, MotionCard, MotionStagger, staggerChild } from "../../lib/motion";
import { motion } from "framer-motion";

const missionPoints = [
  "Providing quality, technology-based higher education.",
  "Developing research and innovation for national solutions.",
  "Implementing sustainable community service.",
  "Building national and international collaboration networks.",
];

const coreValues = [
  {
    label: "Excellence",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    label: "Innovation",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    label: "Integrity",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    label: "Collaboration",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    color: "bg-violet-50 text-violet-600 border-violet-200",
  },
];

const VisionMission = () => (
  <MotionSection className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div className="relative overflow-hidden rounded-3xl bg-white border-slate-200 shadow-sm px-6 py-10 sm:px-10 sm:py-14">

      {/* Decorative pattern — top right */}
      <div className="absolute right-6 top-6 hidden sm:block">
        <div className="flex flex-col gap-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-1 rounded-full bg-amber-300" style={{ width: `${32 - i * 6}px` }} />
          ))}
        </div>
      </div>

      {/* Heading */}
      <MotionCard>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 sm:text-xl">Vision & Mission</h2>
            <p className="text-xs text-slate-500">Brightening the Nation's Future</p>
          </div>
        </div>
      </MotionCard>

      {/* Vision + Mission cards — staggered vertically for visual interest */}
      <MotionStagger className="grid gap-5 sm:grid-cols-2 sm:items-start">
        {/* Vision — pushed down slightly */}
        <motion.div
          variants={staggerChild}
          className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:mt-6 sm:p-8 "
        >
          {/* Decorative quote mark */}
          <span className="absolute -top-4 left-5 text-5xl font-black leading-none text-slate-200">"</span>
          <div className="relative">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </span>
              Vision
            </h3>
            <p className="text-sm leading-relaxed text-slate-600 italic">
              "To become a world-class research university that contributes to national
              development and human welfare."
            </p>
          </div>
        </motion.div>

        {/* Mission — sits higher, creates stagger effect */}
        <motion.div
          variants={staggerChild}
          className="relative overflow-hidden rounded-2xl bg-blue-600 p-6 text-white shadow-lg shadow-blue-600/20 sm:-mt-2 sm:p-8"
        >
          {/* Decorative circle */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />
          <div className="relative">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              Mission
            </h3>
            <ul className="space-y-2.5">
              {missionPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-blue-100">
                  <span className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </MotionStagger>

      {/* Core Values */}
      <MotionCard>
        <div className="mt-8 flex flex-wrap justify-center gap-3 sm:justify-start">
          {coreValues.map((value) => (
            <div
              key={value.label}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${value.color}`}
            >
              {value.icon}
              {value.label}
            </div>
          ))}
        </div>
      </MotionCard>

    </div>
  </MotionSection>
);

export default VisionMission;
