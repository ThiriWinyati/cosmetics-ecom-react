import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@/data/store";
import { api } from "@/lib/api";
import { beautyQuestions, findBeautyMatches, type BeautyProfile } from "@/data/beautyFinder";

export default function BeautyFinder({ onNavigate }: { onNavigate: () => void }) {
  const [profile, setProfile] = useState<BeautyProfile>({});
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setStatus("loading");
    api<Product[]>("/products").then((items) => {
      if (!active) return;
      setProducts(items); setStatus("ready");
    }).catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, [attempt]);
  const question = beautyQuestions[step];
  function choose(value: string) {
    if (!question || !value.trim()) return;
    if (question.key === "budget" && value !== "No limit" && !(Number(value.match(/\d+(?:\.\d+)?/)?.[0]) > 0)) return;
    setProfile((current) => ({ ...current, [question.key]: value.trim() }));
    setAnswer(""); setStep(step + 1);
  }
  const result = !question ? findBeautyMatches(products, profile) : null;
  const buttonClass = "rounded-2xl border border-violet-200 px-3 py-2 text-left text-sm hover:bg-violet-50 dark:hover:bg-white/10";
  return <div className="space-y-4">
    <p className="text-xs leading-5 text-slate-500 dark:text-stone-400">Let’s find your beauty match. This free guided finder uses catalogue matching, not generative AI. Your answers stay in this browser session and aren’t sent with the catalogue request.</p>
    {question ? <>
      <p className="text-xs font-semibold text-violet-600 dark:text-violet-200">Question {step + 1} of {beautyQuestions.length}</p>
      <h3 className="text-lg font-semibold">{question.title}</h3>
      <div className="grid gap-2">{question.options.map((option) => <button key={option} type="button" onClick={() => choose(option)} className={buttonClass}>{option}</button>)}</div>
      {(question.key === "brand" || question.key === "budget") && <form onSubmit={(event) => { event.preventDefault(); choose(answer); }} className="flex gap-2">
        <input aria-label={question.key === "budget" ? "Maximum budget in pounds" : "Preferred brand"} value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={80} placeholder={question.key === "budget" ? "e.g. £30" : "Type a brand"} className="min-w-0 flex-1 rounded-xl border border-violet-200 bg-transparent px-3 py-2 text-sm" />
        <button type="submit" disabled={!answer.trim() || (question.key === "budget" && !(Number(answer.match(/\d+(?:\.\d+)?/)?.[0]) > 0))} className="rounded-xl bg-violet-700 px-3 text-sm text-white disabled:opacity-40">Next</button>
      </form>}
      {step > 0 && <button type="button" className="text-xs underline" onClick={() => { setStep(step - 1); setAnswer(""); }}>Back</button>}
    </> : <>
      <h3 className="text-lg font-semibold">Your beauty shortlist</h3>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-2xl bg-violet-50 p-3 text-xs dark:bg-white/5">{beautyQuestions.map(({ key }) => <div key={key}><dt className="capitalize text-slate-500 dark:text-stone-400">{key}</dt><dd className="mt-1 break-words">{profile[key]}</dd></div>)}</dl>
      {status === "loading" && <p role="status" className="text-sm">Checking the store catalogue…</p>}
      {status === "error" && <div role="status"><p className="text-sm">The catalogue is unavailable, so I can’t check your matches yet.</p><button type="button" onClick={() => setAttempt(attempt + 1)} className="mt-2 text-sm underline">Try again</button></div>}
      {status === "ready" && result && <><p role="status" className="text-sm leading-6">{result.note}</p>{result.matches.map(({ product, reasons }) => <article key={product.id} className="rounded-2xl border border-violet-200 p-4">
        <p className="text-xs text-slate-500 dark:text-stone-400">{product.brand}</p>
        <Link to={`/products/${product.id}`} onClick={onNavigate} className="mt-1 block font-semibold underline">{product.name} · £{product.price.toFixed(2)}</Link>
        <p className="mt-2 text-xs leading-5">{product.description}</p>
        <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-stone-300">{reasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul>
      </article>)}</>}
      <p className="text-xs leading-5 text-slate-500 dark:text-stone-400">This finder cannot diagnose skin conditions or confirm allergy safety. For medical concerns, speak with a qualified clinician. The catalogue may lack skincare or ingredient information.</p>
      <div className="flex flex-wrap gap-3"><button type="button" onClick={() => setStep(0)} className={buttonClass}>Edit my answers</button><button type="button" onClick={() => { setProfile({}); setStep(0); setAnswer(""); }} className={buttonClass}>Start again</button></div>
    </>}
  </div>;
}
