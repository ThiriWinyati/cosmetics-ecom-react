import { Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Product } from "@/data/store";
import { api, getSessionUser, notifyCartUpdated, notifyWishlistUpdated } from "@/lib/api";

export default function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [adding, setAdding] = useState(false);
  const requireCustomer = () => { if (getSessionUser()?.role !== "customer") { navigate("/login"); return false; } return true; };
  const addToWishlist = async () => { if (!requireCustomer()) return; try { await api("/customer/wishlist", { method: "POST", body: JSON.stringify({ productId: product.id }) }); setSaved(true); notifyWishlistUpdated(); } catch { setSaved(false); } };
  const addToCart = async () => { if (!requireCustomer()) return; setAdding(true); try { await api("/customer/cart", { method: "POST", body: JSON.stringify({ productId: product.id, quantity: 1 }) }); notifyCartUpdated(); } finally { setAdding(false); } };
  return (
    <article className="group min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-stone-50 transition-colors dark:border dark:border-white/8 dark:bg-[#1c191c]">
        <Link to={`/products/${product.id}`}>
          <img src={product.image} alt={product.name} className="size-full object-contain p-6 transition-transform duration-500 group-hover:scale-105" />
        </Link>
        <button type="button" onClick={addToWishlist} aria-label={`Add ${product.name} to wishlist`} className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 shadow-sm transition hover:bg-violet-50 hover:text-violet-400 dark:bg-[#2b252a]/90 dark:text-stone-300 dark:ring-1 dark:ring-white/10 dark:hover:bg-violet-400 dark:hover:text-white ${saved ? "text-violet-400 dark:bg-violet-400 dark:text-white" : ""}`}>
          <Heart className={`size-4 ${saved ? "fill-current" : ""}`} />
        </button>
        {product.latest && <span className="absolute left-3 top-3 rounded-full bg-slate-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">New</span>}
        <div className="absolute inset-x-3 bottom-3 translate-y-0 opacity-100 transition-all duration-300 ease-out md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
          <button type="button" onClick={addToCart} disabled={adding} className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-xs font-semibold text-white shadow-[0_12px_30px_-12px_rgba(15,23,42,.65)] transition hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70 dark:bg-violet-300 dark:text-violet-950 dark:hover:bg-violet-200">
            <ShoppingBag className="size-3.5" /> {adding ? "Adding…" : "Add to cart"}
          </button>
        </div>
      </div>
      <div className="px-1 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{product.brand} · {product.category}</p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <Link to={`/products/${product.id}`} className="font-semibold tracking-tight hover:underline">{product.name}</Link>
          <span className="font-semibold">£{product.price.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex items-center text-xs text-slate-500">
          <span className="flex items-center gap-1"><Star className="size-3.5 fill-amber-400 text-amber-400" /> {product.rating} ({product.reviews})</span>
        </div>
      </div>
    </article>
  );
}
