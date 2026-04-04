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
  const [resendEmail, setResendEmail] = useState("");
  const [resendState, setResendState] = useState("idle"); // idle | sending | sent | error
  const [resendMessage, setResendMessage] = useState("");

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

  const handleResend = async (e) => {
    e.preventDefault();
    setResendState("sending");
    try {
      const data = await apiFetch("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: resendEmail }),
      });
      setResendState("sent");
      setResendMessage(data.message);
    } catch (err) {
      setResendState("error");
      setResendMessage(err.message || "Failed to resend. Please try again.");
    }
  };

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

            {resendState !== "sent" ? (
              <form onSubmit={handleResend} className="mt-5 space-y-3 text-left">
                <p className="text-center text-xs text-slate-400">Need a new link? Enter your email below.</p>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={resendState === "sending"}
                  className="btn-press w-full rounded-xl bg-sky-500 py-2.5 text-sm font-bold text-white hover:bg-sky-600 disabled:opacity-60"
                >
                  {resendState === "sending" ? "Sending..." : "Resend Verification Email"}
                </button>
                {resendState === "error" && (
                  <p className="text-center text-xs text-rose-500">{resendMessage}</p>
                )}
              </form>
            ) : (
              <p className="mt-4 text-sm font-medium text-emerald-600">{resendMessage}</p>
            )}

            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="btn-press mt-3 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
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
