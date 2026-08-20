import { ChevronLeft, ChevronRight, ChevronsRight, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/store/ProductCard";
import { products as fallbackProducts, type Product } from "@/data/store";
import { api } from "@/lib/api";

const PAGE_SIZE = 9;

export default function ProductCatalogue() {
  const [params, setParams] = useSearchParams();
  const [catalogue, setCatalogue] = useState<Product[]>(fallbackProducts);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const category = params.get("category") ?? "all";
  const brand = params.get("brand") ?? "all";
  const search = params.get("search") ?? "";
  const sort = params.get("sort") ?? "featured";
  const minPrice = Number(params.get("min") ?? 0);
  const maxPrice = Number(params.get("max") ?? 0);
  const requestedPage = Math.max(1, Number(params.get("page") ?? 1) || 1);

  useEffect(() => {
    let active = true;
    api<Product[]>("/products")
      .then((items) => {
        if (!active) return;
        setCatalogue(items.map((item) => ({ ...item, price: Number(item.price), rating: Number(item.rating), reviews: Number(item.reviews) })));
      })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!filterOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [filterOpen]);

  const categories = useMemo(() => [...new Set(catalogue.map((product) => product.category).filter(Boolean))].sort(), [catalogue]);
  const brands = useMemo(() => [...new Set(catalogue.map((product) => product.brand).filter(Boolean))].sort(), [catalogue]);
  const catalogueMax = useMemo(() => Math.ceil(Math.max(...catalogue.map((product) => product.price), 0)), [catalogue]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const items = catalogue.filter((product) => {
      const matchesCategory = category === "all" || product.category.toLowerCase() === category.toLowerCase();
      const matchesBrand = brand === "all" || product.brand.toLowerCase() === brand.toLowerCase();
      const matchesSearch = !query || `${product.name} ${product.brand} ${product.category} ${product.description ?? ""}`.toLowerCase().includes(query);
      const matchesMin = !minPrice || product.price >= minPrice;
      const matchesMax = !maxPrice || product.price <= maxPrice;
      return matchesCategory && matchesBrand && matchesSearch && matchesMin && matchesMax;
    });
    return [...items].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "newest") return Number(b.latest) - Number(a.latest);
      return Number(b.popular) - Number(a.popular);
    });
  }, [brand, catalogue, category, maxPrice, minPrice, search, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, pageCount);
  const shown = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeFilterCount = [category !== "all", brand !== "all", Boolean(search), Boolean(minPrice), Boolean(maxPrice)].filter(Boolean).length;

  const updateParams = (updates: Record<string, string | number | null>, resetPage = true) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all" || value === 0) next.delete(key);
      else next.set(key, String(value));
    });
    if (resetPage) next.delete("page");
    setParams(next, { replace: true });
  };
  const goToPage = (page: number) => {
    updateParams({ page: page <= 1 ? null : page }, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const clearFilters = () => {
    const next = new URLSearchParams();
    if (sort !== "featured") next.set("sort", sort);
    setParams(next, { replace: true });
  };

  return (
    <main className="products-catalogue bg-[#fcfbfa] dark:bg-[#0f0c14]">
      <header className="border-b border-slate-100 bg-gradient-to-b from-violet-50/50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-violet-400"><Sparkles className="size-3.5" /> The collection</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6"><div><h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Find your new favourites.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Explore makeup essentials, modern formulas and iconic beauty from brands we love.</p></div><span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-medium text-slate-500 shadow-sm">{filtered.length} {filtered.length === 1 ? "product" : "products"}</span></div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
        <div className="mb-7 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:hidden"><button type="button" onClick={() => setFilterOpen(true)} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white"><SlidersHorizontal className="size-4" /> Filters {activeFilterCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-violet-400 text-[10px] text-white">{activeFilterCount}</span>}</button><SortSelect value={sort} onChange={(value) => updateParams({ sort: value })} compact /></div>

        <div className="grid items-start gap-9 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)] xl:gap-12">
          {filterOpen && <button type="button" aria-label="Close filters" onClick={() => setFilterOpen(false)} className="fixed inset-0 z-[60] bg-slate-950/35 backdrop-blur-sm lg:hidden" />}
          <aside className={`${filterOpen ? "fixed inset-x-3 bottom-3 z-[70] flex max-h-[85vh]" : "hidden"} flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl lg:sticky lg:top-28 lg:z-auto lg:flex lg:max-h-[calc(100vh-8.5rem)] lg:shadow-none`}>
            <div className="z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-4"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-xl bg-slate-950 text-white"><SlidersHorizontal className="size-3.5" /></span><h2 className="font-semibold">Refine</h2>{activeFilterCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-violet-400 text-[10px] font-semibold text-white">{activeFilterCount}</span>}</div><button type="button" aria-label="Close filters" onClick={() => setFilterOpen(false)} className="grid size-9 place-items-center rounded-full bg-slate-100 lg:hidden"><X className="size-4" /></button>{activeFilterCount > 0 && <button type="button" onClick={clearFilters} className="hidden text-xs font-semibold text-violet-400 hover:text-violet-500 lg:block">Clear all</button>}</div>
            <div className="min-h-0 overflow-y-auto p-5">
              <label className="relative block"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => updateParams({ search: event.target.value })} placeholder="Search products" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100" /></label>
              <FilterGroup title="Category"><FilterOption label="All products" active={category === "all"} count={catalogue.length} onClick={() => updateParams({ category: null })} />{categories.map((item) => <FilterOption key={item} label={item} active={category.toLowerCase() === item.toLowerCase()} count={catalogue.filter((product) => product.category === item).length} onClick={() => updateParams({ category: item.toLowerCase() })} />)}</FilterGroup>
              <FilterGroup title="Brand"><FilterOption label="All brands" active={brand === "all"} onClick={() => updateParams({ brand: null })} />{brands.map((item) => <FilterOption key={item} label={item} active={brand.toLowerCase() === item.toLowerCase()} onClick={() => updateParams({ brand: item.toLowerCase() })} />)}</FilterGroup>
              <FilterGroup title="Price range"><div className="grid grid-cols-2 gap-2"><PriceInput label="Min" value={minPrice || ""} onChange={(value) => updateParams({ min: value })} /><PriceInput label="Max" value={maxPrice || ""} placeholder={String(catalogueMax)} onChange={(value) => updateParams({ max: value })} /></div></FilterGroup>
              <div className="sticky -bottom-5 -mx-5 mt-6 border-t border-slate-100 bg-white p-4 lg:hidden"><button type="button" onClick={() => setFilterOpen(false)} className="w-full rounded-full bg-slate-950 py-3 text-sm font-semibold text-white">Show {filtered.length} products</button></div>
              {activeFilterCount > 0 && <button type="button" onClick={clearFilters} className="mt-5 hidden w-full rounded-full border border-slate-200 py-2.5 text-xs font-semibold transition hover:border-slate-950 hover:bg-slate-950 hover:text-white lg:block">Clear all filters</button>}
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="hidden items-center justify-between lg:flex"><p className="text-sm text-slate-500">Showing <strong className="font-semibold text-slate-900">{filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}</strong> of {filtered.length}</p><SortSelect value={sort} onChange={(value) => updateParams({ sort: value })} /></div>{activeFilterCount > 0 && <div className="flex flex-wrap items-center gap-2 lg:mt-4 lg:border-t lg:border-slate-100 lg:pt-4"><span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Active</span>{category !== "all" && <FilterChip label={category} onRemove={() => updateParams({ category: null })} />}{brand !== "all" && <FilterChip label={brand} onRemove={() => updateParams({ brand: null })} />}{search && <FilterChip label={`“${search}”`} onRemove={() => updateParams({ search: null })} />}{minPrice > 0 && <FilterChip label={`From £${minPrice}`} onRemove={() => updateParams({ min: null })} />}{maxPrice > 0 && <FilterChip label={`Up to £${maxPrice}`} onRemove={() => updateParams({ max: null })} />}</div>}{activeFilterCount === 0 && <p className="text-xs text-slate-400 lg:hidden">Showing all {filtered.length} products</p>}</div>
            {loading ? <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">{Array.from({ length: PAGE_SIZE }, (_, index) => <div key={index} className="animate-pulse"><div className="aspect-square rounded-3xl bg-slate-100" /><div className="mt-4 h-3 w-1/3 rounded bg-slate-100" /><div className="mt-2 h-4 w-3/4 rounded bg-slate-100" /></div>)}</div> : shown.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">{shown.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="grid min-h-96 place-items-center rounded-[2rem] border border-dashed border-slate-200 bg-white p-8 text-center"><div><Search className="mx-auto size-8 text-slate-300" /><h2 className="mt-4 text-xl font-semibold">No products found</h2><p className="mt-2 text-sm text-slate-500">Try adjusting or clearing your filters.</p><button type="button" onClick={clearFilters} className="mt-5 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white">Clear filters</button></div></div>}

            {filtered.length > PAGE_SIZE && <Pagination current={currentPage} total={pageCount} onChange={goToPage} />}
          </section>
        </div>
      </div>
    </main>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) { return <div className="mt-6 border-t border-slate-100 pt-5"><h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</h3><div className="space-y-1">{children}</div></div>; }
