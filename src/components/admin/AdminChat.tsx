import { CheckCheck, Clock3, Inbox, MessageCircle, RefreshCw, Search, Send, Sparkles, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";

type AdminChatMessage = {
  id: number;
  customerId: number;
  adminId: number | null;
  message: string;
  timestamp: string;
  adminRead: number;
  customer: string | null;
  email: string | null;
  admin: string | null;
};

const formatTime = (timestamp: string) => new Date(timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const formatConversationDate = (timestamp: string) => {
  const date = new Date(timestamp);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return formatTime(timestamp);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export default function AdminChat() {
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const locallyReadCustomers = useRef(new Set<number>());
  const selectedCustomer = useRef<number | null>(null);

  const loadMessages = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const readCustomerId = selectedCustomer.current;
      const data = await api<AdminChatMessage[]>(`/admin/chat${readCustomerId ? `?readCustomerId=${readCustomerId}` : ""}`);
      setMessages(data.map((message) => locallyReadCustomers.current.has(message.customerId) && message.adminId === null ? { ...message, adminRead: 1 } : message));
      setCustomerId((current) => { const next = current ?? data.at(-1)?.customerId ?? null; selectedCustomer.current = next; return next; });
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load conversations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const activeUnreadCount = messages.filter((message) => message.customerId === customerId && message.adminId === null && !message.adminRead).length;

  useEffect(() => {
    void loadMessages();
    const timer = window.setInterval(loadMessages, 3000);
    return () => window.clearInterval(timer);
  }, [loadMessages]);

  useEffect(() => {
    if (!customerId || activeUnreadCount === 0 || locallyReadCustomers.current.has(customerId)) return;
    locallyReadCustomers.current.add(customerId);
    selectedCustomer.current = customerId;
    setMessages((current) => current.map((message) => message.customerId === customerId && message.adminId === null ? { ...message, adminRead: 1 } : message));
    void loadMessages();
  }, [activeUnreadCount, customerId, loadMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [customerId, messages]);

  const conversations = useMemo(() => {
    const byCustomer = new Map<number, AdminChatMessage>();
    messages.forEach((message) => byCustomer.set(message.customerId, message));
    return [...byCustomer.values()].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [messages]);

  const unreadByCustomer = useMemo(() => messages.reduce((counts, message) => {
    if (message.adminId === null && !message.adminRead) counts.set(message.customerId, (counts.get(message.customerId) ?? 0) + 1);
    return counts;
  }, new Map<number, number>()), [messages]);

  const filteredConversations = conversations.filter((conversation) => {
    const query = search.trim().toLowerCase();
    return !query || `${conversation.customer ?? ""} ${conversation.email ?? ""} ${conversation.message}`.toLowerCase().includes(query);
  });
  const totalUnread = [...unreadByCustomer.values()].reduce((total, count) => total + count, 0);
  const activeMessages = messages.filter((message) => message.customerId === customerId);
  const activeCustomer = conversations.find((message) => message.customerId === customerId);

  const sendReply = async () => {
    const message = text.trim();
    if (!customerId || !message || sending) return;
    setSending(true);
    setError("");
    try {
      const saved = await api<AdminChatMessage>("/admin/chat", { method: "POST", body: JSON.stringify({ customerId, message }) });
      setMessages((current) => current.some((item) => item.id === saved.id) ? current : [...current, saved]);
      setText("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Reply could not be sent");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400"><Sparkles className="size-3.5" /> Customer care</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Live conversations</h1>
          <p className="mt-2 text-sm text-slate-500">Answer questions and help customers in one calm workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          {totalUnread > 0 && <span className="rounded-full bg-violet-50 px-3.5 py-2 text-xs font-semibold text-violet-500">{totalUnread} unread</span>}
          <button type="button" onClick={() => void loadMessages(true)} className="admin-secondary rounded-full" disabled={refreshing}>
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} /> {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mt-5 rounded-2xl border border-violet-50 bg-violet-50 p-4 text-sm text-violet-600">{error}</p>}

      <div className="mt-8 grid min-h-[680px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_25px_70px_-45px_rgba(15,23,42,.35)] lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:min-h-0 lg:grid-cols-[350px_1fr]">
        <aside className="flex min-h-0 flex-col border-b border-slate-200 bg-[#fcfbfb] lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div><h2 className="font-semibold">Inbox</h2><p className="mt-1 text-xs text-slate-400">{conversations.length} conversations</p></div>
              <span className="grid size-10 place-items-center rounded-2xl bg-slate-950 text-white"><Inbox className="size-4" /></span>
            </div>
            <label className="relative mt-4 block">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customers…" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100" />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {loading && <div className="space-y-2 p-2">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}</div>}
            {!loading && !filteredConversations.length && <div className="px-6 py-20 text-center"><MessageCircle className="mx-auto size-7 text-slate-300" /><p className="mt-3 text-sm font-medium">{search ? "No chats found" : "No conversations yet"}</p><p className="mt-1 text-xs leading-5 text-slate-400">{search ? "Try another name or email." : "New customer messages will appear here."}</p></div>}
            {filteredConversations.map((conversation) => {
              const unread = unreadByCustomer.get(conversation.customerId) ?? 0;
              const active = customerId === conversation.customerId;
              return (
                <button key={`conversation-${conversation.customerId}-${conversation.email ?? conversation.customer ?? "customer"}`} onClick={() => { selectedCustomer.current = conversation.customerId; setCustomerId(conversation.customerId); }} className={`group mb-1 flex w-full gap-3 rounded-2xl p-3.5 text-left transition-all ${active ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10" : "hover:bg-white hover:shadow-sm"}`}>
                  <span className={`relative grid size-11 shrink-0 place-items-center rounded-full text-xs font-semibold ${active ? "bg-white/15 text-white" : "bg-violet-50 text-violet-500"}`}>
                    {(conversation.customer ?? "C").slice(0, 1).toUpperCase()}
                    <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-emerald-400" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2"><strong className="truncate text-sm">{conversation.customer ?? `Customer #${conversation.customerId}`}</strong><time className={`shrink-0 text-[10px] ${active ? "text-white/50" : "text-slate-400"}`}>{formatConversationDate(conversation.timestamp)}</time></span>
                    <span className="mt-1.5 flex items-center gap-2"><span className={`min-w-0 flex-1 truncate text-xs ${active ? "text-white/60" : "text-slate-500"}`}>{conversation.adminId !== null && "You: "}{conversation.message}</span>{unread > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-violet-400 px-1.5 py-0.5 text-[10px] font-semibold text-white">{unread}</span>}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-h-[600px] min-w-0 flex-col overflow-hidden bg-white lg:min-h-0">
          {!customerId ? (
            <div className="grid flex-1 place-items-center p-8 text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-3xl bg-violet-50 text-violet-300"><MessageCircle className="size-7" /></span><h2 className="mt-5 text-xl font-semibold">Your customer conversations</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Select a conversation from the inbox to read messages and send a reply.</p></div></div>
          ) : (
            <>
              <header className="shrink-0 flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white">{(activeCustomer?.customer ?? "C").slice(0, 1).toUpperCase()}</span>
                  <div className="min-w-0"><h2 className="truncate font-semibold">{activeCustomer?.customer ?? `Customer #${customerId}`}</h2><p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-400"><span className="size-1.5 rounded-full bg-emerald-400" /> {activeCustomer?.email ?? "Customer account"}</p></div>
                </div>
                <span className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] text-slate-500 sm:flex"><Clock3 className="size-3" /> Replies update live</span>
              </header>

              <div aria-live="polite" className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain bg-[#faf9f8] px-5 py-7 sm:px-8">
                <div className="mx-auto w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-medium text-slate-400">Conversation history</div>
                {activeMessages.map((message, index) => {
                  const fromAdmin = message.adminId !== null;
                  return (
                    <div key={`message-${message.customerId}-${message.id}-${message.timestamp}-${index}`} className={`flex items-end gap-2 ${fromAdmin ? "justify-end" : "justify-start"}`}>
                      {!fromAdmin && <span className="grid size-7 shrink-0 place-items-center rounded-full bg-violet-50 text-violet-400"><UserRound className="size-3.5" /></span>}
                      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm ${fromAdmin ? "rounded-br-sm bg-slate-950 text-white" : "rounded-bl-sm border border-slate-100 bg-white text-slate-700"}`}>
                        <p className="whitespace-pre-wrap break-words leading-6">{message.message}</p>
                        <span className={`mt-1.5 flex items-center gap-1 text-[10px] ${fromAdmin ? "justify-end text-white/45" : "text-slate-400"}`}>{formatTime(message.timestamp)}{fromAdmin && <CheckCheck className="size-3" />}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={(event) => { event.preventDefault(); void sendReply(); }} className="shrink-0 border-t border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-slate-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-slate-100">
                  <textarea maxLength={2000} value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendReply(); } }} rows={2} placeholder={`Reply to ${activeCustomer?.customer?.split(" ")[0] ?? "customer"}…`} aria-label="Reply to customer" className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none" />
                  <button type="submit" disabled={!text.trim() || sending} aria-label="Send reply" className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-400 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"><Send className="size-4" /></button>
                </div>
                <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-slate-400"><span>Enter to send · Shift + Enter for a new line</span><span>{text.length}/2000</span></div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
