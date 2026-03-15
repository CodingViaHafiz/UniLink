import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { MotionPage } from "../../lib/motion";
import { notifyError, notifySuccess } from "../../lib/toast";

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
  admin:   "bg-purple-100 text-purple-700",
  faculty: "bg-blue-100 text-blue-700",
  student: "bg-slate-100 text-slate-600",
};

// ─── Staff creation form state ────────────────────────────────────────────────
const emptyStaffForm = { fullName: "", email: "", role: "faculty", department: "", password: "" };

// ─── Enrollment number form state ─────────────────────────────────────────────
const emptyEnrolForm = { enrollmentNumber: "", department: "", program: "", batch: "" };

// ─── Sub-section tab ──────────────────────────────────────────────────────────
const TABS = { STAFF: "staff", ENROLLMENT: "enrollment" };

const AdminUsersPage = () => {
  const [activeTab, setActiveTab] = useState(TABS.STAFF);

  // ── Users state ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [filterRole, setFilterRole] = useState("");

  // ── Staff form state ─────────────────────────────────────────────────────────
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);

  // ── Enrollment state ─────────────────────────────────────────────────────────
  const [enrolRecords, setEnrolRecords] = useState([]);
  const [isLoadingEnrol, setIsLoadingEnrol] = useState(false);
  const [enrolForm, setEnrolForm] = useState(emptyEnrolForm);
  const [isAddingEnrol, setIsAddingEnrol] = useState(false);
  const [enrolFilter, setEnrolFilter] = useState("all"); // "all" | "used" | "unused"

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

  return (
    <MotionPage className="space-y-6">

      {/* ── Tab switcher ── */}
      <div className="flex gap-2 border-b border-slate-200 pb-1">
        {[
          { key: TABS.STAFF,      label: "Staff Accounts" },
          { key: TABS.ENROLLMENT, label: "Enrollment Numbers" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`rounded-t-lg px-4 py-2 text-sm font-bold transition-colors ${
              activeTab === key
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

            {!isLoadingUsers && users.length > 0 && (
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
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-slate-100 text-sm">
                        <td className="px-3 py-3">
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
                { key: "department",       label: "Department",        placeholder: "Computer Science" },
                { key: "program",          label: "Program",           placeholder: "BCS" },
                { key: "batch",            label: "Batch",             placeholder: "FA21" },
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

            {!isLoadingEnrol && enrolRecords.length > 0 && (
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
                    {enrolRecords.map((r) => (
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
            )}
          </section>
        </>
      )}
    </MotionPage>
  );
};

export default AdminUsersPage;
