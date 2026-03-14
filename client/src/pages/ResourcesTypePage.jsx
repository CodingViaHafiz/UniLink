import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import HomeNavbar from "../components/home/HomeNavbar";
import ResourceViewerModal from "../components/resources/ResourceViewerModal";
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
  const [viewing, setViewing] = useState(null); // resource currently open in modal

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
            <p className="mt-2 text-sm text-slate-600">
              Browse and preview verified academic material shared by faculty and admins.
            </p>
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
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {!isLoading && !error && resources.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">
            No resources uploaded yet.
          </div>
        )}

        {!isLoading && !error && resources.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {resources.map((resource) => (
              <article
                key={resource.id}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-lg font-bold text-slate-900">{resource.title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">
                  {resource.description || "No description provided."}
                </p>
                <div className="mt-4 text-xs font-semibold text-slate-400">
                  <p>Uploaded by {resource.uploadedBy}</p>
                  <p>{new Date(resource.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setViewing(resource)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-sky-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Read / View
                  </button>
                  <a
                    href={resource.fileUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* File viewer modal */}
      {viewing && (
        <ResourceViewerModal resource={viewing} onClose={() => setViewing(null)} />
      )}
    </MotionPage>
  );
};

export default ResourcesTypePage;
