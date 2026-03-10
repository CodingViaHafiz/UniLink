import { Link } from "react-router-dom";
import { MotionPage } from "../lib/motion";

const NotFoundPage = () => {
  return (
    <MotionPage className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">404</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">The page you requested does not exist.</p>
        <Link className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white" to="/home">
          Go Home
        </Link>
      </section>
    </MotionPage>
  );
};

export default NotFoundPage;
