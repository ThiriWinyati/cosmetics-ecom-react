import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, Clock, Play, Sparkles } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { tutorials } from "./blogData";

const lessonPoints: Record<string, string[]> = {
  Complexion: ["Identify whether your undertone is warm, cool or neutral.", "Test shades along the jawline in natural light.", "Allow the formula to settle before making your final choice."],
  Lips: ["Use your undertone as a guide, not a strict rule.", "Compare the colour with your natural lip tone.", "Choose a finish that suits the occasion and your comfort."],
  Eyes: ["Work with the natural structure of your eye shape.", "Build colour gradually and keep the edges softly blended.", "Place depth where you want to create definition."],
  Cheeks: ["Choose placement based on the effect you want to create.", "Begin with less product and build in thin layers.", "Blend upward for a naturally lifted finish."],
};

const defaultPoints = ["Begin with prepared, hydrated skin and clean tools.", "Apply a small amount first, then build only where needed.", "Check the finished look in natural light and soften any visible edges."];

export default function BlogDetail() {
  const { blogId } = useParams();
  const index = tutorials.findIndex((item) => item.id === blogId);
  if (index < 0) return <Navigate to="/blogs" replace />;

  const tutorial = tutorials[index];
  const previous = tutorials[(index - 1 + tutorials.length) % tutorials.length];
  const next = tutorials[(index + 1) % tutorials.length];
  const related = tutorials.filter((item) => item.id !== tutorial.id && (item.category === tutorial.category || item.category === "How to")).slice(0, 3);
  const suggestions = related.length === 3 ? related : tutorials.filter((item) => item.id !== tutorial.id).slice(0, 3);
  const points = lessonPoints[tutorial.category] ?? defaultPoints;

  return <main className="overflow-x-clip bg-[#fcfbfa] text-slate-950 dark:bg-[#0f0c14] dark:text-stone-100">
    <header className="mx-auto max-w-7xl px-6 pb-10 pt-10 lg:px-8 lg:pb-14 lg:pt-16">
      <Link to="/blogs" className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-violet-500 dark:text-stone-400 dark:hover:text-violet-200"><ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />Back to the journal</Link>
      <div className="mt-10 grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div><div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-violet-50 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[.18em] text-violet-500 dark:bg-violet-300/10 dark:text-violet-200">{tutorial.category}</span><span className="flex items-center gap-1.5 text-xs text-slate-400"><Clock className="size-3.5" />{tutorial.duration}</span></div><h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-.05em] sm:text-6xl lg:text-7xl">{tutorial.title}</h1><p className="mt-6 max-w-2xl text-base leading-8 text-slate-500 dark:text-stone-400">{tutorial.description} Follow the lesson at your own pace, then use the notes below as a quick reference while you practise.</p></div>
        <div className="hidden rounded-[1.75rem] bg-violet-50 p-6 dark:bg-[#241738] lg:block"><Sparkles className="size-5 text-violet-400 dark:text-violet-200" /><p className="mt-5 text-sm font-semibold">Beauty lesson {String(index + 1).padStart(2, "0")}</p><p className="mt-2 text-xs leading-5 text-slate-500 dark:text-stone-400">Part of the Charm & Grace tutorial edit.</p></div>
      </div>
    </header>

    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="relative aspect-video overflow-hidden rounded-[1.5rem] bg-slate-950 shadow-[0_35px_90px_-45px_rgba(15,23,42,.55)] sm:rounded-[2.5rem]"><iframe src={`https://www.youtube-nocookie.com/embed/${tutorial.id}`} title={tutorial.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className="absolute inset-0 size-full" /></div></section>

    <section className="mx-auto grid max-w-6xl items-start gap-12 px-6 py-16 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8 lg:py-24">
      <aside className="hidden self-start lg:sticky lg:top-28 lg:block"><div className="rounded-[1.5rem] bg-white p-5 shadow-[0_20px_55px_-40px_rgba(15,23,42,.45)] dark:bg-[#17131d]"><BookOpen className="size-5 text-violet-400" /><p className="mt-4 text-sm font-semibold">In this lesson</p><nav className="mt-4 space-y-1 text-xs text-slate-500 dark:text-stone-400"><a href="#overview" className="block rounded-lg px-2 py-2 hover:bg-violet-50 hover:text-violet-500 dark:hover:bg-violet-300/10">Overview</a><a href="#key-notes" className="block rounded-lg px-2 py-2 hover:bg-violet-50 hover:text-violet-500 dark:hover:bg-violet-300/10">Key notes</a><a href="#next-lessons" className="block rounded-lg px-2 py-2 hover:bg-violet-50 hover:text-violet-500 dark:hover:bg-violet-300/10">Continue learning</a></nav></div></aside>
      <article className="min-w-0"><div id="overview" className="scroll-mt-32"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-violet-400 dark:text-violet-200">The lesson</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">A considered approach</h2><p className="mt-6 text-base leading-8 text-slate-600 dark:text-stone-300">Makeup works best when technique supports your own features rather than covering them. Take time to observe colour, texture and placement as you follow the video. Pause between steps, work in light layers and adapt the guidance to the products you already enjoy using.</p><p className="mt-5 text-base leading-8 text-slate-600 dark:text-stone-300">There is no single perfect result. The goal is to understand why each step works, so you can repeat it confidently and make it your own.</p></div>
        <div id="key-notes" className="mt-14 scroll-mt-32 rounded-[2rem] bg-[#21132f] p-7 text-white sm:p-10"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-violet-200">Keep in mind</p><h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Three notes to take with you</h2><div className="mt-8 space-y-5">{points.map((point, pointIndex) => <div key={point} className="flex gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-violet-200"><Check className="size-4" /></span><div><p className="text-xs font-semibold text-white/45">0{pointIndex + 1}</p><p className="mt-1 text-sm leading-6 text-white/80">{point}</p></div></div>)}</div></div>
        <a href={`https://youtu.be/${tutorial.id}`} target="_blank" rel="noreferrer" className="group mt-8 inline-flex h-12 items-center gap-3 rounded-full bg-violet-50 px-6 text-sm font-semibold text-violet-600 transition hover:bg-violet-100 dark:bg-violet-300/10 dark:text-violet-200"><Play className="size-4 fill-current" />Open on YouTube <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></a>
      </article>
    </section>

    <section id="next-lessons" className="scroll-mt-28 bg-white py-16 dark:bg-[#15111b] lg:py-24"><div className="mx-auto max-w-7xl px-6 lg:px-8"><div className="flex items-end justify-between gap-6"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-violet-400 dark:text-violet-200">Continue learning</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">You may also enjoy</h2></div><Link to="/blogs" className="hidden text-xs font-semibold hover:text-violet-500 sm:block">View all lessons</Link></div><div className="mt-9 grid gap-4 md:grid-cols-3">{suggestions.map((item) => <Link key={item.id} to={`/blogs/${item.id}`} className="group rounded-[1.5rem] bg-[#fcfbfa] p-6 transition hover:-translate-y-1 hover:bg-violet-50 dark:bg-white/[.04] dark:hover:bg-violet-300/[.08]"><span className="text-[9px] font-semibold uppercase tracking-[.18em] text-violet-400">{item.category}</span><h3 className="mt-4 text-xl font-semibold leading-tight">{item.title}</h3><p className="mt-3 line-clamp-2 text-xs leading-6 text-slate-500 dark:text-stone-400">{item.description}</p><span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold">Read lesson <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" /></span></Link>)}</div></div></section>

    <nav className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-10 lg:px-8"><Link to={`/blogs/${previous.id}`} className="group min-w-0 text-xs font-semibold text-slate-500 hover:text-violet-500 dark:text-stone-400"><span className="flex items-center gap-2"><ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />Previous</span><span className="mt-1 hidden max-w-xs truncate text-slate-950 dark:text-stone-100 sm:block">{previous.title}</span></Link><Link to={`/blogs/${next.id}`} className="group min-w-0 text-right text-xs font-semibold text-slate-500 hover:text-violet-500 dark:text-stone-400"><span className="flex items-center justify-end gap-2">Next<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span><span className="mt-1 hidden max-w-xs truncate text-slate-950 dark:text-stone-100 sm:block">{next.title}</span></Link></nav>
  </main>;
}
