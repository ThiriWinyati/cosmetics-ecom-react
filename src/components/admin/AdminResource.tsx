import { Check, Download, Eye, Pencil, Plus, Search, Trash2, X, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { adminConfigs, type AdminRecord } from "@/data/admin";
import { products } from "@/data/store";
import { api } from "@/lib/api";

export default function AdminResource() {
  const { resource = "products" } = useParams();
  if (resource === "products") return <ProductTable />;
  return <EntityResource resource={resource} />;
}

function EntityResource({ resource }: { resource: string }) {
  const [searchParams] = useSearchParams();
  const config = adminConfigs[resource] ?? adminConfigs.orders;
  const [records, setRecords] = useState<AdminRecord[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<number | string | null>(null);
  useEffect(() => { setQuery(searchParams.get("search") ?? ""); }, [searchParams]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api<AdminRecord[]>(`/admin/${resource}`)
      .then((data) => { if (active) setRecords(data); })
      .catch((reason: Error) => { if (active) setError(reason.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [resource]);
  const visible = useMemo(() => records.filter((record) => Object.values(record).join(" ").toLowerCase().includes(query.toLowerCase())), [query, records]);
  const updateOrderStatus = async (record: AdminRecord, status: "Accepted" | "Rejected") => {
    setUpdatingOrderId(record.id as number | string);
    setError("");
    try {
      await api(`/admin/orders/${record.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setRecords((current) => current.map((item) => item.id === record.id ? { ...item, status } : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Order status could not be updated");
    } finally { setUpdatingOrderId(null); }
  };

  return <AdminPage title={config.label} subtitle={`Manage ${config.label.toLowerCase()} from the original PHP admin workflow.`} actions={<><button className="admin-secondary"><Download className="size-4" /> Export</button>{config.fields.length > 1 || ["categories", "brands", "payment-methods", "delivery-methods"].includes(resource) ? <button onClick={() => setCreating(true)} className="admin-primary"><Plus className="size-4" /> Add {config.singular}</button> : null}</>}>
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4"><label className="relative block max-w-lg"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${config.label.toLowerCase()}...`} className="h-10 w-full rounded-xl bg-slate-100 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-slate-300" /></label></div>
      {loading && <div className="p-10 text-center text-sm text-slate-500">Loading {config.label.toLowerCase()} from the database…</div>}
      {error && <div className="m-4 rounded-xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-600">{error === "Authentication required" || error === "Invalid or expired session" ? "Please log in to the admin account to load database records." : error}</div>}
      {!loading && !error && <div className="overflow-x-auto"><table className="w-full min-w-180 text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{config.columns.map((column) => <th key={column.key} className="px-5 py-3 font-medium">{column.label}</th>)}<th className="px-5 py-3 text-right font-medium">Actions</th></tr></thead><tbody>{visible.map((record) => <tr key={String(record.id)} className="border-t border-slate-100 hover:bg-slate-50/60">{config.columns.map((column) => <td key={column.key} className={`max-w-65 truncate px-5 py-4 ${column.key === "name" || column.key === "customer" || column.key === "product" ? "font-medium text-slate-900" : "text-slate-600"}`}>{column.key === "status" ? <Status value={String(record[column.key])} /> : column.key === "rating" ? `${record[column.key]} / 5` : String(record[column.key] ?? "—")}</td>)}<td className="px-5"><div className="flex justify-end gap-1">{resource === "orders" && String(record.status).toLowerCase() === "pending" ? <><button disabled={updatingOrderId === record.id} onClick={() => void updateOrderStatus(record, "Accepted")} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"><Check className="size-3.5" />Accept</button><button disabled={updatingOrderId === record.id} onClick={() => void updateOrderStatus(record, "Rejected")} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-violet-50 px-3 text-xs font-semibold text-violet-600 transition hover:bg-violet-100 disabled:opacity-50"><XCircle className="size-3.5" />Reject</button></> : resource === "orders" ? <span className="px-2 text-xs text-slate-400">Reviewed</span> : <><button onClick={() => setEditing(record)} aria-label={`Edit ${config.singular}`} className="admin-icon"><Pencil className="size-4" /></button><button onClick={async () => { await api(`/admin/${resource}/${record.id}`, { method: "DELETE" }); setRecords((current) => current.filter((item) => item.id !== record.id)); }} aria-label={`Delete ${config.singular}`} className="admin-icon hover:bg-violet-50 hover:text-violet-500"><Trash2 className="size-4" /></button></>}</div></td></tr>)}</tbody></table></div>}
      <div className="border-t border-slate-100 p-4 text-xs text-slate-500">Showing {visible.length} records</div>
    </div>
    {(editing || creating) && <RecordDialog title={`${editing ? "Edit" : "Add"} ${config.singular}`} fields={config.fields} record={editing ?? {}} onClose={() => { setEditing(null); setCreating(false); }} onSave={(record) => { if (editing) setRecords((current) => current.map((item) => item.id === editing.id ? { ...editing, ...record } : item)); else setRecords((current) => [...current, { id: Date.now(), ...record }]); setEditing(null); setCreating(false); }} />}
  </AdminPage>;
}

function ProductTable() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  useEffect(() => { setQuery(searchParams.get("search") ?? ""); }, [searchParams]);
  const visible = products.filter((product) => `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(query.toLowerCase()));
  return <AdminPage title="Products" subtitle="Manage product details, shades, quantities and storefront flags." actions={<><button className="admin-secondary"><Download className="size-4" /> Export</button><Link to="/admin/products/new" className="admin-primary"><Plus className="size-4" /> Add product</Link></>}><div className="rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-4"><label className="relative block max-w-lg"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands, categories or shades..." className="h-10 w-full rounded-xl bg-slate-100 pl-10 pr-4 text-sm outline-none" /></label></div><div className="overflow-x-auto"><table className="w-full min-w-225 text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{["Product ID", "Product", "Category", "Price", "Brand", "Shades", "Quantity", "Latest", "Popular", "Actions"].map((head) => <th key={head} className="px-5 py-3 font-medium">{head}</th>)}</tr></thead><tbody>{visible.map((product) => <tr key={product.id} className="border-t border-slate-100"><td className="px-5 text-slate-500">#{product.id}</td><td className="px-5 py-3"><div className="flex items-center gap-3"><img src={product.image} alt="" className="size-11 rounded-xl bg-stone-50 object-contain" /><span className="font-medium">{product.name}</span></div></td><td className="px-5 text-slate-500">{product.category}</td><td className="px-5">£{product.price.toFixed(2)}</td><td className="px-5">{product.brand}</td><td className="px-5 text-slate-500">{product.category === "Face" ? "4 shades" : "6 shades"}</td><td className="px-5">{20 + product.id}</td><td className="px-5"><BooleanBadge value={!!product.latest} /></td><td className="px-5"><BooleanBadge value={!!product.popular} /></td><td className="px-5"><div className="flex gap-1"><Link to={`/products/${product.id}`} className="admin-icon"><Eye className="size-4" /></Link><Link to={`/admin/products/${product.id}/edit`} className="admin-icon"><Pencil className="size-4" /></Link><button className="admin-icon hover:bg-violet-50 hover:text-violet-500"><Trash2 className="size-4" /></button></div></td></tr>)}</tbody></table></div></div></AdminPage>;
}

export function AdminPage({ title, subtitle, actions, children }: { title: string; subtitle: string; actions?: React.ReactNode; children: React.ReactNode }) { return <div><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="inline-flex rounded-full border border-violet-50 bg-violet-50 px-3 py-1 text-[9px] font-bold uppercase tracking-[.2em] text-violet-500 dark:border-violet-300/15 dark:bg-violet-300/10 dark:text-violet-200">Store management</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.035em] sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{subtitle}</p></div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div><div className="mt-7 sm:mt-9">{children}</div></div>; }

function RecordDialog({ title, fields, record, onClose, onSave }: { title: string; fields: { key: string; label: string; type?: string }[]; record: AdminRecord; onClose: () => void; onSave: (record: AdminRecord) => void }) {
  const [values, setValues] = useState<AdminRecord>(record);
  return <div className="fixed inset-0 z-100 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm"><form onSubmit={(event) => { event.preventDefault(); onSave(values); }} className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">{title}</h2><button type="button" onClick={onClose} className="admin-icon"><X className="size-5" /></button></div><div className="mt-6 space-y-4">{fields.map((field) => <label key={field.key} className="block text-sm font-medium">{field.label}<input required type={field.type ?? "text"} value={String(values[field.key] ?? "")} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-slate-300" /></label>)}</div><div className="mt-7 flex justify-end gap-2"><button type="button" onClick={onClose} className="admin-secondary">Cancel</button><button className="admin-primary">Save changes</button></div></form></div>;
}
function BooleanBadge({ value }: { value: boolean }) { return <span className={`rounded-full px-2 py-1 text-xs ${value ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{value ? "Yes" : "No"}</span>; }
function Status({ value }: { value: string }) { const complete = ["Completed", "Delivered", "Active"].includes(value); const pending = value === "Pending"; return <span className={`rounded-full px-2.5 py-1 text-xs ${complete ? "bg-emerald-50 text-emerald-700" : pending ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>{value}</span>; }
