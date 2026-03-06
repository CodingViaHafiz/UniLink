import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

const FacultyDashboardPage = () => {
  const [form, setForm] = useState({ title: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      await apiFetch("/blogs", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage("Blog published successfully.");
      setForm({ title: "", content: "" });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Faculty Dashboard</h1>
          <Link className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700" to="/home">
            Back to Home
          </Link>
        </div>
        <p className="text-sm text-slate-600">Publish verified academic blogs visible to all users on the Home page.</p>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Blog Title</span>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Content</span>
            <textarea
              className="h-40 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              value={form.content}
              onChange={(event) => update("content", event.target.value)}
              required
            />
          </label>

          {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{message}</p>}
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : "Publish Blog"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default FacultyDashboardPage;
