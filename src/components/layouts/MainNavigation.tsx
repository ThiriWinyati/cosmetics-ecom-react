import * as React from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    ArrowUpRight,
    ChevronDown,
    Heart,
    Minus,
    LogOut,
    Menu,
    Moon,
    Plus,
    Package,
    Search,
    ShoppingBag,
    Sparkles,
    Sun,
    Trash2,
    Truck,
    UserRound,
    X,
} from "lucide-react";

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import type { MainNavItem } from "@/types";
import { siteConfig } from "@/config/site";
import { api, CART_UPDATED_EVENT, clearSession, getSessionUser, notifyCartUpdated } from "@/lib/api";

interface MainNavigationProps {
    items?: MainNavItem[];
}

type MiniCartItem = { id: number; productId: number; name: string; price: number | string; image: string; quantity: number; shade?: string | null };

export default function MainNavigation({
    items = siteConfig.mainNav,
}: MainNavigationProps) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isCartOpen, setIsCartOpen] = React.useState(false);
    const [cartCount, setCartCount] = React.useState(0);
    const [darkMode, setDarkMode] = React.useState(() => {
        const saved = localStorage.getItem("color-theme");
        return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    });
    const [cartItems, setCartItems] = React.useState<MiniCartItem[]>([]);
    const [cartLoading, setCartLoading] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const primaryNav = items?.[0];
    const user = getSessionUser();
    const signOut = () => { clearSession(); window.location.assign("/login?logout=success"); };
    const submitSearch = (event: React.FormEvent) => {
        event.preventDefault();
        const query = searchQuery.trim();
        navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
        setIsMenuOpen(false);
    };

    React.useEffect(() => {
        if (location.pathname === "/products") setSearchQuery(new URLSearchParams(location.search).get("search") ?? "");
    }, [location.pathname, location.search]);

    React.useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
        document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
        localStorage.setItem("color-theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const loadCart = React.useCallback(async () => {
            if (getSessionUser()?.role !== "customer") { setCartCount(0); setCartItems([]); return; }
            setCartLoading(true);
            try {
                const cart = await api<MiniCartItem[]>("/customer/cart");
                setCartItems(cart);
                setCartCount(cart.reduce((total, item) => total + Number(item.quantity || 0), 0));
            } catch { setCartCount(0); setCartItems([]); }
            finally { setCartLoading(false); }
    }, []);

    React.useEffect(() => {
        void loadCart();
        window.addEventListener(CART_UPDATED_EVENT, loadCart);
        return () => window.removeEventListener(CART_UPDATED_EVENT, loadCart);
    }, [location.pathname, loadCart]);

    React.useEffect(() => {
        if (!isCartOpen) return;
        void loadCart();
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setIsCartOpen(false); };
        window.addEventListener("keydown", closeOnEscape);
        return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
    }, [isCartOpen, loadCart]);

    return (
        <div className="customer-navigation sticky top-0 z-50 border-b border-black/5 bg-white/90 text-slate-950 shadow-[0_1px_18px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-colors dark:border-white/8 dark:bg-[#15111b]/92 dark:text-stone-100">
            <div className="mx-auto flex h-18 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:h-20 lg:px-8">
                <Brand />

                <div className="hidden min-w-0 flex-1 lg:block">
                    <form onSubmit={submitSearch} className="group relative mx-auto block max-w-xl"><label>
                        <span className="sr-only">Search products</span>
                        <Search
                            className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-900"
                            strokeWidth={1.8}
                        />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search makeup, skincare and more"
                            className="h-11 w-full rounded-full border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                        /></label><button type="submit" className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-400 shadow-sm transition hover:bg-violet-400 hover:text-white dark:bg-white/8 dark:hover:bg-violet-300 dark:hover:text-violet-950" aria-label="Search products"><ArrowUpRight className="size-3.5" /></button>
                    </form>
                </div>

                <div className="ml-auto hidden items-center gap-1 lg:flex">
                    <ThemeButton dark={darkMode} onToggle={() => setDarkMode((current) => !current)} />
                    <IconLink to={user?.role === "customer" ? "/wishlist" : "/login"} label="Wishlist" iconOnly><HeartIcon /></IconLink>
                    <button type="button" onClick={() => setIsCartOpen(true)} aria-label="Open cart" title="Cart" aria-expanded={isCartOpen} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"><CartIcon count={cartCount} /></button>
                    {user?.role === "customer" ? <AccountMenu name={user.name} email={user.email} onSignOut={signOut} /> : <IconLink to="/login" label="Log in"><UserRound className="size-5" strokeWidth={1.7} /></IconLink>}
                </div>

                <div className="ml-auto flex items-center gap-1 lg:hidden">
                    <ThemeButton dark={darkMode} onToggle={() => setDarkMode((current) => !current)} compact />
                    <IconLink to={user?.role === "customer" ? "/wishlist" : "/login"} label="Wishlist"><HeartIcon /></IconLink>
                    <IconLink to="/cart" label="Cart">
                        <CartIcon count={cartCount} />
                    </IconLink>
                    <button
                        type="button"
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMenuOpen}
                        onClick={() => setIsMenuOpen((open) => !open)}
                        className="grid size-10 place-items-center rounded-full transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                        {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            <div className="hidden border-t border-slate-100 dark:border-white/8 lg:block">
                <div className="mx-auto flex h-13 max-w-7xl items-center justify-between px-8">
                    <DesktopMenu item={primaryNav} />
                    <p className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-stone-400">
                        <Sparkles className="size-3.5 text-violet-300" />
                        Beauty, thoughtfully selected
                    </p>
                </div>
            </div>

            {isMenuOpen && (
                <MobileMenu
                    item={primaryNav}
                    userName={user?.role === "customer" ? user.name : undefined}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSearch={submitSearch}
                    onSignOut={signOut}
                    onNavigate={() => setIsMenuOpen(false)}
                />
            )}
            {isCartOpen && <MiniCartSheet items={cartItems} loading={cartLoading} signedIn={user?.role === "customer"} onClose={() => setIsCartOpen(false)} onRefresh={loadCart} />}
        </div>
    );
}

