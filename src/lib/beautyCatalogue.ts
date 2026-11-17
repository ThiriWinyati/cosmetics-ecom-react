import { products as sampleProducts, type Product } from "../data/store";

export async function loadBeautyCatalogue(load: () => Promise<unknown>): Promise<{ products: Product[]; source: "ready" | "sample" }> {
  try {
    const items = await load();
    if (!Array.isArray(items) || items.some((item) => !item ||
      !Number.isInteger(Number(item.id)) || Number(item.id) <= 0 ||
      typeof item.name !== "string" || !item.name.trim() ||
      typeof item.category !== "string" || typeof item.brand !== "string" ||
      typeof item.description !== "string" || item.price === null || item.price === "" ||
      !Number.isFinite(Number(item.price)) || Number(item.price) < 0)) {
      throw new Error("Invalid catalogue response");
    }
    return { products: items.map((item) => ({ ...item, id: Number(item.id), price: Number(item.price) })), source: "ready" };
  } catch {
    return { products: sampleProducts, source: "sample" };
  }
}
