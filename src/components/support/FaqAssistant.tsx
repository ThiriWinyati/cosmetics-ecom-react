import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { faqSuggestions, getFaqReply, type FaqReply } from "@/data/faqAssistant";

import BeautyFinder from "./BeautyFinder";

type Message = { role: "user" | "assistant"; content: string; links?: FaqReply["links"] };

export default function FaqAssistant() {
  const [mode, setMode] = useState<"beauty" | "faq">("beauty");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && mode === "faq") inputRef.current?.focus();
  }, [open, mode]);
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, open, mode]);

  function close() { setOpen(false); triggerRef.current?.focus(); }
  function send(content = text) {
    const question = content.trim().slice(0, 2000);
    if (!question) return;
    const reply = getFaqReply(question);
    setMessages((current) => [...current.slice(-38), { role: "user", content: question }, { role: "assistant", ...reply }]);
    setText("");
  }

  return <div className="fixed bottom-24 right-4 z-50 sm:bottom-6 sm:right-6">
    {open && <section id="faq-shopping-chat" role="dialog" aria-label="Beauty and store assistant" onKeyDown={(event) => { if (event.key === "Escape") close(); }} className="mb-3 flex max-h-[min(600px,70dvh)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-violet-200 bg-white text-slate-900 shadow-2xl sm:w-96 dark:border-white/15 dark:bg-[#17131d] dark:text-stone-100">
      <header className="flex items-center gap-3 bg-slate-950 px-5 py-4 text-white dark:bg-[#251536]">
        <Sparkles className="size-5 text-violet-200" />
        <div className="flex-1"><h2 className="text-sm font-semibold">Your beauty companion</h2><p className="text-xs text-violet-200">Find your match · Store support</p></div>
        <button type="button" onClick={close} aria-label="Close assistant" className="rounded-full p-2 hover:bg-white/10"><X className="size-5" /></button>
      </header>
      <div className="flex gap-2 border-b border-violet-100 px-4 py-3 dark:border-white/10" role="group" aria-label="Assistant mode">
        <button type="button" aria-pressed={mode === "beauty"} onClick={() => setMode("beauty")} className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold ${mode === "beauty" ? "bg-violet-700 text-white" : "bg-violet-50 text-violet-900"}`}>Find my beauty match</button>
        <button type="button" aria-pressed={mode === "faq"} onClick={() => setMode("faq")} className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold ${mode === "faq" ? "bg-violet-700 text-white" : "bg-violet-50 text-violet-900"}`}>Store questions</button>
      </div>
      <div hidden={mode !== "beauty"} className="min-h-0 overflow-y-auto overscroll-contain p-5"><BeautyFinder onNavigate={close} /></div>
      <div hidden={mode !== "faq"} ref={listRef} role="log" aria-label="Conversation" aria-live="polite" className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5">
        <p className="text-sm leading-6">Hi! I’m an automated FAQ helper. Ask about delivery, returns, order tracking or finding products.</p>
        <div className="flex flex-wrap gap-2">{faqSuggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => send(suggestion)} className="rounded-2xl border border-violet-200 px-3 py-2 text-left text-xs hover:bg-violet-50 dark:hover:bg-white/10">{suggestion}</button>)}</div>
        {messages.map((message, index) => <div key={index} className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "ml-auto bg-slate-950 text-white dark:bg-violet-600" : "bg-violet-50 dark:bg-white/5"}`}><span className="sr-only">{message.role === "user" ? "You: " : "FAQ helper: "}</span>{message.content}{!!message.links?.length && <div className="mt-3 flex flex-wrap gap-2">{message.links.map((link) => <Link key={link.to} to={link.to} onClick={close} className="rounded-full border border-violet-200 px-3 py-1 text-xs underline underline-offset-2 hover:bg-violet-100 dark:hover:bg-white/10">{link.label}</Link>)}</div>}</div>)}
      </div>
      <div className="border-t border-slate-200 p-4 dark:border-white/10">
        {mode === "faq" && <form onSubmit={(event) => { event.preventDefault(); send(); }} className="flex gap-2">
          <input ref={inputRef} value={text} onChange={(event) => setText(event.target.value)} maxLength={2000} aria-label="Message the FAQ helper" placeholder="Ask a store question…" className="min-w-0 flex-1 rounded-full border border-slate-200 bg-transparent px-4 py-3 text-sm focus:outline-violet-400 dark:border-white/20" />
          <button type="submit" disabled={!text.trim()} aria-label="Send message" className="rounded-full bg-slate-950 p-3 text-white disabled:opacity-40 dark:bg-violet-500"><Send className="size-5" /></button>
        </form>}
        <p className="mt-3 text-[11px] leading-4 text-slate-500 dark:text-stone-400">Free guided matching and FAQ answers. Please don’t share personal or payment details.</p>
        <div className="mt-2 flex justify-between text-xs"><Link to="/contact" onClick={close} className="underline">Talk to our beauty team</Link><Link to="/products" onClick={close} className="underline">Browse products</Link></div>
      </div>
    </section>}
    <button ref={triggerRef} type="button" onClick={() => open ? close() : setOpen(true)} aria-expanded={open} aria-controls="faq-shopping-chat" className="ml-auto flex items-center gap-2 rounded-full bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-xl hover:bg-violet-700 dark:bg-violet-600"><MessageCircle className="size-5" />Beauty helper</button>
  </div>;
}
