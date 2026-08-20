import { AlertCircle, ArrowRight, Camera, Check, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

const links = [
  { title: "Shop", items: [["All products", "/products"], ["New arrivals", "/products"], ["Wishlist", "/wishlist"]] },
  { title: "Help", items: [["Contact", "/contact"], ["FAQs", "/faq"], ["Shipping & returns", "/shipping-returns"]] },
  { title: "Company", items: [["About us", "/about"], ["Privacy", "/privacy"], ["Terms", "/terms"]] },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [joining, setJoining] = useState(false);

  const subscribe = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || joining) return;
    setJoining(true);
    setNotice(null);
    try {
      const result = await api<{ message: string; code: string }>("/newsletter", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail }),
      });
      setNotice({ type: "success", text: `${result.message} Your welcome code is ${result.code}.` });
      setEmail("");
    } catch (reason) {
      setNotice({ type: "error", text: reason instanceof Error ? reason.message : "We could not subscribe you right now. Please try again." });
    } finally {
      setJoining(false);
    }
  };

  return <footer className="transition-colors duration-300">
    <section className="border-y border-slate-200 bg-[#faf8f6] transition-colors duration-300 dark:border-white/10 dark:bg-[#181418]">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:py-18">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-400 dark:text-violet-200">The Charm & Grace letter</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-stone-100 sm:text-4xl">Take 10% off your first order.</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500 dark:text-stone-400">A thoughtful edit of new arrivals, beauty advice and occasional offers—sent only when there’s something worth sharing.</p>
        </div>
        <div>
          <form onSubmit={(event) => { event.preventDefault(); void subscribe(); }} className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Email for newsletter</span>
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-stone-500" />
              <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" className="h-13 w-full rounded-full border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-slate-600 focus:ring-4 focus:ring-slate-200/60 dark:border-white/15 dark:bg-white/5 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-violet-200/60 dark:focus:bg-white/8 dark:focus:ring-violet-300/10" />
            </label>
            <button type="submit" disabled={joining} className="group relative inline-flex h-13 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-slate-950 px-7 text-sm font-semibold text-white shadow-[0_12px_30px_-18px_rgba(15,23,42,.8)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-400 hover:shadow-[0_18px_36px_-18px_rgba(167,139,250,.7)] active:translate-y-0 active:scale-[.98] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 dark:bg-violet-400 dark:hover:bg-violet-300"><span className="absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-white/20 opacity-0 blur-sm transition-all duration-700 group-hover:left-[125%] group-hover:opacity-100" /><span className="relative">{joining ? "Joining…" : "Join the newsletter"}</span><ArrowRight className={`relative size-4 transition-transform duration-300 ${joining ? "animate-pulse" : "group-hover:translate-x-1"}`} /></button>
          </form>
          {notice ? <p role={notice.type === "error" ? "alert" : "status"} className={`mt-3 flex items-start gap-2 text-xs leading-5 ${notice.type === "success" ? "text-emerald-700" : "text-violet-600"}`}>{notice.type === "success" ? <Check className="mt-0.5 size-3.5 shrink-0" /> : <AlertCircle className="mt-0.5 size-3.5 shrink-0" />}{notice.text}</p> : <p className="mt-3 text-[11px] text-slate-400">Your welcome code will appear after subscribing. Unsubscribe at any time.</p>}
        </div>
      </div>
    </section>
    <div className="bg-slate-950 text-white transition-colors duration-300 dark:bg-[#0b090b]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div><Link to="/" className="flex items-center gap-3 text-lg font-semibold"><img src="/logo.png" alt="" className="size-11 rounded-xl bg-white object-contain p-1" /> Charm & Grace</Link><p className="mt-5 max-w-sm text-sm leading-6 text-slate-400 dark:text-stone-500">Thoughtfully selected beauty for every mood, every moment and every version of you.</p></div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">{links.map((group) => <div key={group.title}><h2 className="text-sm font-semibold text-white">{group.title}</h2><ul className="mt-5 space-y-3">{group.items.map(([label, href]) => <li key={label}><Link to={href} className="group/link inline-flex items-center text-sm text-slate-400 transition-colors hover:text-white dark:text-stone-500 dark:hover:text-violet-100"><span className="transition-transform duration-200 group-hover/link:translate-x-1">{label}</span></Link></li>)}</ul></div>)}</div>
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 dark:border-white/8 dark:text-stone-600"><p>© 2026 Charm & Grace. All rights reserved.</p><div className="flex items-center gap-4"><Camera className="size-4" /><Link to="/admin" className="transition hover:text-white dark:hover:text-violet-100">Admin</Link></div></div>
      </div>
    </div>
  </footer>;
}