function CartIcon({ count }: { count: number }) {
    return <span className="relative"><ShoppingBag className="size-5" strokeWidth={1.7} />{count > 0 && <span className="absolute -right-2.5 -top-2.5 grid min-w-4.5 h-4.5 place-items-center rounded-full bg-violet-400 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">{count > 99 ? "99+" : count}</span>}</span>;
}

function HeartIcon() {
    return <Heart className="size-5" strokeWidth={1.7} />;
}

function ThemeButton({ dark, onToggle, compact = false }: { dark: boolean; onToggle: () => void; compact?: boolean }) {
    return <button type="button" onClick={onToggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"} className="group/theme grid size-10 place-items-center rounded-full transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"><span className="relative grid size-5 place-items-center overflow-hidden">{dark ? <Sun className="size-5 transition-transform duration-300 group-hover/theme:rotate-45" strokeWidth={1.7} /> : <Moon className="size-5 transition-transform duration-300 group-hover/theme:-rotate-12" strokeWidth={1.7} />}</span><span className="sr-only">{compact ? "Toggle theme" : dark ? "Light mode" : "Dark mode"}</span></button>;
}

function AccountMenu({ name, email, onSignOut }: { name: string; email?: string; onSignOut: () => void }) {
    return <details className="group relative"><summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-full px-3 text-sm font-medium transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 [&::-webkit-details-marker]:hidden"><span className="grid size-7 place-items-center rounded-full bg-violet-50 text-violet-400"><UserRound className="size-4" /></span><span className="hidden max-w-28 truncate xl:inline">{name.split(" ")[0]}</span><ChevronDown className="size-3.5 text-slate-400 transition-transform group-open:rotate-180" /></summary><div className="absolute right-0 top-[calc(100%+.65rem)] z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_65px_-25px_rgba(15,23,42,.4)]"><div className="border-b border-slate-100 px-3 pb-3 pt-2"><p className="truncate text-sm font-semibold text-slate-900">{name}</p>{email && <p className="mt-0.5 truncate text-[11px] text-slate-400">{email}</p>}</div><nav className="py-2"><AccountMenuLink to="/profile" icon={<UserRound />} label="My profile" /><AccountMenuLink to="/orders" icon={<Package />} label="My orders" /><AccountMenuLink to="/wishlist" icon={<Heart />} label="Wishlist" /></nav><button type="button" onClick={onSignOut} className="flex w-full items-center gap-3 rounded-xl border-t border-slate-100 px-3 py-3 text-left text-sm font-medium text-violet-500 transition hover:bg-violet-50"><LogOut className="size-4" />Sign out</button></div></details>;
}

function AccountMenuLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    return <Link to={to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"><span className="text-slate-400 [&>svg]:size-4">{icon}</span>{label}</Link>;
}

function MiniCartSheet({ items, loading, signedIn, onClose, onRefresh }: { items: MiniCartItem[]; loading: boolean; signedIn: boolean; onClose: () => void; onRefresh: () => Promise<void> }) {
    const [updatingId, setUpdatingId] = React.useState<number | null>(null);
    const subtotal = items.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);
    const deliveryTarget = 50;
    const remaining = Math.max(0, deliveryTarget - subtotal);
    const updateQuantity = async (item: MiniCartItem, quantity: number) => {
        setUpdatingId(item.id);
        try {
            if (quantity < 1) await api(`/customer/cart/${item.id}`, { method: "DELETE" });
            else await api(`/customer/cart/${item.id}`, { method: "PATCH", body: JSON.stringify({ quantity }) });
            notifyCartUpdated();
            await onRefresh();
        } finally { setUpdatingId(null); }
    };
    const removeItem = async (item: MiniCartItem) => updateQuantity(item, 0);

    return createPortal(<div className="fixed inset-0 z-[90] hidden lg:block" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <button type="button" aria-label="Close cart" onClick={onClose} className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px] motion-safe:animate-[fade-in_.2s_ease-out]" />
        <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-[-25px_0_80px_-35px_rgba(15,23,42,.4)] motion-safe:animate-[cart-sheet-in_.35s_cubic-bezier(.22,1,.36,1)]">
            <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-violet-400">Your selection</p><h2 className="mt-1 text-xl font-semibold tracking-tight">Shopping bag <span className="font-normal text-slate-400">({items.reduce((sum, item) => sum + Number(item.quantity), 0)})</span></h2></div><button type="button" onClick={onClose} aria-label="Close cart" className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-950 hover:text-white"><X className="size-4" /></button></header>

            {signedIn && items.length > 0 && <div className="shrink-0 border-b border-slate-100 px-6 py-4"><div className="flex items-center justify-between text-[11px]"><span className="font-medium text-slate-600">{remaining > 0 ? `£${remaining.toFixed(2)} away from free delivery` : "You’ve unlocked free delivery"}</span><Truck className={`size-4 ${remaining > 0 ? "text-slate-400" : "text-emerald-500"}`} /></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div style={{ width: `${Math.min(100, subtotal / deliveryTarget * 100)}%` }} className={`h-full rounded-full transition-all duration-500 ${remaining > 0 ? "bg-violet-300" : "bg-emerald-400"}`} /></div></div>}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">
                {loading && !items.length ? <div className="space-y-4 py-6">{[1, 2, 3].map((item) => <div key={item} className="flex animate-pulse gap-4"><div className="size-24 rounded-2xl bg-slate-100" /><div className="flex-1 space-y-3 pt-2"><div className="h-3 w-2/3 rounded bg-slate-100" /><div className="h-3 w-1/3 rounded bg-slate-100" /></div></div>)}</div> : !signedIn ? <div className="grid h-full min-h-96 place-items-center text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-3xl bg-violet-50 text-violet-300"><UserRound className="size-7" /></span><h3 className="mt-5 text-xl font-semibold">Sign in to view your bag</h3><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">Your saved products and bag will be ready whenever you return.</p><Link to="/login" onClick={onClose} className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white">Sign in</Link></div></div> : !items.length ? <div className="grid h-full min-h-96 place-items-center text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-3xl bg-stone-100 text-slate-400"><ShoppingBag className="size-7" /></span><h3 className="mt-5 text-xl font-semibold">Your bag is empty</h3><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">Discover something beautiful and it will appear here.</p><Link to="/products" onClick={onClose} className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white">Explore products <ArrowUpRight className="size-4" /></Link></div></div> : <div className="divide-y divide-slate-100">{items.map((item) => <article key={item.id} className={`flex gap-4 py-5 transition-opacity ${updatingId === item.id ? "opacity-50" : ""}`}><Link to={`/products/${item.productId}`} onClick={onClose} className="size-24 shrink-0 overflow-hidden rounded-2xl bg-stone-50"><img src={item.image} alt={item.name} className="size-full object-contain p-3" /></Link><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><Link to={`/products/${item.productId}`} onClick={onClose} className="line-clamp-2 text-sm font-semibold leading-5 hover:text-violet-400">{item.name}</Link>{item.shade && <p className="mt-1 text-[11px] text-slate-400">Shade · {item.shade}</p>}</div><button type="button" onClick={() => void removeItem(item)} disabled={updatingId === item.id} aria-label={`Remove ${item.name}`} className="shrink-0 text-slate-300 transition hover:text-violet-400"><Trash2 className="size-4" /></button></div><div className="mt-4 flex items-center justify-between"><div className="inline-flex h-8 items-center rounded-full border border-slate-200 bg-white"><button type="button" onClick={() => void updateQuantity(item, Number(item.quantity) - 1)} disabled={updatingId === item.id} aria-label={`Decrease ${item.name} quantity`} className="grid size-8 place-items-center text-slate-500 hover:text-slate-950"><Minus className="size-3" /></button><span className="w-7 text-center text-xs font-semibold">{item.quantity}</span><button type="button" onClick={() => void updateQuantity(item, Number(item.quantity) + 1)} disabled={updatingId === item.id} aria-label={`Increase ${item.name} quantity`} className="grid size-8 place-items-center text-slate-500 hover:text-slate-950"><Plus className="size-3" /></button></div><strong className="text-sm">£{(Number(item.price) * Number(item.quantity)).toFixed(2)}</strong></div></div></article>)}</div>}
            </div>

            {signedIn && items.length > 0 && <footer className="shrink-0 border-t border-slate-100 bg-white px-6 pb-6 pt-5 shadow-[0_-15px_40px_-30px_rgba(15,23,42,.3)]"><div className="flex items-end justify-between"><div><p className="text-xs text-slate-400">Subtotal</p><p className="mt-1 text-[11px] text-slate-400">Delivery calculated at checkout</p></div><strong className="text-2xl tracking-tight">£{subtotal.toFixed(2)}</strong></div><Link to="/checkout" onClick={onClose} className="group mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 text-sm font-semibold text-white transition hover:bg-violet-400">Checkout <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link><Link to="/cart" onClick={onClose} className="mt-3 flex h-11 items-center justify-center rounded-full border border-slate-200 text-sm font-semibold transition hover:border-slate-950">View shopping bag</Link></footer>}
        </aside>
    </div>, document.body);
}

