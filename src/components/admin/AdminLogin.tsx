import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Moon, ShieldCheck, Sparkles, Sun, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getSessionToken, getSessionUser, saveSession } from "@/lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [name, setName] = useState("Thiri");
  const [password, setPassword] = useState("Thiri@2004!");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
    localStorage.setItem("color-theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  useEffect(() => {
    if (getSessionToken("admin") && getSessionUser("admin")?.role === "admin") navigate("/admin", { replace: true });
  }, [navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api<{ token: string; user: { id: number; name: string; role: "admin" } }>("/auth/admin/login", { method: "POST", body: JSON.stringify({ name, password }) });
      saveSession(result.token, result.user);
      navigate("/admin");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to log in");
    } finally { setLoading(false); }
  };

  return <main className="relative min-h-screen overflow-hidden bg-[#f7f5fa] text-slate-950 transition-colors dark:bg-[#0d0a11] dark:text-stone-100">
    <div className="absolute -left-32 -top-40 size-[32rem] rounded-full bg-violet-200/25 blur-3xl dark:bg-violet-700/10" />
    <div className="absolute -bottom-48 right-0 size-[34rem] rounded-full bg-violet-100/50 blur-3xl dark:bg-violet-500/8" />
    <button type="button" onClick={() => setDarkMode((current) => !current)} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} title={darkMode ? "Light mode" : "Dark mode"} className="absolute right-5 top-5 z-20 grid size-11 place-items-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10">{darkMode ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}</button>

    <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[.95fr_1.05fr] lg:px-12 xl:gap-18">
      <section className="hidden lg:block">
        <Link to="/" className="inline-flex items-center gap-3"><span className="grid size-13 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-white/8 dark:ring-white/10"><img src="/logo.png" alt="" className="size-11 object-contain" /></span><span><strong className="block text-lg">Charm & Grace</strong><small className="text-[10px] font-semibold uppercase tracking-[.2em] text-slate-400">Administration</small></span></Link>
        <div className="mt-16 max-w-xl"><span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.2em] text-violet-600 dark:border-violet-300/20 dark:bg-violet-300/10 dark:text-violet-200"><Sparkles className="size-3" /> Store management</span><h1 className="mt-7 text-5xl font-semibold leading-[.98] tracking-[-.055em] xl:text-7xl">Run your store with clarity.</h1><p className="mt-6 max-w-lg text-base leading-7 text-slate-500 dark:text-stone-400">A focused workspace for products, orders, customers and real-time support—all in one place.</p></div>
        <div className="mt-11 grid max-w-xl gap-3 sm:grid-cols-3">{["Commerce overview", "Order decisions", "Customer support"].map((item) => <div key={item} className="rounded-2xl border border-slate-200/80 bg-white/65 p-4 backdrop-blur dark:border-white/8 dark:bg-white/[.035]"><Check className="size-4 text-violet-400 dark:text-violet-200" /><p className="mt-4 text-xs font-semibold">{item}</p></div>)}</div>
      </section>

      <section className="mx-auto w-full max-w-lg">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-[0_35px_100px_-45px_rgba(46,16,101,.35)] backdrop-blur-xl dark:border-white/10 dark:bg-[#17121e]/95 dark:shadow-[0_38px_110px_-45px_rgba(0,0,0,.9)]">
          <div className="border-b border-slate-100 px-7 py-7 dark:border-white/8 sm:px-9"><div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-violet-300 dark:text-violet-950"><ShieldCheck className="size-5" /></span><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-violet-400 dark:text-violet-200">Secure access</p><h2 className="mt-1 text-2xl font-semibold tracking-[-.035em]">Welcome back</h2></div></div><p className="mt-5 text-sm leading-6 text-slate-500 dark:text-stone-400">Sign in with the administrator account to continue to your workspace.</p></div>

          <form onSubmit={submit} className="px-7 py-7 sm:px-9 sm:py-8">
            <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4 dark:border-violet-300/15 dark:bg-violet-300/[.07]"><div className="flex items-start gap-3"><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-white text-violet-500 shadow-sm dark:bg-white/8 dark:text-violet-200"><Sparkles className="size-3.5" /></span><div><strong className="text-xs">Demo access is ready</strong><p className="mt-1 text-[11px] leading-5 text-violet-600/80 dark:text-violet-200/65">The administrator credentials are prefilled. Simply select the sign-in button below.</p></div></div></div>

            {error && <p role="alert" className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-600 dark:border-violet-300/15 dark:bg-violet-300/10 dark:text-violet-200">{error}</p>}

            <label className="mt-6 block text-xs font-semibold text-slate-700 dark:text-stone-300">Administrator name<span className="relative mt-2 block"><UserRound className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input required autoComplete="username" value={name} onChange={(event) => setName(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50 dark:border-white/10 dark:bg-white/5 dark:focus:border-violet-300/35 dark:focus:bg-white/8 dark:focus:ring-violet-300/10" /></span></label>
            <label className="mt-5 block text-xs font-semibold text-slate-700 dark:text-stone-300">Password<span className="relative mt-2 block"><LockKeyhole className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input required autoComplete="current-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-12 text-sm outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50 dark:border-white/10 dark:bg-white/5 dark:focus:border-violet-300/35 dark:focus:bg-white/8 dark:focus:ring-violet-300/10" /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/8 dark:hover:text-white">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label>

            <button disabled={loading} className="group mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-violet-500 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-violet-300 dark:text-violet-950 dark:hover:bg-violet-200">{loading ? "Opening workspace…" : "Sign in to admin"}<ArrowRight className={`size-4 transition-transform ${loading ? "animate-pulse" : "group-hover:translate-x-1"}`} /></button>
            <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-slate-400"><LockKeyhole className="size-3" /> Admin and customer sessions remain separate</div>
          </form>
        </div>
        <p className="mt-5 text-center text-[11px] text-slate-400">Want to browse the store? <Link to="/" className="font-semibold text-slate-600 hover:text-violet-500 dark:text-stone-300 dark:hover:text-violet-200">Return to storefront</Link></p>
      </section>
    </div>
  </main>;
}
