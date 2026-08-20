import { ChevronDown, ChevronLeft, ChevronRight, Heart, Lock, Minus, Plus, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProductCard from "@/components/store/ProductCard";
import { products, type Product } from "@/data/store";
import { api, getSessionUser, notifyCartUpdated, notifyWishlistUpdated } from "@/lib/api";

type Shade = { id: number; name: string; quantity: number; image: string | null };
type Review = { id: number; rating: number; text: string; date: string; customer: string };
type DetailProduct = Product & { images: string[]; shades: Shade[]; related: Product[]; reviewsList: Review[] };

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<DetailProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedShade, setSelectedShade] = useState<Shade | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewSort, setReviewSort] = useState<"recent" | "highest" | "lowest">("recent");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [saved, setSaved] = useState(false);
  const [savingFavourite, setSavingFavourite] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api<Record<string, unknown>>(`/products/${productId}`).then((data) => {
      if (!active) return;
      const detail = normalizeProduct(data);
      setProduct(detail);
      setSelectedShade(detail.shades.find((shade) => shade.quantity > 0) ?? detail.shades[0] ?? null);
    }).catch(() => {
      const fallback = products.find((item) => item.id === Number(productId));
      if (active && fallback) setProduct({ ...fallback, images: [fallback.image], shades: [], related: products.filter((item) => item.category === fallback.category && item.id !== fallback.id).slice(0, 4), reviewsList: [] });
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId]);

  useEffect(() => {
    setSaved(false);
    if (getSessionUser()?.role !== "customer" || !productId) return;
    let active = true;
    api<Array<{ productId: number }>>("/customer/wishlist")
      .then((items) => { if (active) setSaved(items.some((item) => Number(item.productId) === Number(productId))); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    const gallerySection = document.querySelector<HTMLElement>('div[class~="lg:grid-cols-[1.05fr_0.95fr]"] > section:first-child');
    const descriptionSection = document.getElementById("description");
    if (!gallerySection || !descriptionSection) return;

    let frame = 0;
    const updateGalleryBoundary = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (window.innerWidth < 1024) {
          gallerySection.style.removeProperty("transform");
          gallerySection.style.removeProperty("will-change");
          return;
        }
        const stickyTop = 112;
        const descriptionBottom = descriptionSection.getBoundingClientRect().bottom;
        const galleryHeight = gallerySection.getBoundingClientRect().height;
        const boundaryOffset = Math.min(0, descriptionBottom - stickyTop - galleryHeight);
        gallerySection.style.transform = `translate3d(0, ${boundaryOffset}px, 0)`;
        gallerySection.style.willChange = "transform";
      });
    };

    const descriptionResizeObserver = new ResizeObserver(updateGalleryBoundary);
    descriptionResizeObserver.observe(descriptionSection);
    window.addEventListener("scroll", updateGalleryBoundary, { passive: true });
    window.addEventListener("resize", updateGalleryBoundary);
    updateGalleryBoundary();

    return () => {
      cancelAnimationFrame(frame);
      descriptionResizeObserver.disconnect();
      window.removeEventListener("scroll", updateGalleryBoundary);
      window.removeEventListener("resize", updateGalleryBoundary);
      gallerySection.style.removeProperty("transform");
      gallerySection.style.removeProperty("will-change");
    };
  }, [product]);

  const gallery = useMemo(() => product ? [...new Set([product.image, ...product.images, ...product.shades.map((shade) => shade.image).filter((image): image is string => !!image)])] : [], [product]);
  const reviews = product?.reviewsList ?? [];
  const storedReviewCount = Number(product?.reviews);
  const reviewCount = reviews.length || (Number.isFinite(storedReviewCount) ? Math.max(0, storedReviewCount) : 0);
  const sortedReviews = [...reviews].sort((a, b) => reviewSort === "highest" ? b.rating - a.rating : reviewSort === "lowest" ? a.rating - b.rating : new Date(b.date).getTime() - new Date(a.date).getTime());
  const pageCount = Math.max(1, Math.ceil(sortedReviews.length / 4));
  const shownReviews = sortedReviews.slice((reviewPage - 1) * 4, reviewPage * 4);
  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => reviews.filter((review) => review.rating === stars).length);
  const catalogueMatches = product ? products.filter((item) => item.id !== product.id && item.category === product.category) : [];
  const relatedProducts = product ? (product.related.length ? product.related : (catalogueMatches.length ? catalogueMatches : products.filter((item) => item.id !== product.id)).slice(0, 4)) : [];

  if (loading) return <div className="mx-auto max-w-7xl px-6 py-24 text-center text-sm text-slate-500">Loading product details…</div>;
  if (!product) return <div className="mx-auto max-w-7xl px-6 py-24 text-center"><h1 className="text-3xl font-semibold">Product not found</h1><Link to="/products" className="mt-5 inline-block underline">Return to products</Link></div>;

  const selectShade = (shade: Shade) => { setSelectedShade(shade); setQuantity(1); if (shade.image) { const index = gallery.indexOf(shade.image); if (index >= 0) setImageIndex(index); } };
  const requireCustomer = () => { const user = getSessionUser(); if (user?.role !== "customer") { navigate("/login"); return false; } return true; };
  const addToCart = async () => { if (!requireCustomer()) return; if (product.shades.length && !selectedShade) { setNotice({ type: "error", text: "Please select a shade." }); return; } try { await api("/customer/cart", { method: "POST", body: JSON.stringify({ productId: product.id, shadeId: selectedShade?.id ?? null, quantity }) }); notifyCartUpdated(); setNotice({ type: "success", text: `${product.name} was added to your bag.` }); } catch (error) { setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not add to bag" }); } };
  const addToWishlist = async () => { if (!requireCustomer() || saved || savingFavourite) return; setSavingFavourite(true); try { await api("/customer/wishlist", { method: "POST", body: JSON.stringify({ productId: product.id }) }); setSaved(true); notifyWishlistUpdated(); setNotice({ type: "success", text: `${product.name} was saved to your wishlist.` }); } catch (error) { setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not save product" }); } finally { setSavingFavourite(false); } };

  return <div className="bg-white"><div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-14"><div className="mb-8 text-sm text-slate-500"><Link to="/products" className="hover:text-slate-950">Products</Link><span className="mx-2">/</span><span>{product.name}</span></div><div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16"><section><div className="relative aspect-square overflow-hidden rounded-[2rem] bg-stone-50"><img src={gallery[imageIndex] ?? product.image} alt={product.name} className="size-full object-contain p-10 transition-opacity" />{gallery.length > 1 && <><button onClick={() => setImageIndex((imageIndex - 1 + gallery.length) % gallery.length)} aria-label="Previous product image" className="absolute left-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white shadow-md"><ChevronLeft className="size-5" /></button><button onClick={() => setImageIndex((imageIndex + 1) % gallery.length)} aria-label="Next product image" className="absolute right-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white shadow-md"><ChevronRight className="size-5" /></button><span className="absolute bottom-4 right-5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium">{imageIndex + 1} / {gallery.length}</span></>}</div>{gallery.length > 1 && <div className="mt-4 flex gap-3 overflow-x-auto pb-1">{gallery.map((image, index) => <button key={`${image}-${index}`} onClick={() => setImageIndex(index)} className={`size-18 shrink-0 overflow-hidden rounded-xl border-2 bg-stone-50 p-1 transition ${imageIndex === index ? "border-slate-950" : "border-transparent hover:border-slate-300"}`}><img src={image} alt="" className="size-full object-contain" /></button>)}</div>}</section><section className="flex flex-col justify-center"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">{product.brand} · {product.category}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{product.name}</h1><button onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })} className="mt-4 flex w-fit items-center gap-2 text-sm"><span className="flex">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`size-4 ${star <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />)}</span><strong>{product.rating.toFixed(1)}</strong><span className="text-slate-400">{reviews.length || product.reviews} reviews</span></button><p className="mt-7 text-2xl font-semibold">£{product.price.toFixed(2)}</p><p className="mt-5 line-clamp-3 leading-7 text-slate-600">{product.description}</p>{product.shades.length > 0 && <div className="mt-8"><div className="flex items-center justify-between"><p className="text-sm font-semibold">Available shades</p>{selectedShade && <p className={`text-xs ${selectedShade.quantity ? "text-emerald-600" : "text-violet-500"}`}>{selectedShade.quantity ? `${selectedShade.quantity} in stock` : "Out of stock"}</p>}</div><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{product.shades.map((shade) => <button key={shade.id} onClick={() => selectShade(shade)} disabled={!shade.quantity} className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition ${selectedShade?.id === shade.id ? "border-slate-950 bg-slate-50 ring-1 ring-slate-950" : "border-slate-200 hover:border-slate-400"} disabled:cursor-not-allowed disabled:opacity-40`}><span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-stone-50">{shade.image ? <img src={shade.image} alt="" className="size-full object-contain" /> : <span className="size-5 rounded-full bg-violet-100" />}</span><span className="truncate font-medium">{shade.name}</span></button>)}</div></div>}<div className="mt-8 flex items-end gap-4"><div><p className="mb-2 text-xs font-semibold">Quantity</p><div className="inline-flex items-center rounded-full border border-slate-200 p-1"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity" className="grid size-9 place-items-center rounded-full hover:bg-slate-100"><Minus className="size-4" /></button><span className="w-10 text-center text-sm font-semibold">{quantity}</span><button onClick={() => setQuantity(Math.min(selectedShade?.quantity ?? 99, quantity + 1))} aria-label="Increase quantity" className="grid size-9 place-items-center rounded-full hover:bg-slate-100"><Plus className="size-4" /></button></div></div><button onClick={addToCart} disabled={selectedShade?.quantity === 0} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"><ShoppingBag className="size-4" /> Add to bag</button><button onClick={addToWishlist} disabled={saved || savingFavourite} aria-label={saved ? "Saved to wishlist" : "Add to wishlist"} aria-pressed={saved} className={`grid size-12 place-items-center rounded-full border transition-all duration-300 ${saved ? "border-violet-100 bg-violet-50 text-violet-400 shadow-sm" : "border-slate-200 hover:border-violet-100 hover:bg-violet-50 hover:text-violet-400"} disabled:cursor-default`}><Heart className={`size-5 transition-all duration-300 ${saved ? "scale-110 fill-current" : ""}`} /></button></div>{notice && <p className={`mt-4 rounded-xl p-3 text-sm ${notice.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-violet-50 text-violet-600"}`}>{notice.text}</p>}<div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500"><span className="flex items-center gap-2"><Truck className="size-4" /> Free delivery over £50</span><span className="flex items-center gap-2"><ShieldCheck className="size-4" /> Authentic products</span><span className="flex items-center gap-2"><ChevronRight className="size-4" /> 30-day easy returns</span><span className="flex items-center gap-2"><Lock className="size-4" /> Secure checkout</span></div></section></div>

      <section id="description" className="scroll-mt-32 pt-10 lg:ml-[calc(52.5%+2rem)] lg:pt-12">
        <div className={`overflow-hidden rounded-2xl border transition-colors ${descriptionOpen ? "border-slate-300 bg-stone-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
          <button type="button" onClick={() => setDescriptionOpen((open) => !open)} aria-expanded={descriptionOpen} aria-controls="product-description-content" className="flex w-full items-center justify-between gap-4 p-5 text-left sm:px-6">
            <span><span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400">Product details</span><span className="mt-1 block text-lg font-semibold tracking-tight text-slate-950">Description</span></span>
            <span className={`grid size-10 shrink-0 place-items-center rounded-full transition ${descriptionOpen ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}><ChevronDown className={`size-4 transition-transform duration-300 ${descriptionOpen ? "rotate-180" : ""}`} /></span>
          </button>
          <div id="product-description-content" className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${descriptionOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden"><div className="border-t border-slate-200 px-5 pb-6 pt-5 sm:px-6"><p className="whitespace-pre-line text-sm leading-7 text-slate-600">{stripHtml(product.description)}</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">{product.brand}</span><span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">{product.category}</span></div></div></div>
          </div>
        </div>
      </section>

      <section id="reviews" className="scroll-mt-32 py-16 lg:py-24">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)] sm:p-8 lg:p-10">
          <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-400">Loved by our community</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-4xl">Customer Reviews</h2><p className="mt-3 text-sm text-slate-500">Honest feedback from customers who have tried this product.</p></div>

          <div className="mt-8 grid gap-8 rounded-3xl bg-gradient-to-br from-stone-50 to-violet-50/50 p-6 sm:p-8 lg:grid-cols-[190px_390px_1fr] lg:items-center">
            <div className="lg:border-r lg:border-slate-200 lg:pr-8">
              <div className="flex gap-1">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`size-5 ${star <= Math.round(product.rating) ? "fill-violet-300 text-violet-300" : "text-slate-200"}`} />)}</div>
              <p className="mt-2 text-sm text-slate-600">{reviewCount ? `Based on ${reviewCount} reviews` : "No reviews yet"}</p>
            </div>

            <div className="space-y-2 lg:border-r lg:border-slate-200 lg:pr-8">
              {[5, 4, 3, 2, 1].map((stars, index) => { const count = ratingCounts[index]; const percentage = reviews.length ? Math.round((count / reviews.length) * 100) : 0; return <div key={stars} className="grid grid-cols-[104px_1fr_70px] items-center gap-2"><div className="flex">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`size-4 ${star <= stars ? "fill-violet-300 text-violet-300" : "text-slate-200"}`} />)}</div><div className="h-2 overflow-hidden rounded-full bg-white shadow-inner"><div className="h-full rounded-full bg-gradient-to-r from-violet-300 to-violet-500 transition-[width] duration-500" style={{ width: `${percentage}%` }} /></div><span className="text-xs text-slate-500">{percentage}% <span className="ml-1">({count})</span></span></div>; })}
            </div>

            <div className="flex lg:justify-end"><button type="button" onClick={() => setReviewFormOpen((open) => !open)} className="h-11 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-violet-400">{reviewFormOpen ? "Close review form" : "Write a review"}</button></div>
          </div>

          {reviewFormOpen && <div className="mt-8 border-y border-slate-200 py-8"><ReviewForm rating={rating} setRating={setRating} text={reviewText} setText={setReviewText} onSubmit={async () => { if (!requireCustomer()) return; try { await api("/customer/reviews", { method: "POST", body: JSON.stringify({ productId: product.id, rating, text: reviewText }) }); const newReview = { id: Date.now(), rating, text: reviewText, date: new Date().toISOString(), customer: getSessionUser()?.name ?? "Customer" }; setProduct((current) => current ? { ...current, reviewsList: [newReview, ...current.reviewsList] } : current); setReviewText(""); setReviewPage(1); setReviewFormOpen(false); setNotice({ type: "success", text: "Thank you—your review was submitted." }); } catch (error) { setNotice({ type: "error", text: error instanceof Error ? error.message : "Review could not be submitted" }); } }} /></div>}

          <div className="mt-8 flex items-center justify-between gap-4 border-b border-slate-200 pb-6"><p className="text-sm font-semibold text-slate-700">{reviewCount ? `${reviewCount} customer reviews` : "No customer reviews yet"}</p><div className="relative shrink-0"><label className="sr-only" htmlFor="review-sort">Sort reviews</label><select id="review-sort" value={reviewSort} onChange={(event) => { setReviewSort(event.target.value as "recent" | "highest" | "lowest"); setReviewPage(1); }} className="h-10 min-w-44 appearance-none rounded-full border border-slate-200 bg-stone-50 pl-4 pr-11 text-sm font-medium text-slate-600 outline-none transition focus:border-slate-500 focus:bg-white"><option value="recent">Most Recent</option><option value="highest">Highest Rated</option><option value="lowest">Lowest Rated</option></select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" /></div></div>

          {!shownReviews.length ? <div className="py-14 text-center"><Star className="mx-auto size-7 text-slate-300" /><h3 className="mt-4 font-semibold">Be the first to review</h3><p className="mt-2 text-sm text-slate-500">Share your experience with this product.</p></div> : <div className="mt-6 grid gap-4">{shownReviews.map((review) => <article key={review.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-0.5 hover:border-violet-100 hover:shadow-xl hover:shadow-slate-200/50 sm:grid-cols-[64px_1fr]"><div className="relative grid size-14 place-items-center rounded-full bg-gradient-to-br from-violet-50 to-violet-100 text-lg font-semibold uppercase text-violet-400">{review.customer.charAt(0)}<span className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-slate-950 text-white ring-2 ring-white"><ShieldCheck className="size-3" /></span></div><div><div className="flex flex-wrap items-center justify-between gap-3"><div><strong className="text-sm text-slate-900">{review.customer}</strong><span className="ml-2 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">Verified buyer</span></div><time className="text-xs text-slate-400">{new Date(review.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</time></div><div className="mt-3 flex">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`size-4 ${star <= review.rating ? "fill-violet-300 text-violet-300" : "text-slate-200"}`} />)}</div><p className="mt-4 text-sm leading-7 text-slate-600">{review.text}</p><p className="mt-4 text-xs font-medium text-slate-400">Reviewing {product.name}</p></div></article>)}</div>}

          {pageCount > 1 && <div className="mt-7 flex items-center justify-center gap-2">{Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => <button key={page} onClick={() => setReviewPage(page)} aria-label={`Review page ${page}`} className={`grid size-10 place-items-center text-sm font-semibold transition ${page === reviewPage ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-500"}`}>{page}</button>)}</div>}
        </div>
      </section>

      <section className="border-t border-slate-200 py-16 lg:py-24"><div className="mb-9 flex items-end justify-between gap-6"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">Complete your routine</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">You may also like</h2><p className="mt-2 text-sm text-slate-500">More beauty essentials selected to complement your routine.</p></div><Link to="/products" className="shrink-0 text-sm font-semibold transition hover:text-violet-400">View all</Link></div>{relatedProducts.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">{relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-200 bg-stone-50 px-6 py-10 text-center text-sm text-slate-500">More recommendations are coming soon.</div>}</section>
    </div></div>;
}

