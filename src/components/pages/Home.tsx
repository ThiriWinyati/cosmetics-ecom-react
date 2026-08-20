import { ArrowRight, BadgeCheck, Headphones, RotateCcw, Sparkles, Truck } from "lucide-react";
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/store/ProductCard";
import { products } from "@/data/store";

export default function Home() {
  return (
    <div className="overflow-hidden bg-white">
      <section className="relative isolate min-h-[620px] overflow-hidden bg-[#21132f] sm:min-h-[680px]">
        <img src="/hero-customer-portrait-v2.png" alt="Soft beauty portrait" className="absolute inset-0 -z-20 size-full object-cover object-[69%_center] motion-safe:animate-[hero-reveal_.9s_.05s_cubic-bezier(.22,1,.36,1)_both] sm:object-center" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#21132f]/95 via-[#21132f]/72 to-transparent sm:from-[#21132f]/92 sm:via-[#21132f]/60" />
        <div className="absolute -left-32 top-1/3 -z-10 size-96 rounded-full bg-violet-200/10 blur-3xl" />
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-6 sm:min-h-[680px] lg:px-8">
          <div className="max-w-xl text-white motion-safe:animate-[hero-copy_.7s_.15s_cubic-bezier(.22,1,.36,1)_both]">
            <p className="mb-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/75"><Sparkles className="size-3.5 text-violet-100" /> Charm & Grace · New season</p>
            <h1 className="text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-7xl">Beauty that feels like you.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-white/85">Curated makeup essentials, expressive colour and skin-loving formulas for every version of you.</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3">
              <Link to="/products" className="group relative inline-flex h-11 items-center gap-3 px-1 text-sm font-semibold text-white outline-none after:absolute after:bottom-1 after:left-1 after:right-1 after:h-px after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100">Shop collection <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5" /></Link>
              <Link to="/about" className="group relative inline-flex h-11 items-center gap-3 px-1 text-sm font-medium text-white/70 outline-none transition-colors hover:text-white focus-visible:text-white after:absolute after:bottom-1 after:left-1 after:right-1 after:h-px after:origin-right after:scale-x-0 after:bg-white/70 after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100">Our story <ArrowRight className="size-4 -rotate-45 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1" /></Link>
            </div>
          </div>
        </div>
      </section>

      <Reveal className="relative z-10 border-b border-slate-100 bg-white" distance={16}>
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-6 sm:grid-cols-3 sm:gap-3 lg:px-8">
          <TrustItem icon={<Truck />} title="Free delivery" detail="On orders over £50" />
          <TrustItem icon={<BadgeCheck />} title="Authenticity guaranteed" detail="Sourced from trusted brands" />
          <TrustItem icon={<RotateCcw />} title="Easy returns" detail="A simple 30-day policy" />
        </div>
      </Reveal>

      <ProductSection title="Fresh arrivals" eyebrow="Just landed" items={products.filter((product) => product.latest).slice(0, 4)} />

      <section className="relative overflow-hidden border-y border-violet-100/70 bg-violet-50/45 py-12 dark:border-white/8 dark:bg-[#15111b] lg:py-16">
        <div className="absolute -left-32 top-1/3 size-80 rounded-full bg-violet-200/20 blur-3xl dark:bg-violet-500/10" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end lg:mb-10"><div><p className="text-[10px] font-semibold uppercase tracking-[.25em] text-violet-400 dark:text-violet-200">Choose your mood</p><h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-.045em] dark:text-stone-100 sm:text-4xl">Two edits. Entirely your own.</h2></div><p className="max-w-sm text-sm leading-6 text-slate-500 dark:text-stone-400">Build an effortless base or make colour the main event—every look begins with how you want to feel.</p></Reveal>
          <div className="grid items-stretch gap-5 lg:grid-cols-2 lg:gap-7">
            <Reveal className="h-full"><Promo image="/everyday-glow-model-v3.png" eyebrow="Complexion edit · 01" title="Your everyday glow" description="Fresh, luminous essentials for a naturally polished base." href="/products?category=face" imagePosition="center 28%" /></Reveal>
            <Reveal delay={80} className="h-full"><Promo image="/bold-lip-model-v3.png" eyebrow="The lip edit · 02" title="A bold lip moment" description="Modern colour and comfortable textures, from soft tints to statement shades." href="/products?category=lips" imagePosition="center 25%" /></Reveal>
          </div>
        </div>
      </section>

      <ProductSection title="Most loved" eyebrow="Community favourites" items={products.filter((product) => product.popular).slice(0, 4)} />

      <Reveal as="section" className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="group grid overflow-hidden rounded-[2rem] border border-slate-200 bg-stone-50 transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_-32px_rgba(15,23,42,.28)] lg:grid-cols-2">
          <div className="relative flex flex-col justify-center p-8 sm:p-14">
            <span className="grid size-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-700"><Headphones className="size-5" /></span><p className="mt-7 text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">Beauty, demystified</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">Questions? We’re here to help.</h2>
            <p className="mt-5 max-w-md leading-7 text-slate-600">Find straightforward answers about products, delivery and returns, or speak with our friendly team.</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link to="/faq" className="landing-button group h-11 bg-slate-950 px-5 text-white hover:bg-slate-800">Read FAQs <ArrowRight className="landing-arrow size-3.5" /></Link><Link to="/contact" className="landing-button group h-11 border border-slate-300 bg-white px-5 text-slate-950 hover:border-slate-500">Contact us <ArrowRight className="landing-arrow size-3.5" /></Link></div>
          </div>
          <div className="relative min-h-80 overflow-hidden bg-violet-50"><img src="/faq-contact-collage-v2.png" alt="Beauty inspiration collage" className="absolute inset-0 size-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.035]" /><div className="absolute inset-0 bg-gradient-to-r from-violet-100/20 to-transparent dark:from-violet-950/15" /></div>
        </div>
      </Reveal>
    </div>
  );
}