function Brand() {
    return (
        <Link to="/" className="group flex shrink-0 items-center gap-2.5">
            <img
                src="/logo.png"
                alt=""
                className="size-11 object-contain transition-transform duration-300 group-hover:scale-105 sm:size-12"
            />
            <span className="[font-family:var(--font-editorial)] text-lg font-semibold tracking-[-0.035em] sm:text-xl">
                {siteConfig.name}
            </span>
            <span className="sr-only">Home</span>
        </Link>
    );
}

function IconLink({
    to,
    label,
    children,
    iconOnly = false,
}: {
    to: string;
    label: string;
    children: React.ReactNode;
    iconOnly?: boolean;
}) {
    return (
        <Link
            to={to}
            aria-label={label}
            title={iconOnly ? label : undefined}
            className={`${iconOnly ? "grid size-10 place-items-center" : "flex h-10 items-center gap-2 px-3"} rounded-full text-sm font-medium transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400`}
        >
            {children}
            {!iconOnly && <span className="hidden xl:inline">{label}</span>}
        </Link>
    );
}

function DesktopMenu({ item }: { item?: MainNavItem }) {
    const location = useLocation();
    return (
        <NavigationMenu>
            <NavigationMenuList className="gap-1">
                {item?.card && (
                    <NavigationMenuItem>
                        <NavigationMenuTrigger className="relative h-9 rounded-none bg-transparent px-4 [font-family:var(--font-editorial)] text-[15px] font-semibold tracking-[-0.015em] after:absolute after:bottom-0 after:left-4 after:right-4 after:h-px after:origin-center after:scale-x-0 after:bg-violet-400 after:transition-transform after:duration-300 hover:bg-transparent hover:text-violet-500 hover:after:scale-x-100 focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-violet-600 data-[state=open]:after:scale-x-100 dark:text-stone-200 dark:hover:bg-transparent dark:hover:text-violet-200 dark:focus:bg-transparent dark:data-[state=open]:bg-transparent dark:data-[state=open]:text-violet-100">
                            {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-[#1b1622] dark:shadow-[0_35px_100px_rgba(0,0,0,.55)]">
                            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/55 px-6 py-4 dark:border-white/8 dark:bg-white/[.025]">
                                <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-400 dark:text-violet-200">Explore beauty</p><p className="mt-1 text-sm text-slate-500 dark:text-stone-400">Curated essentials for every expression.</p></div>
                                <Link to="/products" className="group flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-400 dark:bg-violet-300 dark:text-violet-950 dark:hover:bg-violet-200">Shop all <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
                            </div>
                            <div className="grid w-190 grid-cols-[230px_1fr] gap-3 p-4">
                                <Link to="/editors-picks" className="group relative min-h-65 overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-[#28163f] via-[#4b2570] to-[#8051aa] p-5 text-white shadow-lg shadow-violet-900/15 ring-1 ring-inset ring-white/10 transition hover:-translate-y-0.5 dark:from-[#382052] dark:via-[#4c286c] dark:to-[#68408a]">
                                    <div className="absolute -right-10 -top-10 size-32 rounded-full bg-violet-100/20 blur-2xl" />
                                    <div className="absolute -bottom-16 -right-12 size-48 rounded-full border border-white/10 bg-white/10 transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute bottom-5 right-4 flex -space-x-5 opacity-85 transition-transform duration-500 group-hover:-translate-y-1">
                                        {["/uploads/products/Anya_Yara_1850x2000.webp", "/uploads/products/palette.webp", "/uploads/products/lip.webp"].map((image) => <span key={image} className="grid size-14 place-items-center rounded-full border-2 border-white bg-white shadow-lg"><img src={image} alt="" className="size-12 rounded-full object-contain p-1" /></span>)}
                                    </div>
                                    <span className="relative inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-widest backdrop-blur"><Sparkles className="size-3" /> Editor’s pick</span>
                                    <p className="relative mt-8 max-w-40 text-2xl font-semibold leading-tight tracking-tight">The essential makeup edit</p>
                                    <p className="relative mt-3 max-w-38 text-xs leading-5 text-white/65">A complete look, thoughtfully selected by us.</p>
                                    <span className="relative mt-6 inline-flex items-center gap-1.5 text-xs font-semibold">View <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                                </Link>
                            <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
                                {item.card.map((cardItem) => (
                                    <ListItem
                                        key={cardItem.title}
                                        href={String(cardItem.href)}
                                        title={cardItem.title}
                                    >
                                        {cardItem.description}
                                    </ListItem>
                                ))}
                            </ul>
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                )}
                {item?.menu?.map((menuItem) => (
                    <NavigationMenuItem key={menuItem.title}>
                        <NavigationMenuLink
                            className={`${navigationMenuTriggerStyle()} relative h-9 rounded-none !bg-transparent px-4 [font-family:var(--font-editorial)] text-[15px] font-semibold tracking-[-0.015em] transition-colors after:absolute after:bottom-0 after:left-4 after:right-4 after:h-px after:origin-center after:bg-violet-400 after:transition-transform after:duration-300 hover:!bg-transparent hover:text-violet-500 hover:after:scale-x-100 focus:!bg-transparent dark:hover:!bg-transparent dark:hover:text-violet-200 dark:focus:!bg-transparent ${location.pathname === String(menuItem.href) ? "!text-violet-500 after:scale-x-100 dark:!text-violet-100" : "after:scale-x-0"}`}
                            render={<Link to={String(menuItem.href)}>{menuItem.title}</Link>}
                        />
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}

function MobileMenu({
    item,
    userName,
    searchQuery,
    onSearchChange,
    onSearch,
    onSignOut,
    onNavigate,
}: {
    item?: MainNavItem;
    userName?: string;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onSearch: (event: React.FormEvent) => void;
    onSignOut: () => void;
    onNavigate: () => void;
}) {
    return (
        <div className="border-t border-slate-100 bg-white px-4 pb-6 pt-4 dark:border-white/8 dark:bg-[#15111b] lg:hidden">
            <form onSubmit={onSearch} className="relative block"><label>
                <span className="sr-only">Search products</span>
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search products"
                    className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-50 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-stone-500 dark:focus:border-violet-300/40 dark:focus:ring-violet-300/10"
                /></label><button type="submit" aria-label="Search products" className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-400 shadow-sm dark:bg-white/8"><ArrowUpRight className="size-3.5" /></button></form>

            <nav className="mt-5" aria-label="Mobile navigation">
                {item?.card && (
                    <div>
                        <p className="px-3 pb-2 [font-family:var(--font-editorial)] text-sm font-semibold tracking-[-0.01em] text-slate-500 dark:text-stone-400">
                            {item.title}
                        </p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            {item.card.map((cardItem) => (
                                <Link
                                    key={cardItem.title}
                                    to={String(cardItem.href)}
                                    onClick={onNavigate}
                                    className="group flex min-h-14 items-center justify-between rounded-2xl bg-slate-50/70 px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-violet-50 hover:text-violet-600 dark:bg-white/[.045] dark:hover:bg-violet-300/10 dark:hover:text-violet-100"
                                >
                                    <span className="[font-family:var(--font-editorial)] text-[15px] font-semibold tracking-[-0.015em]">{cardItem.title}</span>
                                    <ArrowUpRight className="size-3.5 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-400 dark:text-stone-600" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-white/8">
                    {item?.menu?.map((menuItem) => (
                        <Link
                            key={menuItem.title}
                            to={String(menuItem.href)}
                            onClick={onNavigate}
                            className="flex items-center justify-between rounded-xl px-3 py-3 [font-family:var(--font-editorial)] text-base font-semibold tracking-[-0.015em] hover:bg-slate-50 dark:hover:bg-white/5"
                        >
                            {menuItem.title}
                            <ArrowUpRight className="size-4 text-slate-400" />
                        </Link>
                    ))}
                    <Link
                        to={userName ? "/profile" : "/login"}
                        onClick={onNavigate}
                        className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium hover:bg-slate-50"
                    >
                        {userName ? `Profile · ${userName}` : "Log in"}
                        <UserRound className="size-4 text-slate-400" />
                    </Link>
                    {userName && <Link to="/wishlist" onClick={onNavigate} className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium hover:bg-slate-50">Wishlist<Heart className="size-4 text-slate-400" /></Link>}
                    {userName && <button onClick={onSignOut} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-violet-500 hover:bg-violet-50">Sign out<LogOut className="size-4" /></button>}
                </div>
            </nav>
        </div>
    );
}

function ListItem({
    title,
    children,
    href,
    ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
    return (
        <li {...props}>
            <NavigationMenuLink
                render={
                    <Link
                        to={href}
                        className="group relative block min-h-29 overflow-hidden rounded-[1.2rem] bg-transparent p-4 transition-all duration-300 hover:bg-violet-50/75 dark:hover:bg-violet-300/[.08]"
                    >
                        <span className="absolute -right-8 -top-8 size-20 rounded-full bg-violet-100/70 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-violet-300/15" />
                        <div className="block">
                            <div className="relative flex items-center justify-between text-sm font-semibold text-slate-950 dark:text-stone-100">
                                <span className="[font-family:var(--font-editorial)] text-[15px] tracking-[-0.015em]">{title}</span>
                                <ArrowUpRight className="size-4 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-400" />
                            </div>
                            {children && (
                                <p className="relative mt-2 block max-w-52 text-xs leading-5 text-slate-500 dark:text-stone-400">{children}</p>
                            )}
                        </div>
                    </Link>
                }
            />
        </li>
    );
}
