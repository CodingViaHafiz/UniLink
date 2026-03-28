import { useState, useEffect, useCallback, useMemo } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { MotionCard, MotionStagger, staggerChild } from "../lib/motion";
import { motion, AnimatePresence } from "framer-motion";

/* -----------------------------------------------------------------
   Constants
----------------------------------------------------------------- */

const GRADE_MAP = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  D: 1.0,
  F: 0.0,
};

const GRADE_OPTIONS = Object.keys(GRADE_MAP);
const CREDIT_OPTIONS = [1, 2, 3, 4];
const STORAGE_KEY = "unilink_gpa_data";

/* -----------------------------------------------------------------
   Helpers
----------------------------------------------------------------- */

const createCourse = () => ({
  id: crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2),
  name: "",
  credits: 3,
  grade: "A",
});

const createSemester = (number) => ({
  id: crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2),
  name: `Semester ${number}`,
  courses: [createCourse()],
});

const calcSemesterGpa = (courses) => {
  let totalPoints = 0;
  let totalCredits = 0;
  for (const c of courses) {
    const pts = GRADE_MAP[c.grade];
    if (pts === undefined) continue;
    totalPoints += pts * c.credits;
    totalCredits += c.credits;
  }
  return totalCredits === 0 ? 0 : totalPoints / totalCredits;
};

const cgpaColor = (gpa) => {
  if (gpa >= 3.5) return "text-emerald-500";
  if (gpa >= 3.0) return "text-blue-500";
  if (gpa >= 2.0) return "text-amber-500";
  return "text-red-500";
};

const cgpaBg = (gpa) => {
  if (gpa >= 3.5) return "from-emerald-50 to-emerald-100/60 border-emerald-200";
  if (gpa >= 3.0) return "from-blue-50 to-blue-100/60 border-blue-200";
  if (gpa >= 2.0) return "from-amber-50 to-amber-100/60 border-amber-200";
  return "from-red-50 to-red-100/60 border-red-200";
};

const cgpaRingColor = (gpa) => {
  if (gpa >= 3.5) return "stroke-emerald-500";
  if (gpa >= 3.0) return "stroke-blue-500";
  if (gpa >= 2.0) return "stroke-amber-500";
  return "stroke-red-500";
};

const cgpaLabel = (gpa) => {
  if (gpa >= 3.5) return "Excellent";
  if (gpa >= 3.0) return "Good";
  if (gpa >= 2.0) return "Average";
  if (gpa > 0) return "Needs Improvement";
  return "No Data";
};

/* -----------------------------------------------------------------
   Load / Save helpers
----------------------------------------------------------------- */

const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* corrupted — start fresh */
  }
  return [createSemester(1)];
};

/* -----------------------------------------------------------------
   Page Component
----------------------------------------------------------------- */

