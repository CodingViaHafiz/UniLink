import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import HomeNavbar from "../components/home/HomeNavbar";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";
import { MotionPage } from "../lib/motion";

const typeLabels = {
  notes: "Notes",
  "past-papers": "Past Papers",
  timetable: "Timetable",
};

const ResourcesTypePage = () => {
  const { type } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const title = useMemo(() => typeLabels[type] || "Resources", [type]);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await apiFetch(`/resources/${type}`, { method: "GET" });
        setResources(data.resources || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (typeLabels[type]) {
      loadResources();
    } else {
      setIsLoading(false);
      setResources([]);
      setError("Unknown resource type.");
    }
  }, [type]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <MotionPage className="min-h-screen bg-slate-50">
      <HomeNavbar user={user} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">Resources</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{title}</h1>
            <p className="mt-2 text-sm text-slate-600">Download verified academic material shared by faculty and admins.</p>
          </div>
          <Link
            to="/home"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600"
          >
            Back to Home
          </Link>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">
            Loading resources...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">{error}</div>
        )}

        {!isLoading && !error && resources.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">
            No resources uploaded yet.
          </div>
        )}

        {!isLoading && !error && resources.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {resources.map((resource) => (
              <article key={resource.id} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">{resource.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{resource.description || "No description provided."}</p>
                <div className="mt-4 text-xs font-semibold text-slate-500">
                  <p>Uploaded by {resource.uploadedBy}</p>
                  <p>{new Date(resource.createdAt).toLocaleDateString()}</p>
                </div>
                <a
                  href={resource.fileUrl}
                  className="mt-4 inline-flex w-fit rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </a>
              </article>
            ))}
          </div>
        )}
      </section>
    </MotionPage>
  );
};

export default ResourcesTypePage;
