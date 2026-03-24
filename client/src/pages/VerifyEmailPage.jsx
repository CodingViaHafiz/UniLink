import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { MotionPage } from "../lib/motion";

const STATUS = { LOADING: "loading", SUCCESS: "success", ERROR: "error" };

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(STATUS.LOADING);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const data = await apiFetch(`/auth/verify-email/${token}`, { method: "POST" });
        setStatus(STATUS.SUCCESS);
        setMessage(data.message);
      } catch (err) {
        setStatus(STATUS.ERROR);
        setMessage(err.message || "Verification failed.");
      }
    };

    if (token) verify();
  }, [token]);

  return (
    <MotionPage className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {status === STATUS.LOADING && (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
            <h2 className="mt-5 text-lg font-black text-slate-900">Verifying your email...</h2>
            <p className="mt-1 text-sm text-slate-500">Please wait while we confirm your email address.</p>
          </>
        )}

        {status === STATUS.SUCCESS && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-5 text-lg font-black text-emerald-900">Email Verified!</h2>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="btn-press mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
            >
              Go to Login
            </button>
          </>
        )}

        {status === STATUS.ERROR && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-5 text-lg font-black text-slate-900">Verification Failed</h2>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="btn-press mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </MotionPage>
  );
};

export default VerifyEmailPage;