function ReviewForm({ rating, setRating, text, setText, onSubmit }: { rating: number; setRating: (rating: number) => void; text: string; setText: (text: string) => void; onSubmit: () => void }) {
  return <div className="mx-auto max-w-3xl"><h3 className="text-xl font-semibold tracking-tight">Write a review</h3><p className="mt-2 text-xs leading-5 text-slate-500">Reviews are available after your order for this product has been delivered.</p><div className="mt-6 flex flex-wrap items-center gap-4"><span className="text-xs font-semibold text-slate-700">Your rating</span><div className="flex gap-1">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" onClick={() => setRating(star)} aria-label={`${star} stars`} className="transition hover:scale-110"><Star className={`size-6 ${star <= rating ? "fill-violet-300 text-violet-300" : "text-slate-300"}`} /></button>)}</div></div><label htmlFor="review-text" className="mt-6 block text-xs font-semibold text-slate-700">Your review</label><textarea id="review-text" value={text} onChange={(event) => setText(event.target.value)} rows={5} placeholder="What did you love about this product?" className="mt-2 w-full resize-none border border-slate-200 bg-white p-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-500" /><div className="mt-4 flex justify-end"><button type="button" onClick={onSubmit} disabled={!text.trim()} className="h-11 bg-slate-950 px-7 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40">Submit review</button></div></div>;
}

function normalizeProduct(data: Record<string, unknown>): DetailProduct {
  const related = (data.related as Array<Record<string, unknown>> ?? []).map(normalizeCard);
  return { ...normalizeCard(data), images: data.images as string[] ?? [], shades: data.shades as Shade[] ?? [], related, reviewsList: data.reviewsList as Review[] ?? [] };
}
function normalizeCard(data: Record<string, unknown>): Product { return { id: finiteNumber(data.id), name: String(data.name), category: String(data.category ?? "Beauty"), brand: String(data.brand ?? "Charm & Grace"), price: finiteNumber(data.price), image: String(data.image ?? "/logo.png"), rating: finiteNumber(data.rating), reviews: finiteNumber(data.reviews), description: String(data.description ?? ""), latest: Boolean(data.latest), popular: Boolean(data.popular) }; }
function finiteNumber(value: unknown) { const number = Number(value); return Number.isFinite(number) ? number : 0; }
function stripHtml(value: string) { return value.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " "); }
