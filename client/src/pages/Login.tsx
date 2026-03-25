import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      console.log(res.data);
      
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen min-h-dvh bg-amber-50 flex items-center justify-center px-4 py-8 sm:px-6"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 20% 50%, rgba(210,180,140,0.2) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(188,164,130,0.15) 0%, transparent 50%)",
      }}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-[#fdfaf4] rounded-sm relative overflow-hidden"
        style={{
          boxShadow:
            "0 1px 2px rgba(0,0,0,0.06), 0 8px 32px rgba(139,109,56,0.14), 0 24px 64px rgba(139,109,56,0.1), inset 0 0 0 1px rgba(180,155,110,0.18)",
          animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        <style>{`
          @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
          @keyframes shake  { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
        `}</style>

        {/* Top accent bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        {/* Notebook margin line — hidden on very small screens */}
        <div className="hidden sm:block absolute left-11 top-3 bottom-3 w-px bg-rose-300/30 pointer-events-none" />

        {/* Responsive padding: tighter on mobile, roomier on sm+ */}
        <div className="px-5 py-7 sm:px-10 sm:py-9">

          {/* Brand */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2.5 sm:mb-3 bg-gradient-to-br from-amber-400 to-amber-700 rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-amber-600/25">
              📝
            </div>
            <h1 className="font-serif text-xl sm:text-[1.65rem] font-semibold text-stone-800 tracking-tight">
              TaskFlow
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 italic font-serif">
              your quiet space to think &amp; record
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 sm:mb-5"
              style={{ animation: "shake 0.4s ease" }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-[0.65rem] sm:text-[0.68rem] font-bold text-stone-400 uppercase tracking-widest mb-1 sm:mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-amber-50/60 border border-amber-200 rounded-lg text-sm text-stone-800 placeholder:text-stone-300 placeholder:italic outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[0.65rem] sm:text-[0.68rem] font-bold text-stone-400 uppercase tracking-widest mb-1 sm:mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-amber-50/60 border border-amber-200 rounded-lg text-sm text-stone-800 placeholder:text-stone-300 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 bg-gradient-to-br from-amber-500 to-amber-700 text-amber-50 text-sm font-bold rounded-lg shadow-md shadow-amber-600/30 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-600/40 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-amber-200/40 border-t-amber-100 rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-dashed border-amber-200 text-center text-xs sm:text-sm text-stone-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-amber-700 font-bold hover:text-amber-900 hover:underline transition-colors"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;