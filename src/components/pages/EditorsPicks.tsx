import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/store/ProductCard";
import { products } from "@/data/store";

const essentialIds = [27, 23, 25];

export default function EditorsPicks() {
  const essentials = essentialIds.map((id) => products.find((product) => product.id === id)).filter((product) => product !== undefined);
  return <div><section className="relative overflow-hidden bg-[#342054] px-6 py-20 text-white lg:px-8 lg:py-28"><div className="absolute -right-24 -top-32 size-96 rounded-full bg-violet-300/20 blur-3xl" /><div className="relative mx-auto max-w-7xl"><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-violet-100"><Sparkles className="size-4" /> Editor’s pick</p><h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-7xl">The essential makeup edit.</h1><p className="mt-7 max-w-xl text-base leading-7 text-white/65">A polished everyday look begins with three dependable essentials: luminous skin, expressive eyes and a confident lip.</p></div></section><section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24"><div className="mb-10 grid gap-6 border-b border-slate-200 pb-10 sm:grid-cols-3">{["01 · Create the base", "02 · Define the eyes", "03 · Finish with colour"].map((step) => <p key={step} className="text-sm font-semibold">{step}</p>)}</div><div className="grid gap-8 sm:grid-cols-3">{essentials.map((product) => <ProductCard key={product.id} product={product} />)}</div><div className="mt-16 rounded-[2rem] bg-violet-50 p-8 text-center sm:p-12"><h2 className="text-3xl font-semibold tracking-tight">Explore beyond the edit</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">Make the look your own with our complete collection of complexion, eye and lip products.</p><Link to="/products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white">Shop all products <ArrowRight className="size-4" /></Link></div></section></div>;
}