const GpaCalculatorPage = () => {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState(loadData);

  /* ── Persist to localStorage on every change ── */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(semesters));
  }, [semesters]);

  /* ── Semester-level actions ── */
  const addSemester = useCallback(() => {
    setSemesters((prev) => [...prev, createSemester(prev.length + 1)]);
  }, []);

  const removeSemester = useCallback((semId) => {
    setSemesters((prev) => {
      const next = prev.filter((s) => s.id !== semId);
      return next.length === 0 ? [createSemester(1)] : next;
    });
  }, []);

  const updateSemesterName = useCallback((semId, name) => {
    setSemesters((prev) =>
      prev.map((s) => (s.id === semId ? { ...s, name } : s))
    );
  }, []);

  /* ── Course-level actions ── */
  const addCourse = useCallback((semId) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semId ? { ...s, courses: [...s.courses, createCourse()] } : s
      )
    );
  }, []);

  const removeCourse = useCallback((semId, courseId) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semId
          ? { ...s, courses: s.courses.filter((c) => c.id !== courseId) }
          : s
      )
    );
  }, []);

  const updateCourse = useCallback((semId, courseId, field, value) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semId
          ? {
              ...s,
              courses: s.courses.map((c) =>
                c.id === courseId ? { ...c, [field]: value } : c
              ),
            }
          : s
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setSemesters([createSemester(1)]);
  }, []);

  /* ── Computed values ── */
  const { semesterGpas, cgpa, totalCredits } = useMemo(() => {
    let allPoints = 0;
    let allCredits = 0;
    const gpas = {};

    for (const sem of semesters) {
      const gpa = calcSemesterGpa(sem.courses);
      gpas[sem.id] = gpa;

      for (const c of sem.courses) {
        const pts = GRADE_MAP[c.grade];
        if (pts === undefined) continue;
        allPoints += pts * c.credits;
        allCredits += c.credits;
      }
    }

    return {
      semesterGpas: gpas,
      cgpa: allCredits === 0 ? 0 : allPoints / allCredits,
      totalCredits: allCredits,
    };
  }, [semesters]);

  /* ── SVG ring values for CGPA display ── */
  const ringRadius = 54;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringProgress = (cgpa / 4.0) * ringCircumference;

  /* ── Icon for AppLayout ── */
  const pageIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );

  return (
    <AppLayout
      activePage="gpa"
      user={user}
      title="GPA Calculator"
      subtitle={`${semesters.length} semester${semesters.length !== 1 ? "s" : ""} | ${totalCredits} credit hours`}
      icon={pageIcon}
    >
      <div className="mx-auto max-w-4xl space-y-8">

        {/* ══════════════════════════
            CGPA Hero Display
        ══════════════════════════ */}
        <MotionCard>
          <div className={`rounded-2xl border bg-gradient-to-br px-6 py-8 shadow-sm ${cgpaBg(cgpa)}`}>
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-10">

              {/* Animated ring */}
              <div className="relative h-36 w-36 shrink-0">
                <svg className="-rotate-90" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Background ring */}
                  <circle cx="60" cy="60" r={ringRadius} strokeWidth="8" className="stroke-slate-200/60" />
                  {/* Progress ring */}
                  <motion.circle
                    cx="60"
                    cy="60"
                    r={ringRadius}
                    strokeWidth="8"
                    strokeLinecap="round"
                    className={cgpaRingColor(cgpa)}
                    initial={{ strokeDashoffset: ringCircumference }}
                    animate={{ strokeDashoffset: ringCircumference - ringProgress }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ strokeDasharray: ringCircumference }}
                  />
                </svg>
                {/* Number in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    key={cgpa.toFixed(2)}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className={`text-3xl font-black tracking-tight ${cgpaColor(cgpa)}`}
                  >
                    {cgpa.toFixed(2)}
                  </motion.span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CGPA</span>
                </div>
              </div>

              {/* Stats */}
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Cumulative GPA
                </p>
                <motion.p
                  key={cgpaLabel(cgpa)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-1 text-2xl font-black tracking-tight ${cgpaColor(cgpa)}`}
                >
                  {cgpaLabel(cgpa)}
                </motion.p>
                <div className="mt-3 flex flex-wrap justify-center gap-3 sm:justify-start">
                  <div className="rounded-xl bg-white/70 px-3 py-1.5 backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Semesters</p>
                    <p className="text-sm font-black text-slate-900">{semesters.length}</p>
                  </div>
                  <div className="rounded-xl bg-white/70 px-3 py-1.5 backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Credits</p>
                    <p className="text-sm font-black text-slate-900">{totalCredits}</p>
                  </div>
                  <div className="rounded-xl bg-white/70 px-3 py-1.5 backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Scale</p>
                    <p className="text-sm font-black text-slate-900">4.00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionCard>

        {/* ══════════════════════════
            Action Bar
        ══════════════════════════ */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addSemester}
            className="btn-press inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Semester
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset All
          </button>
        </div>

        {/* ══════════════════════════
            Semester Cards
        ══════════════════════════ */}
        <MotionStagger className="space-y-6">
          <AnimatePresence mode="popLayout">
            {semesters.map((sem, semIdx) => {
              const semGpa = semesterGpas[sem.id] ?? 0;

              return (
                <motion.div
                  key={sem.id}
                  variants={staggerChild}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* Semester header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-black text-sky-600">
                        {semIdx + 1}
                      </div>
                      <input
                        type="text"
                        value={sem.name}
                        onChange={(e) => updateSemesterName(sem.id, e.target.value)}
                        className="w-40 border-0 bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300 focus:ring-0 sm:w-56"
                        placeholder="Semester name"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Semester GPA badge */}
                      <div className={`rounded-lg px-3 py-1 text-xs font-black ${semGpa >= 3.5 ? "bg-emerald-50 text-emerald-600" : semGpa >= 3.0 ? "bg-blue-50 text-blue-600" : semGpa >= 2.0 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500"}`}>
                        GPA {semGpa.toFixed(2)}
                      </div>
                      {/* Remove semester */}
                      <button
                        type="button"
                        onClick={() => removeSemester(sem.id)}
                        className="btn-press flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        title="Remove semester"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Course list */}
                  <div className="px-5 py-4">

                    {/* Table header — hidden on small screens */}
                    <div className="mb-2 hidden grid-cols-12 gap-3 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:grid">
                      <div className="col-span-5">Course Name</div>
                      <div className="col-span-2">Credits</div>
                      <div className="col-span-3">Grade</div>
                      <div className="col-span-2 text-right">Points</div>
                    </div>

                    <AnimatePresence mode="popLayout">
                      {sem.courses.map((course) => {
                        const points = GRADE_MAP[course.grade] * course.credits;

                        return (
                          <motion.div
                            key={course.id}
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="overflow-hidden"
                          >
                            <div className="mb-2 flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:grid sm:grid-cols-12 sm:items-center sm:gap-3 sm:rounded-lg sm:border-0 sm:bg-transparent sm:p-1">
                              {/* Course name */}
                              <div className="sm:col-span-5">
                                <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400 sm:hidden">Course Name</label>
                                <input
                                  type="text"
                                  value={course.name}
                                  onChange={(e) => updateCourse(sem.id, course.id, "name", e.target.value)}
                                  placeholder="e.g. Data Structures"
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-sky-300 focus:ring-1 focus:ring-sky-200"
                                />
                              </div>

                              {/* Credits */}
                              <div className="sm:col-span-2">
                                <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400 sm:hidden">Credits</label>
                                <select
                                  value={course.credits}
                                  onChange={(e) => updateCourse(sem.id, course.id, "credits", Number(e.target.value))}
                                  className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-200"
                                >
                                  {CREDIT_OPTIONS.map((c) => (
                                    <option key={c} value={c}>{c} cr</option>
                                  ))}
                                </select>
                              </div>

                              {/* Grade */}
                              <div className="sm:col-span-3">
                                <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400 sm:hidden">Grade</label>
                                <select
                                  value={course.grade}
                                  onChange={(e) => updateCourse(sem.id, course.id, "grade", e.target.value)}
                                  className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-200"
                                >
                                  {GRADE_OPTIONS.map((g) => (
                                    <option key={g} value={g}>{g} ({GRADE_MAP[g].toFixed(1)})</option>
                                  ))}
                                </select>
                              </div>

                              {/* Points + delete */}
                              <div className="flex items-center justify-between sm:col-span-2 sm:justify-end sm:gap-2">
                                <span className="text-sm font-black text-slate-700 sm:flex-1 sm:text-right">
                                  {points.toFixed(1)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeCourse(sem.id, course.id)}
                                  disabled={sem.courses.length <= 1}
                                  className="btn-press flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-red-50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-300"
                                  title="Remove course"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {/* Add course button */}
                    <button
                      type="button"
                      onClick={() => addCourse(sem.id)}
                      className="btn-press mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-sky-600 transition-colors hover:bg-sky-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Course
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </MotionStagger>

        {/* ══════════════════════════
            Grade Reference
        ══════════════════════════ */}
        <MotionCard>
          <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
            <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-bold text-slate-900 select-none">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Grade Point Reference
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="border-t border-slate-100 px-5 py-4">
              <div className="flex flex-wrap gap-2">
                {GRADE_OPTIONS.map((g) => (
                  <div key={g} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                    <span className="text-xs font-black text-slate-900">{g}</span>
                    <span className="text-xs text-slate-400">{GRADE_MAP[g].toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </MotionCard>

      </div>
    </AppLayout>
  );
};

export default GpaCalculatorPage;