function ProductSection({ title, eyebrow, items }: { title: string; eyebrow: string; items: typeof products }) {
  return <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24"><Reveal className="mb-10 flex items-end justify-between gap-6"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">{eyebrow}</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">{title}</h2></div><Link to="/products" className="group hidden items-center gap-3 rounded-full border border-slate-200 py-2 pl-5 pr-2 text-sm font-semibold transition-all duration-300 hover:border-slate-950 hover:bg-slate-950 hover:text-white sm:flex">View all <span className="grid size-8 place-items-center rounded-full bg-slate-100 text-slate-950 transition-transform duration-300 group-hover:translate-x-0.5"><ArrowRight className="size-4" /></span></Link></Reveal><div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">{items.map((product, index) => <Reveal key={product.id} delay={index * 80} distance={20}><ProductCard product={product} /></Reveal>)}</div></section>;
}

function Promo({ image, eyebrow, title, description, href, imagePosition = "center" }: { image: string; eyebrow: string; title: string; description: string; href: string; imagePosition?: string }) {
  return <article className="group relative min-h-[380px] h-full overflow-hidden rounded-[1.75rem] bg-slate-950 shadow-[0_24px_65px_-48px_rgba(15,23,42,.5)] ring-1 ring-black/5 transition hover:-translate-y-1 dark:ring-white/10 sm:min-h-[430px]"><Link to={href} className="absolute inset-0"><img src={image} alt="" style={{ objectPosition: imagePosition }} className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/15 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7 lg:p-8"><p className="text-[9px] font-semibold uppercase tracking-[.24em] text-violet-100/85">{eyebrow}</p><div className="mt-3 flex items-end justify-between gap-5"><div><h3 className="text-2xl font-semibold leading-none tracking-[-.045em] sm:text-3xl">{title}</h3><p className="mt-3 max-w-md text-xs leading-5 text-white/65 sm:text-sm">{description}</p></div><span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur transition group-hover:translate-x-1 group-hover:border-white group-hover:bg-white group-hover:text-slate-950"><ArrowRight className="size-4" /></span></div><span className="mt-5 block h-px w-full origin-left scale-x-0 bg-white/45 transition-transform duration-500 group-hover:scale-x-100" /></div></Link></article>;
}

function TrustItem({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <div className="group grid w-full max-w-64 grid-cols-[40px_minmax(0,1fr)] items-center gap-3 justify-self-center py-2"><span className="grid size-10 place-items-center rounded-full border border-slate-200 text-slate-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-violet-100 group-hover:bg-violet-50 group-hover:text-violet-400 dark:border-white/15 dark:text-stone-400 dark:group-hover:border-violet-300/30 dark:group-hover:bg-violet-300/10 dark:group-hover:text-violet-200 [&>svg]:size-4">{icon}</span><span className="min-w-0 text-left"><strong className="block text-xs font-semibold text-slate-800 dark:text-stone-100">{title}</strong><span className="mt-0.5 block text-[11px] text-slate-400 dark:text-stone-500">{detail}</span></span></div>;
}

function Reveal({ children, className = "", delay = 0, distance = 28, as = "div" }: { children: ReactNode; className?: string; delay?: number; distance?: number; as?: "div" | "section" }) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.08, rootMargin: "0px 0px -20% 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const Component = as;
  const style = { "--reveal-delay": `${delay}ms`, "--reveal-distance": `${distance}px` } as CSSProperties;
  return <Component ref={ref as never} style={style} className={`landing-reveal ${visible ? "is-visible" : ""} ${className}`}>{children}</Component>;
}
