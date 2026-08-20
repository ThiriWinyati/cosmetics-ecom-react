import { MessageCircle, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, getSessionUser } from "@/lib/api";

type ChatMessage = { id: number; customerId: number; adminId: number | null; message: string; timestamp: string };

export default function CustomerChat() {
  const user = getSessionUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const loadMessages = useCallback(async () => { if (user?.role !== "customer") return; try { setMessages(await api<ChatMessage[]>("/customer/chat")); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Chat is temporarily unavailable"); } }, [user?.role]);

  useEffect(() => { void loadMessages(); const timer = window.setInterval(loadMessages, 3000); return () => window.clearInterval(timer); }, [loadMessages]);
  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList) return;
    messageList.scrollTo({ top: messageList.scrollHeight, behavior: messages.length > 1 ? "smooth" : "auto" });
  }, [messages]);

  if (user?.role !== "customer") return <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white sm:p-10"><MessageCircle className="size-8 text-violet-200" /><h2 className="mt-5 text-2xl font-semibold">Chat with our beauty team</h2><p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">Sign in to start a private conversation and return to your chat history at any time.</p><Link to="/login" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950">Log in to live chat</Link></div>;

  const sendMessage = async () => { const message = text.trim(); if (!message || sending) return; setSending(true); setError(""); try { const saved = await api<ChatMessage>("/customer/chat", { method: "POST", body: JSON.stringify({ message }) }); setMessages((current) => current.some((item) => item.id === saved.id) ? current : [...current, saved]); setText(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Message could not be sent"); } finally { setSending(false); } };

  return <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-45px_rgba(15,23,42,.35)] dark:border-white/10 dark:bg-[#17131d] dark:shadow-[0_28px_80px_-45px_rgba(0,0,0,.8)]"><header className="flex items-center justify-between gap-4 bg-slate-950 px-6 py-5 text-white dark:bg-[#251536]"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-violet-300/15"><MessageCircle className="size-5 text-violet-200" /></span><div><h2 className="font-semibold">Live beauty support</h2><p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-300 dark:text-stone-400"><span className="size-2 rounded-full bg-emerald-400" /> We usually reply within a few minutes</p></div></div><span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs sm:block">Private chat</span></header><div ref={messageListRef} aria-live="polite" className="h-96 space-y-4 overflow-y-auto overscroll-contain bg-stone-50 p-5 dark:bg-[#121012] sm:p-6">{!messages.length && <div className="mx-auto max-w-sm py-16 text-center"><MessageCircle className="mx-auto size-7 text-violet-200" /><h3 className="mt-4 font-semibold">How can we help?</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-stone-400">Ask about products, shades, your order, delivery, or anything else.</p></div>}{messages.map((item) => { const fromAdmin = item.adminId !== null; return <div key={item.id} className={`flex ${fromAdmin ? "justify-start" : "justify-end"}`}><div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${fromAdmin ? "rounded-bl-md bg-white text-slate-700 dark:border dark:border-white/8 dark:bg-[#1d1924] dark:text-stone-200" : "rounded-br-md bg-slate-950 text-white dark:bg-violet-400"}`}><p className="whitespace-pre-wrap break-words leading-6">{item.message}</p><time className="mt-1.5 block text-[10px] text-slate-400 dark:text-stone-500">{new Date(item.timestamp).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</time></div></div>; })}<div ref={bottomRef} /></div>{error && <p role="alert" className="border-t border-violet-50 bg-violet-50 px-5 py-3 text-xs text-violet-600 dark:border-violet-300/20 dark:bg-violet-900/30 dark:text-violet-200">{error}</p>}<form onSubmit={(event) => { event.preventDefault(); void sendMessage(); }} className="flex items-end gap-3 border-t border-slate-200 p-4 dark:border-white/10 dark:bg-[#17131d] sm:p-5"><textarea maxLength={2000} value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={2} placeholder="Type your message…" aria-label="Chat message" className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:focus:border-violet-300/40 dark:focus:bg-white/8" /><button type="submit" disabled={!text.trim() || sending} aria-label="Send message" className="grid size-12 shrink-0 place-items-center rounded-full bg-slate-950 text-white transition hover:bg-violet-400 disabled:opacity-40 dark:bg-violet-400 dark:hover:bg-violet-300"><Send className="size-4" /></button></form></section>;
}
