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

const emptyForm = {
  fullName: "",
  email: "",
  password: "",
  role: "faculty",
  department: "",
};

const roleBadge = {
  admin: "bg-purple-100 text-purple-700",
  faculty: "bg-blue-100 text-blue-700",
  student: "bg-slate-100 text-slate-600",
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterRole, setFilterRole] = useState("");

  const loadUsers = async (role = "") => {
    try {
      setIsLoading(true);
      const query = role ? `?role=${role}` : "";
      const data = await apiFetch(`/auth/users${query}`, { method: "GET" });
      setUsers(data.users || []);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(filterRole);
  }, [filterRole]);

  const handleCreateStaff = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await apiFetch("/auth/staff", {
        method: "POST",
        body: JSON.stringify(form),
      });
      notifySuccess(data.message);
      setUsers((prev) => [data.user, ...prev]);
      setForm(emptyForm);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this account? The user will be unable to log in.")) return;
    try {
      const data = await apiFetch(`/auth/users/${id}/deactivate`, { method: "PATCH" });
      notifySuccess(data.message);
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
    } catch (err) {
      notifyError(err.message);
    }
  };

  const handleReactivate = async (id) => {
    try {
      const data = await apiFetch(`/auth/users/${id}/reactivate`, { method: "PATCH" });
      notifySuccess(data.message);
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
    } catch (err) {
      notifyError(err.message);
    }
  };

  return (
    <MotionPage className="space-y-6">
      {/* Create Staff Account */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Create Staff Account</h1>
        <p className="mt-1 text-sm text-slate-600">
          Create accounts for faculty members or additional admins. Students self-register
          publicly.
        </p>

        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleCreateStaff}>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Full Name
            </span>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              placeholder="e.g. Dr. Ayesha Khan"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Email Address
            </span>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              placeholder="staff@university.edu"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Initial Password
            </span>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              placeholder="Min 8 chars, upper, number, special"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              minLength={8}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Role
            </span>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Department (optional)
            </span>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              value={form.department}
              onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
            >
              <option value="">No department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </section>

      {/* User List */}
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

        {isLoading && (
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading users...</p>
        )}

        {!isLoading && users.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">No users found.</p>
        )}

        {!isLoading && users.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr>
                  {["Name", "Email", "Role", "Department", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="border-b border-slate-200 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 text-sm">
                    <td className="px-3 py-3 font-semibold text-slate-900">{user.fullName}</td>
                    <td className="px-3 py-3 text-slate-600">{user.email}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${roleBadge[user.role]}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-500">{user.department || "—"}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          user.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </MotionPage>
  );
};

export default AdminUsersPage;
