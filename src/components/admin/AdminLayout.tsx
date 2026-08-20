import {
  BadgePercent, Boxes, ChevronDown, CircleHelp, CreditCard, ExternalLink, FolderTree,
  LayoutDashboard, LogOut, Mail, MapPin, Menu, MessageCircle, Moon, Package,
  Search, ShoppingCart, Star, Sun, Truck, Users, X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { adminResources } from "@/data/store";
import { api, clearSession, getSessionToken, getSessionUser } from "@/lib/api";

type SupportMessage = { adminId: number | null; adminRead: number };

const iconByPath: Record<string, ReactNode> = {
  products: <Package />, categories: <FolderTree />, brands: <Boxes />, orders: <ShoppingCart />,
  customers: <Users />, reviews: <Star />, coupons: <BadgePercent />, "delivery-methods": <Truck />,
  deliveries: <MapPin />, "payment-methods": <CreditCard />, messages: <Mail />, chat: <MessageCircle />,
};

const sections = [
  { label: "Catalog", paths: ["products", "categories", "brands", "reviews"] },
  { label: "Commerce", paths: ["orders", "customers", "coupons"] },
  { label: "Operations", paths: ["delivery-methods", "deliveries", "payment-methods"] },
  { label: "Support", paths: ["messages", "chat"] },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [supportCounts, setSupportCounts] = useState({ messages: 0, chat: 0 });
  const navigate = useNavigate();
  const location = useLocation();
  const user = getSessionUser("admin");
  const activePath = location.pathname.split("/")[2] ?? "overview";
  const activeResource = adminResources.find((item) => item.path === activePath);
  const pageName = activePath === "overview" ? "Overview" : activePath === "products" && location.pathname.includes("/new") ? "Add product" : activeResource?.label ?? "Administration";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
    localStorage.setItem("color-theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    setWorkspaceSearch(new URLSearchParams(location.search).get("search") ?? "");
  }, [location.search]);
  useEffect(() => {
    let active = true;
    const loadCounts = async () => {
      try {
        const [messages, chat] = await Promise.all([
          api<unknown[]>("/admin/messages"),
          api<SupportMessage[]>("/admin/chat"),
        ]);
        if (active) setSupportCounts({ messages: messages.length, chat: chat.filter((item) => item.adminId === null && !Number(item.adminRead)).length });
      } catch { /* The active page will surface authentication or API errors. */ }
    };
    void loadCounts();
    const timer = window.setInterval(loadCounts, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const submitWorkspaceSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = workspaceSearch.trim();
    if (!query) return;
    const normalized = query.toLowerCase();
    const directMatch = adminResources.find((item) => item.path === normalized || item.label.toLowerCase() === normalized);
    if (directMatch) { navigate(`/admin/${directMatch.path}`); return; }
    const target = activeResource ? location.pathname : "/admin/products";
    navigate(`${target}?search=${encodeURIComponent(query)}`);
  };

  const signOut = () => { clearSession("admin"); navigate("/admin/login"); };
  if (!getSessionToken("admin") || user?.role !== "admin") return <Navigate to="/admin/login" replace />;

  return <div className="admin-shell min-h-screen bg-[#f6f6f7] text-slate-950 transition-colors dark:bg-[#0f0d10] dark:text-stone-100">
    {open && <button aria-label="Close admin navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 dark:border-white/8 dark:bg-[#16121c] lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-100 px-5 dark:border-white/8">
        <Link to="/admin" className="flex min-w-0 flex-1 items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-50 dark:bg-violet-900/40"><img src="/logo.png" alt="" className="size-9 object-contain" /></span><span className="min-w-0"><strong className="block truncate text-sm">Charm & Grace</strong><small className="block truncate text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">Admin workspace</small></span></Link>
        <button onClick={() => setOpen(false)} aria-label="Close navigation" className="grid size-9 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-white/8 lg:hidden"><X className="size-4" /></button>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-5" aria-label="Admin navigation">
        <AdminLink to="/admin" label="Overview" icon={<LayoutDashboard />} end />
        {sections.map((section) => <div key={section.label} className="mt-7"><p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[.2em] text-slate-400 dark:text-stone-600">{section.label}</p><div className="space-y-1">{section.paths.map((path) => { const item = adminResources.find((resource) => resource.path === path); const count = path === "messages" ? supportCounts.messages : path === "chat" ? supportCounts.chat : undefined; return item ? <AdminLink key={path} to={`/admin/${path}`} label={item.label} count={count} icon={iconByPath[path]} /> : null; })}</div></div>)}
      </nav>
      <div className="shrink-0 border-t border-slate-100 p-4 dark:border-white/8"><div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-white text-violet-400 shadow-sm dark:bg-white/8"><CircleHelp className="size-4" /></span><div><p className="text-xs font-semibold">Need assistance?</p><p className="mt-0.5 text-[10px] text-slate-400">Review customer messages</p></div></div><Link to="/admin/chat" className="mt-3 flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold transition hover:border-violet-100 hover:text-violet-400 dark:border-white/10 dark:bg-white/5">Open live chat</Link></div></div>
    </aside>

    <div className="lg:pl-72">
      <header className="sticky top-0 z-40 flex h-20 items-center gap-3 border-b border-slate-200/80 bg-white/85 px-4 shadow-[0_1px_15px_rgba(15,23,42,.025)] backdrop-blur-xl dark:border-white/8 dark:bg-[#16121c]/90 sm:px-6 lg:px-8">
        <button onClick={() => setOpen(true)} aria-label="Open admin navigation" className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/8 lg:hidden"><Menu className="size-5" /></button>
        <div className="hidden min-w-0 sm:block"><p className="text-[9px] font-semibold uppercase tracking-[.2em] text-violet-400">Admin dashboard</p><h1 className="mt-1 truncate text-sm font-semibold">{pageName}</h1></div>
        <form onSubmit={submitWorkspaceSearch} className="relative ml-auto hidden w-full max-w-sm md:block"><label><span className="sr-only">Search admin</span><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={workspaceSearch} onChange={(event) => setWorkspaceSearch(event.target.value)} placeholder={`Search ${activeResource?.label.toLowerCase() ?? "workspace"}…`} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-12 text-xs outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50 dark:border-white/8 dark:bg-white/5 dark:focus:border-violet-300/40 dark:focus:bg-white/8 dark:focus:ring-violet-300/10" /></label><button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-white px-2 py-1 text-[9px] font-bold text-slate-400 shadow-sm dark:bg-white/8">↵</button></form>
        <button type="button" onClick={() => setDarkMode((current) => !current)} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} title={darkMode ? "Light mode" : "Dark mode"} className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/8">{darkMode ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}</button>
        <AdminUserMenu name={user?.name ?? "Admin"} email={user?.email} onSignOut={signOut} />
      </header>
      <main className="p-4 sm:p-6 lg:p-8 xl:p-10"><div className="mx-auto max-w-[1500px]"><Outlet /></div></main>
    </div>
  </div>;
}

function AdminLink({ to, label, icon, count, end = false }: { to: string; label: string; icon: ReactNode; count?: number; end?: boolean }) {
  return <NavLink to={to} end={end} className={({ isActive }) => `group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${isActive ? "bg-slate-950 text-white shadow-md shadow-slate-950/10 dark:bg-violet-400 dark:shadow-violet-900/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-stone-400 dark:hover:bg-white/8 dark:hover:text-white"}`}><span className="[&>svg]:size-4.5 [&>svg]:stroke-[1.7]">{icon}</span><span className="min-w-0 flex-1 truncate">{label}</span>{typeof count === "number" && count > 0 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500 group-[.active]:bg-white/15 group-[.active]:text-white dark:bg-white/8 dark:text-stone-400">{count > 999 ? "999+" : count}</span>}</NavLink>;
}

function AdminUserMenu({ name, email, onSignOut }: { name: string; email?: string; onSignOut: () => void }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const close = useCallback(() => { if (detailsRef.current) detailsRef.current.open = false; }, []);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => { if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) close(); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); };
  }, [close]);
  return <details ref={detailsRef} className="group relative"><summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8 [&::-webkit-details-marker]:hidden"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-50 text-xs font-bold text-violet-600 dark:bg-violet-900/50 dark:text-violet-200">{name.slice(0, 2).toUpperCase()}</span><span className="hidden max-w-24 truncate text-xs font-semibold xl:block">{name}</span><ChevronDown className="size-3.5 text-slate-400 transition group-open:rotate-180" /></summary><div className="absolute right-0 top-[calc(100%+.65rem)] z-60 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_25px_70px_-25px_rgba(15,23,42,.45)] dark:border-white/10 dark:bg-[#1d1924]"><div className="px-3 py-3"><p className="truncate text-sm font-semibold">{name}</p><p className="mt-1 truncate text-[11px] text-slate-400">{email ?? "Store administrator"}</p><span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-emerald-700">Administrator</span></div><div className="border-t border-slate-100 py-2 dark:border-white/8"><Link to="/" onClick={close} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 dark:text-stone-300 dark:hover:bg-white/8"><ExternalLink className="size-4 text-slate-400" />View storefront</Link><Link to="/admin/chat" onClick={close} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 dark:text-stone-300 dark:hover:bg-white/8"><MessageCircle className="size-4 text-slate-400" />Support inbox</Link></div><button type="button" onClick={() => { close(); onSignOut(); }} className="flex w-full items-center gap-3 border-t border-slate-100 px-3 py-3 text-left text-sm font-medium text-violet-500 transition hover:bg-violet-50 dark:border-white/8 dark:text-violet-200 dark:hover:bg-violet-900/30"><LogOut className="size-4" />Sign out</button></div></details>;
}
