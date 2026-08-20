import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import GoogleSignIn from "./GoogleSignIn";

type SharedProps = {
  error: string;
  loading: boolean;
  onGoogle: (credential: string) => void;
  onSubmit: () => Promise<void>;
};

type LoginProps = SharedProps & {
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
};

type SignupProps = SharedProps & LoginProps & {
  name: string;
  confirmation: string;
  setName: (value: string) => void;
  setConfirmation: (value: string) => void;
};

export function CustomerLogin({ email, password, error, loading, setEmail, setPassword, onGoogle, onSubmit }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  return <AuthShell eyebrow="Welcome back" title="Sign in to your account" description="Continue to your saved favourites, orders and personal beauty space." icon={<LockKeyhole />}>
    {error && <AuthError message={error} />}
    <SocialSection onGoogle={onGoogle} label="or continue with email" />
    <form onSubmit={(event) => { event.preventDefault(); void onSubmit(); }} className="space-y-5">
      <AuthField icon={<Mail />} label="Email address" type="email" autoComplete="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <PasswordField label="Password" autoComplete="current-password" value={password} onChange={setPassword} shown={showPassword} onToggle={() => setShowPassword((current) => !current)} placeholder="Enter your password" />
      <div className="flex items-center justify-between gap-4"><label className="flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400"><input type="checkbox" className="size-4 rounded border-slate-300 accent-violet-500" />Remember me</label><Link to="/forgot-password" className="text-xs font-semibold text-slate-700 transition hover:text-violet-500 dark:text-stone-300 dark:hover:text-violet-200">Forgot password?</Link></div>
      <SubmitButton loading={loading} idle="Sign in" loadingLabel="Signing you in…" />
    </form>
    <p className="mt-7 text-center text-sm text-slate-500 dark:text-stone-400">New to Charm & Grace? <Link to="/signup" className="font-semibold text-slate-950 transition hover:text-violet-500 dark:text-stone-100 dark:hover:text-violet-200">Create an account</Link></p>
    <LegalNotice />
  </AuthShell>;
}

export function CustomerSignup({ name, email, password, confirmation, error, loading, setName, setEmail, setPassword, setConfirmation, onGoogle, onSubmit }: SignupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const passwordChecks = [
    { label: "8–128 characters", met: password.length >= 8 && password.length <= 128 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter", met: /[a-z]/.test(password) },
    { label: "Number", met: /\d/.test(password) },
    { label: "Special character", met: /[^A-Za-z0-9\s]/.test(password) },
  ];
  const passwordReady = passwordChecks.every((item) => item.met);
  return <AuthShell eyebrow="Create your account" title="Join Charm & Grace" description="Save favourites, follow orders and chat privately with our beauty team." icon={<UserRound />} wide>
    {error && <AuthError message={error} />}
    <SocialSection onGoogle={onGoogle} label="or register with email" />
    <form onSubmit={(event) => { event.preventDefault(); void onSubmit(); }} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2"><AuthField icon={<UserRound />} label="Full name" autoComplete="name" value={name} onChange={setName} placeholder="Your full name" /><AuthField icon={<Mail />} label="Email address" type="email" autoComplete="email" value={email} onChange={setEmail} placeholder="you@example.com" /></div>
      <PasswordField label="Password" autoComplete="new-password" value={password} onChange={setPassword} shown={showPassword} onToggle={() => setShowPassword((current) => !current)} onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)} placeholder="Create a strong password" minimum={8} maximum={128} />
      <div className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ${passwordFocused && !passwordReady ? "mt-0 grid-rows-[1fr] opacity-100" : "-mt-4 grid-rows-[0fr] opacity-0"}`} aria-hidden={!passwordFocused || passwordReady}><div className="overflow-hidden"><div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl bg-slate-50 p-4 dark:bg-white/[.04] sm:grid-cols-3">{passwordChecks.map((item) => <p key={item.label} className={`flex items-center gap-1.5 text-[10px] transition-colors ${item.met ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-stone-500"}`}><span className={`grid size-4 shrink-0 place-items-center rounded-full transition-colors ${item.met ? "bg-emerald-50 dark:bg-emerald-400/10" : "bg-slate-100 dark:bg-white/5"}`}>{item.met ? <Check className="size-2.5" /> : <span className="size-1 rounded-full bg-current" />}</span>{item.label}</p>)}</div></div></div>
      <PasswordField label="Confirm password" autoComplete="new-password" value={confirmation} onChange={setConfirmation} shown={showPassword} onToggle={() => setShowPassword((current) => !current)} placeholder="Enter your password again" />
      <label className="flex items-start gap-3 pt-1 text-xs leading-5 text-slate-500 dark:text-stone-400"><input required checked={accepted} onChange={(event) => setAccepted(event.target.checked)} type="checkbox" className="mt-0.5 size-4 shrink-0 accent-violet-500" /><span>I agree to the <Link to="/terms" className="font-semibold text-slate-700 underline underline-offset-2 dark:text-stone-200">Terms</Link> and <Link to="/privacy" className="font-semibold text-slate-700 underline underline-offset-2 dark:text-stone-200">Privacy Policy</Link>.</span></label>
      <SubmitButton loading={loading || !accepted || !passwordReady} idle="Create account" loadingLabel={loading ? "Creating your account…" : !passwordReady ? "Complete password requirements" : "Accept the terms to continue"} />
    </form>
    <p className="mt-7 text-center text-sm text-slate-500 dark:text-stone-400">Already have an account? <Link to="/login" className="font-semibold text-slate-950 transition hover:text-violet-500 dark:text-stone-100 dark:hover:text-violet-200">Sign in</Link></p>
  </AuthShell>;
}