function FilterOption({ label, active, count, onClick }: { label: string; active: boolean; count?: number; onClick: () => void }) { return <button type="button" onClick={onClick} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${active ? "bg-slate-950 font-medium text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}><span>{label}</span>{count !== undefined && <span className={`text-[10px] ${active ? "text-white/50" : "text-slate-400"}`}>{count}</span>}</button>; }
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) { return <button type="button" onClick={onRemove} className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-medium capitalize text-violet-600 transition hover:bg-violet-50">{label}<X className="size-3" /></button>; }
function PriceInput({ label, value, placeholder, onChange }: { label: string; value: number | string; placeholder?: string; onChange: (value: string | null) => void }) { return <label className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}<span className="relative mt-1.5 block"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">£</span><input type="number" min="0" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value || null)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-2 text-sm outline-none focus:border-slate-300 focus:bg-white" /></span></label>; }
function SortSelect({ value, onChange, compact = false }: { value: string; onChange: (value: string) => void; compact?: boolean }) { return <label className={`flex items-center gap-2 ${compact ? "min-w-0 flex-1" : ""}`}><span className={compact ? "sr-only" : "text-xs text-slate-400"}>Sort</span><select aria-label="Sort products" value={value} onChange={(event) => onChange(event.target.value)} className={`h-10 rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold outline-none transition focus:border-slate-400 ${compact ? "min-w-0 flex-1 border-0 bg-transparent px-2" : ""}`}><option value="featured">Featured</option><option value="newest">Newest</option><option value="rating">Top rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>; }

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (page: number) => void }) {
  const pages: Array<number | "ellipsis"> = total <= 7 ? Array.from({ length: total }, (_, index) => index + 1) : current <= 4 ? [1, 2, 3, 4, 5, "ellipsis", total] : current >= total - 3 ? [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total] : [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
  return <nav aria-label="Product pages" className="mt-14 flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 pt-8"><button type="button" onClick={() => onChange(current - 1)} disabled={current === 1} aria-label="Previous page" className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white transition hover:border-slate-950 disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft className="size-4" /></button>{pages.map((page, index) => page === "ellipsis" ? <span key={`ellipsis-${index}`} className="grid size-10 place-items-center text-sm text-slate-400">…</span> : <button type="button" key={page} onClick={() => onChange(page)} aria-current={current === page ? "page" : undefined} className={`grid size-10 place-items-center rounded-full text-sm font-semibold transition ${current === page ? "bg-slate-950 text-white" : "border border-slate-200 bg-white hover:border-slate-950"}`}>{page}</button>)}<button type="button" onClick={() => onChange(current + 1)} disabled={current === total} aria-label="Next page" className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white transition hover:border-slate-950 disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight className="size-4" /></button><button type="button" onClick={() => onChange(total)} disabled={current === total} aria-label="Last page" className="flex h-10 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold transition hover:border-slate-950 disabled:cursor-not-allowed disabled:opacity-30"><span className="sr-only">Last page</span><ChevronsRight className="size-4" /></button></nav>;
}
