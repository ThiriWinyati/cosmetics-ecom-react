import { useEffect, useRef, useState } from "react";
import { Copy, Gift, X } from "lucide-react";

export default function WelcomeOffer({ onClose, onShop }: { onClose: () => void; onShop: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  useEffect(() => {
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);
  return <main className="min-h-screen bg-[#faf8f7] dark:bg-[#0f0c14]">
    <dialog ref={dialog} onCancel={onClose} aria-labelledby="account-welcome-title" aria-describedby="account-welcome-description" className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-[2rem] border border-violet-100 bg-white p-8 text-center text-slate-950 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm dark:border-white/10 dark:bg-[#21172e] dark:text-stone-100">
      <button type="button" onClick={onClose} aria-label="Close welcome offer" className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:text-violet-500"><X className="size-5" /></button>
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-violet-100 text-violet-500 dark:bg-violet-300/10 dark:text-violet-200"><Gift className="size-8" /></span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-200">Your account is ready</p>
      <h1 id="account-welcome-title" className="mt-3 text-3xl font-semibold">Welcome to Charm &amp; Grace!</h1>
      <p id="account-welcome-description" className="mt-4 text-sm leading-6 text-slate-500 dark:text-stone-300">A little gift to begin your beauty journey. Enjoy <strong>10% off your first order</strong> with the code below.</p>
      <button type="button" onClick={async () => { try { await navigator.clipboard.writeText("WELCOME10"); setCopied(true); setCopyError(false); } catch { setCopyError(true); } }} className="mt-7 flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-violet-300 bg-violet-50 p-4 dark:bg-violet-300/10">
        <strong className="text-xl tracking-widest">WELCOME10</strong><span className="flex items-center gap-2 text-xs"><Copy className="size-4" />{copied ? "Copied!" : "Copy code"}</span>
      </button>
      <p role="status" className="mt-2 text-xs text-slate-500 dark:text-stone-300">{copyError ? "Please select and copy WELCOME10 manually." : copied ? "Code copied. Paste it at checkout." : "Enter this code at checkout."}</p>
      <button type="button" onClick={onShop} className="mt-6 h-12 w-full rounded-full bg-violet-300 font-semibold text-violet-950 transition hover:bg-violet-200">Start shopping</button>
      <p className="mt-4 text-xs text-slate-400">First order only. One welcome offer per customer.</p>
    </dialog>
  </main>;
}