function AuthShell({ eyebrow, title, description, icon, children, wide = false }: { eyebrow: string; title: string; description: string; icon: ReactNode; children: ReactNode; wide?: boolean }) {
  return <main className="relative isolate min-h-[calc(100vh-132px)] overflow-hidden bg-[#faf8f7] px-5 py-10 dark:bg-[#0f0c14] sm:px-6 sm:py-14"><div className="pointer-events-none absolute left-1/2 top-16 -z-10 size-96 -translate-x-1/2 rounded-full bg-violet-200/25 blur-3xl dark:bg-violet-500/10" /><div className="pointer-events-none absolute bottom-0 right-[12%] -z-10 size-64 rounded-full bg-stone-200/40 blur-3xl dark:bg-violet-300/5" /><div className={`mx-auto ${wide ? "max-w-2xl" : "max-w-lg"}`}><Link to="/" className="mx-auto flex w-fit items-center gap-3"><img src="/logo.png" alt="" className="size-11 object-contain" /><span className="[font-family:var(--font-editorial)] text-xl font-semibold tracking-[-.03em] text-slate-950 dark:text-stone-100">Charm & Grace</span></Link><section className="mt-8 rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_30px_90px_-55px_rgba(45,25,60,.45)] backdrop-blur-xl dark:border-white/10 dark:bg-[#17131d]/95 sm:p-9"><div className="flex items-start justify-between gap-5"><span className="grid size-11 place-items-center rounded-2xl bg-violet-50 text-violet-400 dark:bg-violet-300/10 dark:text-violet-200 [&>svg]:size-5">{icon}</span><span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.15em] text-slate-400 dark:text-stone-500"><ShieldCheck className="size-3.5" />Secure access</span></div><p className="mt-7 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.22em] text-violet-400 dark:text-violet-200"><Sparkles className="size-3" />{eyebrow}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] text-slate-950 dark:text-stone-100 sm:text-5xl">{title}</h1><p className="mt-4 max-w-lg text-sm leading-6 text-slate-500 dark:text-stone-400">{description}</p>{children}</section></div></main>;
}

function SocialSection({ onGoogle, label }: { onGoogle: (credential: string) => void; label: string }) { return <><div className="mt-7"><GoogleSignIn onCredential={onGoogle} /></div><div className="my-6 flex items-center gap-4"><span className="h-px flex-1 bg-slate-200 dark:bg-white/10" /><span className="text-[9px] font-semibold uppercase tracking-[.17em] text-slate-400">{label}</span><span className="h-px flex-1 bg-slate-200 dark:bg-white/10" /></div></>; }
function AuthError({ message }: { message: string }) { return <p role="alert" className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-600 dark:border-violet-300/15 dark:bg-violet-300/10 dark:text-violet-200">{message}</p>; }

function AuthField({ icon, label, type = "text", autoComplete, value, onChange, placeholder }: { icon: ReactNode; label: string; type?: string; autoComplete: string; value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="block text-sm font-semibold text-slate-700 dark:text-stone-300">{label}<span className="relative mt-2 block"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-stone-500 [&>svg]:size-4">{icon}</span><input required type={type} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-13 w-full rounded-2xl border border-slate-200 bg-[#faf9f8] pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100/60 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:placeholder:text-stone-600 dark:hover:border-white/20 dark:focus:border-violet-300/40 dark:focus:bg-white/[.07] dark:focus:ring-violet-300/10" /></span></label>; }

function PasswordField({ label, autoComplete, value, onChange, shown, onToggle, onFocus, onBlur, placeholder, minimum, maximum }: { label: string; autoComplete: string; value: string; onChange: (value: string) => void; shown: boolean; onToggle: () => void; onFocus?: () => void; onBlur?: () => void; placeholder: string; minimum?: number; maximum?: number }) { return <label className="block text-sm font-semibold text-slate-700 dark:text-stone-300">{label}<span className="relative mt-2 block"><LockKeyhole className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-stone-500" /><input required minLength={minimum} maxLength={maximum} autoComplete={autoComplete} type={shown ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder={placeholder} className="h-13 w-full rounded-2xl border border-slate-200 bg-[#faf9f8] pl-11 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100/60 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:placeholder:text-stone-600 dark:hover:border-white/20 dark:focus:border-violet-300/40 dark:focus:bg-white/[.07] dark:focus:ring-violet-300/10" /><button type="button" onClick={onToggle} aria-label={shown ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-500 dark:text-stone-500 dark:hover:text-violet-200">{shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label>; }

function SubmitButton({ loading, idle, loadingLabel }: { loading: boolean; idle: string; loadingLabel: string }) { return <button disabled={loading} className="group mt-1 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-[0_14px_35px_-18px_rgba(15,23,42,.7)] transition hover:-translate-y-0.5 hover:bg-violet-400 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-violet-300 dark:text-violet-950 dark:hover:bg-violet-200">{loading ? loadingLabel : idle}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></button>; }
function LegalNotice() { return <p className="mt-8 text-center text-[10px] leading-5 text-slate-400 dark:text-stone-500">By continuing, you agree to our <Link to="/terms" className="underline underline-offset-2">Terms</Link> and <Link to="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.</p>; }
