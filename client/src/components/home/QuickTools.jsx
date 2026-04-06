import { Link } from "react-router-dom";
import { MotionSection, MotionStagger, staggerChild } from "../../lib/motion";
import { motion } from "framer-motion";

const tools = [
  {
    label: "GPA Calculator",
    description: "Compute CGPA",
    to: "/gpa-calculator",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    bg: "bg-gradient-to-br from-violet-500 to-purple-600",
    iconBg: "bg-white/20",
    glow: "hover:shadow-violet-500/25",
    decorBg: "bg-white/10",
  },
  {
    label: "Voice Your Say",
    description: "Share anonymously",
    to: "/feedback",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    bg: "bg-gradient-to-br from-amber-400 to-orange-500",
    iconBg: "bg-white/20",
    glow: "hover:shadow-amber-500/25",
    decorBg: "bg-white/10",
  },
  {
    label: "Marketplace",
    description: "Buy & sell textbooks",
    to: "/marketplace",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    iconBg: "bg-white/20",
    glow: "hover:shadow-emerald-500/25",
    decorBg: "bg-white/10",
  },
  {
    label: "Lost & Found",
    description: "Help find lost items",
    to: "/lost-found",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    bg: "bg-gradient-to-br from-sky-500 to-blue-600",
    iconBg: "bg-white/20",
    glow: "hover:shadow-sky-500/25",
    decorBg: "bg-white/10",
  },
  {
    label: "Focus Timer",
    description: "Stay productive",
    to: "/focus-timer",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bg: "bg-gradient-to-br from-rose-500 to-pink-600",
    iconBg: "bg-white/20",
    glow: "hover:shadow-rose-500/25",
    decorBg: "bg-white/10",
  },
];

const QuickTools = () => (
  <MotionSection className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-black text-slate-900 sm:text-xl">Quick Tools</h2>
        <p className="text-xs text-slate-500">Everything you need, one click away</p>
      </div>
    </div>

    <MotionStagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
      {tools.map((tool, i) => (
        <motion.div
          key={tool.label}
          variants={staggerChild}
          className={i === tools.length - 1 && tools.length % 2 !== 0 ? "col-span-2 sm:col-span-1" : ""}
        >
          <Link
            to={tool.to}
            className={`group relative flex flex-col overflow-hidden rounded-2xl p-4 text-white shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-5 ${tool.bg} ${tool.glow}`}
          >
            {/* Decorative circles */}
            <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${tool.decorBg}`} />
            <div className={`absolute -bottom-3 -left-3 h-14 w-14 rounded-full ${tool.decorBg}`} />

            {/* Content */}
            <div className="relative">
              {/* Icon */}
              <div className="mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${tool.iconBg}`}>
                  {tool.icon}
                </div>
              </div>

              {/* Text */}
              <h3 className="text-sm font-bold">{tool.label}</h3>
              <p className="mt-0.5 text-[11px] leading-snug text-white/70">{tool.description}</p>

              {/* Arrow */}
              <div className="mt-3 flex items-center text-white/50 transition-all duration-200 group-hover:translate-x-1 group-hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </MotionStagger>
  </MotionSection>
);

export default QuickTools;
