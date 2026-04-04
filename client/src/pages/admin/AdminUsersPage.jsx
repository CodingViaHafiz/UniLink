import { useEffect, useMemo, useState } from "react";
import Pagination from "../../components/ui/Pagination";
import { apiFetch } from "../../lib/api";
import { MotionPage } from "../../lib/motion";
import { notifyError, notifySuccess } from "../../lib/toast";

// Number of rows shown per page in each admin table
const USERS_PER_PAGE = 10;
const ENROL_PER_PAGE = 10;

const DEPARTMENTS = [
  "Computer Science",
  "Software Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Other",
];

const roleBadge = {
  admin: "bg-purple-100 text-purple-700",
  faculty: "bg-blue-100 text-blue-700",
  student: "bg-slate-100 text-slate-600",
};

// ─── Staff creation form state ────────────────────────────────────────────────
const emptyStaffForm = { fullName: "", email: "", role: "faculty", department: "", password: "" };

// ─── Enrollment number form state ─────────────────────────────────────────────
const emptyEnrolForm = { enrollmentNumber: "", department: "", program: "", batch: "" };

// ─── Sub-section tab ──────────────────────────────────────────────────────────
const TABS = { STAFF: "staff", ENROLLMENT: "enrollment", SEMESTER: "semester" };

const AdminUsersPage = () => {
  const [activeTab, setActiveTab] = useState(TABS.STAFF);

  // ── Users state ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [filterRole, setFilterRole] = useState("");
  // Separate page trackers for each table
  const [usersPage, setUsersPage] = useState(1);

  // ── Staff form state ─────────────────────────────────────────────────────────
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);

  // ── Semester promotion state ──────────────────────────────────────────────────
  const [programmes, setProgrammes] = useState([]);
  const [semForm, setSemForm] = useState({ programmeCode: "", batch: "", action: "set", semester: "1" });
  const [previewStudents, setPreviewStudents] = useState(null);  // null = not yet previewed
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [promoteResult, setPromoteResult] = useState(null);  // { count, action }

  // ── Enrollment state ─────────────────────────────────────────────────────────
  const [enrolRecords, setEnrolRecords] = useState([]);
  const [isLoadingEnrol, setIsLoadingEnrol] = useState(false);
  const [enrolForm, setEnrolForm] = useState(emptyEnrolForm);
  const [isAddingEnrol, setIsAddingEnrol] = useState(false);
  const [enrolFilter, setEnrolFilter] = useState("all"); // "all" | "used" | "unused"
  const [enrolPage, setEnrolPage] = useState(1);

  // ── Load users ───────────────────────────────────────────────────────────────
  const loadUsers = async (role = "") => {
    try {
      setIsLoadingUsers(true);
      const query = role ? `?role=${role}` : "";
      const data = await apiFetch(`/auth/users${query}`, { method: "GET" });
      setUsers(data.users || []);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => { loadUsers(filterRole); }, [filterRole]);

  // ── Load enrollment numbers ──────────────────────────────────────────────────
  const loadEnrolRecords = async () => {
    try {
      setIsLoadingEnrol(true);
      const query = enrolFilter !== "all" ? `?isUsed=${enrolFilter === "used"}` : "";
      const data = await apiFetch(`/admin/enrollment-numbers${query}`, { method: "GET" });
      setEnrolRecords(data.records || []);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setIsLoadingEnrol(false);
    }
  };

  useEffect(() => {
    if (activeTab === TABS.ENROLLMENT) loadEnrolRecords();
  }, [activeTab, enrolFilter]);

  // ── Load programmes (for semester tab) ───────────────────────────────────────
  useEffect(() => {
    if (activeTab !== TABS.SEMESTER || programmes.length > 0) return;
    apiFetch("/admin/programmes", { method: "GET" })
      .then((data) => setProgrammes(data.programmes || []))
      .catch((err) => notifyError(err.message));
  }, [activeTab, programmes.length]);

  // ── Create staff ─────────────────────────────────────────────────────────────
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setIsCreatingStaff(true);
    try {
      const payload = {
        fullName: staffForm.fullName,
        email: staffForm.email,
        role: staffForm.role,
        department: staffForm.department,
      };
      // Password only needed for admin accounts
      if (staffForm.role === "admin") payload.password = staffForm.password;

      const data = await apiFetch("/auth/staff", { method: "POST", body: JSON.stringify(payload) });
      notifySuccess(data.message);
      setUsers((prev) => [data.user, ...prev]);
      setStaffForm(emptyStaffForm);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setIsCreatingStaff(false);
    }
  };

  // ── Deactivate / Reactivate ──────────────────────────────────────────────────
  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this account? The user will be unable to log in.")) return;
    try {
      const data = await apiFetch(`/auth/users/${id}/deactivate`, { method: "PATCH" });
      notifySuccess(data.message);
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
    } catch (err) { notifyError(err.message); }
  };

  const handleReactivate = async (id) => {
    try {
      const data = await apiFetch(`/auth/users/${id}/reactivate`, { method: "PATCH" });
      notifySuccess(data.message);
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
    } catch (err) { notifyError(err.message); }
  };

  // ── Resend setup email ────────────────────────────────────────────────────────
  const handleResendSetup = async (id) => {
    try {
      const data = await apiFetch(`/auth/staff/${id}/resend-setup`, { method: "POST" });
      notifySuccess(data.message);
    } catch (err) { notifyError(err.message); }
  };

  // ── Semester: preview ────────────────────────────────────────────────────────
  const handleSemesterPreview = async (e) => {
    e.preventDefault();
    setPreviewStudents(null);
    setPromoteResult(null);
    setIsPreviewing(true);
    try {
      const data = await apiFetch(
        `/admin/semester/preview?programmeCode=${encodeURIComponent(semForm.programmeCode)}&batch=${encodeURIComponent(semForm.batch)}`,
        { method: "GET" }
      );
      setPreviewStudents(data.students || []);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setIsPreviewing(false);
    }
  };

  // ── Semester: execute promotion ───────────────────────────────────────────────
  const handleSemesterPromote = async () => {
    if (!window.confirm(`This will update ${previewStudents.length} student(s). Proceed?`)) return;
    setIsPromoting(true);
    try {
      const body = { programmeCode: semForm.programmeCode, batch: semForm.batch, action: semForm.action };
      if (semForm.action === "set") body.semester = semForm.semester;
      const data = await apiFetch("/admin/semester/promote", { method: "PATCH", body: JSON.stringify(body) });
      notifySuccess(data.message);
      setPromoteResult({ count: data.modifiedCount, action: semForm.action, semester: semForm.semester });
      setPreviewStudents(null);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setIsPromoting(false);
    }
  };

  // ── Add enrollment number ────────────────────────────────────────────────────
  const handleAddEnrol = async (e) => {
    e.preventDefault();
    setIsAddingEnrol(true);
    try {
      const data = await apiFetch("/admin/enrollment-numbers", {
        method: "POST",
        body: JSON.stringify(enrolForm),
      });
      notifySuccess(data.message);
      setEnrolRecords((prev) => [data.record, ...prev]);
      setEnrolForm(emptyEnrolForm);
    } catch (err) { notifyError(err.message); }
    finally { setIsAddingEnrol(false); }
  };

  // ── Delete enrollment number ──────────────────────────────────────────────────
  const handleDeleteEnrol = async (id) => {
    if (!window.confirm("Delete this enrollment number?")) return;
    try {
      await apiFetch(`/admin/enrollment-numbers/${id}`, { method: "DELETE" });
      notifySuccess("Enrollment number deleted.");
      setEnrolRecords((prev) => prev.filter((r) => r._id !== id));
    } catch (err) { notifyError(err.message); }
  };

  // ── Pagination: slice users for current page ──────────────────────────────
  const usersTotalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (usersPage - 1) * USERS_PER_PAGE;
    return users.slice(start, start + USERS_PER_PAGE);
  }, [users, usersPage]);

  // Reset users page when filter changes
  useEffect(() => { setUsersPage(1); }, [filterRole]);

  // ── Pagination: slice enrollment records for current page ─────────────────
  const enrolTotalPages = Math.ceil(enrolRecords.length / ENROL_PER_PAGE);
  const paginatedEnrol = useMemo(() => {
    const start = (enrolPage - 1) * ENROL_PER_PAGE;
    return enrolRecords.slice(start, start + ENROL_PER_PAGE);
  }, [enrolRecords, enrolPage]);

  // Reset enrollment page when filter changes
  useEffect(() => { setEnrolPage(1); }, [enrolFilter]);

  return (
    <MotionPage className="space-y-6">

      {/* ── Tab switcher ── */}
      <div className="flex gap-2 border-b border-slate-200 pb-1">
        {[
          { key: TABS.STAFF, label: "Staff Accounts" },
          { key: TABS.ENROLLMENT, label: "Enrollment Numbers" },
          { key: TABS.SEMESTER, label: "Semester Promotion" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`rounded-t-lg px-4 py-2 text-sm font-bold transition-colors ${activeTab === key
              ? "border-b-2 border-blue-600 text-blue-700"
              : "text-slate-500 hover:text-slate-700"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1 — Staff Accounts
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === TABS.STAFF && (
        <>
          {/* Create staff form */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Create Staff Account</h1>
            <p className="mt-1 text-sm text-slate-500">
              Faculty receive a <strong className="text-slate-700">"Set Your Password"</strong> email
              — no password needed from your side. Admin accounts require a password set here.
            </p>

            <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleCreateStaff}>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Full Name</span>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                  placeholder="e.g. Dr. Ayesha Khan"
                  value={staffForm.fullName}
                  onChange={(e) => setStaffForm((p) => ({ ...p, fullName: e.target.value }))}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Email Address</span>
                <input
                  type="email"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                  placeholder="staff@university.edu"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm((p) => ({ ...p, email: e.target.value }))}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Role</span>
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                  value={staffForm.role}
                  onChange={(e) => setStaffForm((p) => ({ ...p, role: e.target.value, password: "" }))}
                >
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Department (optional)</span>
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                  value={staffForm.department}
                  onChange={(e) => setStaffForm((p) => ({ ...p, department: e.target.value }))}
                >
                  <option value="">No department</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>

              {/* Password — only shown for Admin role */}
              {staffForm.role === "admin" && (
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Password (required for admin)
                  </span>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                    placeholder="Min 8 chars, upper, number, special"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm((p) => ({ ...p, password: e.target.value }))}
                    minLength={8}
                    required
                  />
                </label>
              )}

              {/* Faculty info notice */}
              {staffForm.role === "faculty" && (
                <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 md:col-span-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs font-medium text-blue-700">
                    A <strong>"Set Your Password"</strong> email will be sent to the faculty member automatically.
                    They will click the link to activate their account. The link expires in 24 hours.
                  </p>
                </div>
              )}

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isCreatingStaff}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  {isCreatingStaff
                    ? "Creating…"
                    : staffForm.role === "faculty"
                      ? "Create & Send Setup Email"
                      : "Create Admin Account"}
                </button>
              </div>
            </form>
          </section>

          {/* User list */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black text-slate-900">All Users</h2>
              <select
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 outline-none"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {isLoadingUsers && <p className="mt-4 text-sm font-semibold text-slate-500">Loading…</p>}
            {!isLoadingUsers && users.length === 0 && (
              <p className="mt-4 text-sm text-slate-500">No users found.</p>
            )}

            {/* Paginated user table */}
            {!isLoadingUsers && users.length > 0 && (
              <>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-195 border-collapse">
                    <thead>
                      <tr>
                        {["Name", "Email", "Role", "Department", "Status", "Actions"].map((h) => (
                          <th key={h} className="border-b border-slate-200 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((user) => (
                        <tr key={user.id} className="border-b border-slate-100 text-sm">
                          <td className="px-3 py-3">
                            <span className="font-semibold text-slate-900">{user.image}</span>
                            <span className="font-semibold text-slate-900">{user.fullName}</span>
                            {user.role === "faculty" && !user.isPasswordSet && (
                              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                                Pending Setup
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-slate-600">{user.email}</td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${roleBadge[user.role]}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-slate-500">{user.department || "—"}</td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              {user.isActive ? (
                                <button
                                  type="button"
                                  className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                  onClick={() => handleDeactivate(user.id)}
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="rounded-lg border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                                  onClick={() => handleReactivate(user.id)}
                                >
                                  Reactivate
                                </button>
                              )}
                              {user.role === "faculty" && !user.isPasswordSet && (
                                <button
                                  type="button"
                                  className="rounded-lg border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                  onClick={() => handleResendSetup(user.id)}
                                >
                                  Resend Email
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination controls for users table */}
                <Pagination currentPage={usersPage} totalPages={usersTotalPages} onPageChange={setUsersPage} />
              </>
            )}
          </section>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2 — Enrollment Numbers
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === TABS.ENROLLMENT && (
        <>
          {/* Add enrollment number form */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Add Enrollment Number</h1>
            <p className="mt-1 text-sm text-slate-500">
              Seed enrollment numbers so students can register. Format example:{" "}
              <code className="rounded bg-slate-100 px-1 font-mono text-xs">FA21-BCS-001</code>
            </p>

            <form className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={handleAddEnrol}>
              {[
                { key: "enrollmentNumber", label: "Enrollment Number", placeholder: "FA21-BCS-001" },
                { key: "department", label: "Department", placeholder: "Computer Science" },
                { key: "program", label: "Program", placeholder: "BCS" },
                { key: "batch", label: "Batch", placeholder: "FA21" },
              ].map(({ key, label, placeholder }) => (
                <label key={key} className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase outline-none ring-blue-200 focus:ring-2"
                    placeholder={placeholder}
                    value={enrolForm[key]}
                    onChange={(e) => setEnrolForm((p) => ({ ...p, [key]: e.target.value }))}
                    required
                  />
                </label>
              ))}

              <div className="flex items-end sm:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  disabled={isAddingEnrol}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {isAddingEnrol ? "Adding…" : "Add Enrollment Number"}
                </button>
              </div>
            </form>
          </section>

          {/* Enrollment numbers list */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black text-slate-900">Enrollment Numbers</h2>
              <select
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 outline-none"
                value={enrolFilter}
                onChange={(e) => setEnrolFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="unused">Available</option>
                <option value="used">Used</option>
              </select>
            </div>

            {isLoadingEnrol && <p className="mt-4 text-sm font-semibold text-slate-500">Loading…</p>}
            {!isLoadingEnrol && enrolRecords.length === 0 && (
              <p className="mt-4 text-sm text-slate-500">No enrollment numbers found.</p>
            )}

            {/* Paginated enrollment table */}
            {!isLoadingEnrol && enrolRecords.length > 0 && (
              <>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-175 border-collapse">
                    <thead>
                      <tr>
                        {["Enrollment #", "Department", "Program", "Batch", "Status", "Used By", ""].map((h) => (
                          <th key={h} className="border-b border-slate-200 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEnrol.map((r) => (
                        <tr key={r._id} className="border-b border-slate-100 text-sm">
                          <td className="px-3 py-3 font-mono font-semibold text-slate-800">{r.enrollmentNumber}</td>
                          <td className="px-3 py-3 text-slate-600">{r.department}</td>
                          <td className="px-3 py-3 text-slate-600">{r.program}</td>
                          <td className="px-3 py-3 text-slate-600">{r.batch}</td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${r.isUsed ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"}`}>
                              {r.isUsed ? "Used" : "Available"}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-slate-500">
                            {r.usedBy ? r.usedBy.fullName : "—"}
                          </td>
                          <td className="px-3 py-3">
                            {!r.isUsed && (
                              <button
                                type="button"
                                className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                onClick={() => handleDeleteEnrol(r._id)}
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination controls for enrollment table */}
                <Pagination currentPage={enrolPage} totalPages={enrolTotalPages} onPageChange={setEnrolPage} />
              </>
            )}
          </section>
        </>
      )}
      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3 — Semester Promotion
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === TABS.SEMESTER && (
        <div className="space-y-6">

          {/* ── Promotion form ── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Semester Promotion</h1>
            <p className="mt-1 text-sm text-slate-500">
              Bulk-update the current semester for an entire batch after exams. Preview affected students before applying.
            </p>

            <form className="mt-6 space-y-5" onSubmit={handleSemesterPreview}>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Programme */}
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Programme</span>
                  <select
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium outline-none ring-blue-200 focus:ring-2"
                    value={semForm.programmeCode}
                    onChange={(e) => { setSemForm((p) => ({ ...p, programmeCode: e.target.value })); setPreviewStudents(null); setPromoteResult(null); }}
                  >
                    <option value="">Select programme…</option>
                    {programmes.map((p) => (
                      <option key={p.id} value={p.code}>{p.code} — {p.name}</option>
                    ))}
                  </select>
                </label>

                {/* Batch */}
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Batch</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FA21"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none ring-blue-200 focus:ring-2"
                    value={semForm.batch}
                    onChange={(e) => { setSemForm((p) => ({ ...p, batch: e.target.value })); setPreviewStudents(null); setPromoteResult(null); }}
                  />
                </label>
              </div>

              {/* Action */}
              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Action</span>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: "set", label: "Set to specific semester", desc: "Assign a fixed semester — use for new batches or corrections." },
                    { value: "increment", label: "Promote (+1 semester)", desc: "Bump everyone up one semester after exams. Only applies to students with a semester already assigned." },
                  ].map(({ value, label, desc }) => (
                    <label
                      key={value}
                      className={`flex flex-1 cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${semForm.action === value
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      <input
                        type="radio"
                        name="action"
                        value={value}
                        checked={semForm.action === value}
                        onChange={() => { setSemForm((p) => ({ ...p, action: value })); setPreviewStudents(null); setPromoteResult(null); }}
                        className="mt-0.5 accent-blue-600"
                      />
                      <div>
                        <p className={`text-sm font-bold ${semForm.action === value ? "text-blue-700" : "text-slate-700"}`}>{label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Target semester (only for "set") */}
              {semForm.action === "set" && (
                <label className="block max-w-xs">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Target Semester</span>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none ring-blue-200 focus:ring-2"
                    value={semForm.semester}
                    onChange={(e) => setSemForm((p) => ({ ...p, semester: e.target.value }))}
                  />
                </label>
              )}

              <button
                type="submit"
                disabled={isPreviewing || !semForm.programmeCode || !semForm.batch}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
              >
                {isPreviewing ? (
                  <><div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700" /> Fetching preview…</>
                ) : (
                  <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> Preview Affected Students</>
                )}
              </button>
            </form>
          </section>

          {/* ── Preview results ── */}
          {previewStudents !== null && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {previewStudents.length === 0 ? "No students found" : `${previewStudents.length} student(s) will be updated`}
                  </h2>
                  {previewStudents.length > 0 && (
                    <p className="mt-0.5 text-sm text-slate-500">
                      {semForm.action === "set"
                        ? `All will be set to Semester ${semForm.semester}.`
                        : "All with an assigned semester will be promoted by +1."}
                    </p>
                  )}
                </div>
                {previewStudents.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSemesterPromote}
                    disabled={isPromoting}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isPromoting ? (
                      <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Applying…</>
                    ) : (
                      <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Apply Promotion</>
                    )}
                  </button>
                )}
              </div>

              {previewStudents.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-120 border-collapse">
                    <thead>
                      <tr>
                        {["Student", "Enrollment #", "Current Semester", "After Promotion"].map((h) => (
                          <th key={h} className="border-b border-slate-200 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewStudents.map((s) => {
                        const after = semForm.action === "set"
                          ? Number(semForm.semester)
                          : s.currentSemester != null ? s.currentSemester + 1 : "—";
                        return (
                          <tr key={s.id} className="border-b border-slate-100 text-sm">
                            <td className="px-3 py-2.5 font-semibold text-slate-900">{s.fullName}</td>
                            <td className="px-3 py-2.5 font-mono text-slate-500">{s.enrollmentNumber || "—"}</td>
                            <td className="px-3 py-2.5">
                              {s.currentSemester != null
                                ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">Semester {s.currentSemester}</span>
                                : <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">Not set</span>}
                            </td>
                            <td className="px-3 py-2.5">
                              {after !== "—"
                                ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Semester {after}</span>
                                : <span className="text-xs text-slate-400">Skipped (no semester)</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* ── Success result ── */}
          {promoteResult && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-emerald-800">
                  {promoteResult.count} student(s) updated successfully.
                </p>
                <p className="mt-0.5 text-xs text-emerald-700">
                  {promoteResult.action === "set"
                    ? `All set to Semester ${promoteResult.semester}.`
                    : "All eligible students promoted by +1 semester."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

    </MotionPage>
  );
};

export default AdminUsersPage;
