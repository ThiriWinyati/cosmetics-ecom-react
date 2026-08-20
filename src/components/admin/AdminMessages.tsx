import { CalendarDays, Inbox, Mail, RefreshCw, Reply, Search, Trash2, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  customerId: number | null;
};

const formatDate = (value: string) => new Date(value).toLocaleString("en-GB", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});

export default function AdminMessages() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [readIds, setReadIds] = useState<Set<number>>(() => new Set());
  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadMessages = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const data = await api<ContactMessage[]>("/admin/messages");
      setMessages(data);
      setSelectedId((current) => current && data.some((item) => item.id === current) ? current : data[0]?.id ?? null);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Messages could not be loaded");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadMessages(); }, [loadMessages]);
  useEffect(() => { setQuery(searchParams.get("search") ?? ""); }, [searchParams]);
  useEffect(() => {
    if (selectedId !== null) setReadIds((current) => new Set(current).add(selectedId));
  }, [selectedId]);

  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    return messages.filter((item) => !search || `${item.name} ${item.email} ${item.subject} ${item.message}`.toLowerCase().includes(search));
  }, [messages, query]);
  const selected = messages.find((item) => item.id === selectedId) ?? null;

  const removeMessage = async (message: ContactMessage) => {
    if (!window.confirm(`Delete the message from ${message.name}?`)) return;
    try {
      await api(`/admin/messages/${message.id}`, { method: "DELETE" });
      const remaining = messages.filter((item) => item.id !== message.id);
      setMessages(remaining);
      setSelectedId(remaining[0]?.id ?? null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Message could not be deleted");
    }
  };

  return <div className="mx-auto max-w-[1500px]">
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-400">Customer care</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.035em] sm:text-4xl">Messages</h1><p className="mt-2 text-sm text-slate-500 dark:text-stone-400">Review enquiries sent through the storefront contact form.</p></div>
      <button type="button" onClick={() => void loadMessages(true)} disabled={refreshing} className="admin-secondary rounded-full"><RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />{refreshing ? "Refreshing" : "Refresh inbox"}</button>
    </div>

    {error && <p role="alert" className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-600 dark:border-violet-300/15 dark:bg-violet-300/10 dark:text-violet-200">{error}</p>}

    <div className="mt-8 grid min-h-[650px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_25px_70px_-45px_rgba(15,23,42,.35)] dark:border-white/10 dark:bg-[#19151f] lg:grid-cols-[380px_1fr]">
      <aside className="flex min-h-0 flex-col border-b border-slate-200 bg-slate-50/70 dark:border-white/10 dark:bg-white/[.025] lg:border-b-0 lg:border-r">
        <div className="border-b border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#19151f]"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Contact inbox</h2><p className="mt-1 text-xs text-slate-400">{visible.length} {visible.length === 1 ? "message" : "messages"}</p></div><span className="grid size-10 place-items-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-300/15 dark:text-violet-200"><Inbox className="size-4.5" /></span></div><label className="relative mt-4 block"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sender or subject…" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-50 dark:border-white/10 dark:bg-white/5 dark:focus:border-violet-300/40 dark:focus:ring-violet-300/10" /></label></div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {loading ? <div className="grid h-48 place-items-center text-sm text-slate-400">Loading messages…</div> : visible.length === 0 ? <div className="grid h-48 place-items-center px-6 text-center"><div><Mail className="mx-auto size-7 text-slate-300" /><p className="mt-3 text-sm font-medium">No messages found</p><p className="mt-1 text-xs text-slate-400">Try a different search.</p></div></div> : visible.map((item) => {
            const active = item.id === selectedId;
            const unread = !readIds.has(item.id);
            return <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`mb-2 w-full rounded-2xl border p-4 text-left transition ${active ? "border-violet-200 bg-white shadow-sm dark:border-violet-300/30 dark:bg-violet-300/10" : "border-transparent hover:border-slate-200 hover:bg-white dark:hover:border-white/10 dark:hover:bg-white/5"}`}><div className="flex items-start gap-3"><span className={`grid size-10 shrink-0 place-items-center rounded-xl text-xs font-bold ${active ? "bg-violet-100 text-violet-600 dark:bg-violet-300/20 dark:text-violet-100" : "bg-slate-200 text-slate-600 dark:bg-white/8 dark:text-stone-300"}`}>{item.name.slice(0, 2).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><strong className="truncate text-sm">{item.name}</strong>{unread && <span className="size-1.5 shrink-0 rounded-full bg-violet-400" />}</span><span className="mt-1 block truncate text-xs font-medium text-slate-600 dark:text-stone-300">{item.subject}</span><span className="mt-1 block truncate text-xs text-slate-400">{item.message}</span></span></div></button>;
          })}
        </div>
      </aside>

      <section className="min-h-0 bg-white dark:bg-[#19151f]">
        {selected ? <div className="flex h-full flex-col">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-7 dark:border-white/10"><div className="flex min-w-0 items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-sm font-bold text-white dark:bg-violet-300 dark:text-violet-950">{selected.name.slice(0, 2).toUpperCase()}</span><div className="min-w-0"><h2 className="text-lg font-semibold sm:text-xl">{selected.subject}</h2><p className="mt-1 text-sm text-slate-500 dark:text-stone-400">From <strong className="text-slate-800 dark:text-stone-200">{selected.name}</strong> · {selected.email}</p></div></div><div className="flex gap-2"><a href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`} className="admin-primary"><Reply className="size-4" />Reply</a><button type="button" onClick={() => void removeMessage(selected)} aria-label="Delete message" className="admin-icon size-10 border border-slate-200 hover:border-violet-100 hover:bg-violet-50 hover:text-violet-500 dark:border-white/10 dark:hover:bg-violet-300/10"><Trash2 className="size-4" /></button></div></header>
          <div className="flex-1 overflow-y-auto p-5 sm:p-8"><div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-stone-400"><span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 dark:bg-white/5"><CalendarDays className="size-3.5" />{formatDate(selected.submittedAt)}</span><span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 dark:bg-white/5"><UserRound className="size-3.5" />{selected.customerId ? `Customer #${selected.customerId}` : "Guest enquiry"}</span></div><article className="mt-7 max-w-3xl rounded-[1.5rem] border border-slate-200 bg-slate-50/60 p-6 text-[15px] leading-7 text-slate-700 dark:border-white/10 dark:bg-white/[.035] dark:text-stone-300 sm:p-8"><p className="whitespace-pre-wrap">{selected.message}</p></article></div>
        </div> : <div className="grid h-full min-h-100 place-items-center p-8 text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-3xl bg-violet-50 text-violet-400 dark:bg-violet-300/10 dark:text-violet-200"><Mail className="size-6" /></span><h2 className="mt-5 font-semibold">Select a message</h2><p className="mt-2 text-sm text-slate-400">Choose an enquiry from the inbox to read it.</p></div></div>}
      </section>
    </div>
  </div>;
}
