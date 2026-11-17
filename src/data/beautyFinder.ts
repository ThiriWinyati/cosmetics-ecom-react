import type { Product } from "./store";

export const beautyQuestions = [
  { key: "goal", title: "What would you like help choosing?", options: ["Skincare", "Face makeup", "Lip products", "Eye makeup"] },
  { key: "skin", title: "How would you describe your skin?", options: ["Dry", "Oily", "Combination", "Balanced", "Not sure"] },
  { key: "concern", title: "What is your main concern or goal?", options: ["Dryness", "Shine", "Uneven-looking tone", "A natural everyday look", "No particular concern"] },
  { key: "sensitivity", title: "Any sensitivities or ingredients you need to avoid?", options: ["None known", "Sensitive skin", "I need to avoid specific ingredients"] },
  { key: "preference", title: "What finish or product style do you prefer?", options: ["Hydrating / dewy", "Matte", "Lightweight / natural", "Glossy", "No preference"] },
  { key: "brand", title: "Any favourite brand? You can type one, or choose no preference.", options: ["No preference", "rom&nd", "Dior", "Chanel"] },
  { key: "budget", title: "What is your maximum budget per product?", options: ["Up to £15", "Up to £25", "Up to £50", "No limit"] },
] as const;

export type BeautyProfile = Partial<Record<(typeof beautyQuestions)[number]["key"], string>>;
export type BeautyMatch = { product: Product; reasons: string[] };

export function findBeautyMatches(products: Product[], profile: BeautyProfile): { matches: BeautyMatch[]; note: string } {
  if (profile.sensitivity !== "None known") return { matches: [], note: "This catalogue does not include verified ingredient or sensitivity data, so I can’t check products against your restrictions. Ask our beauty team to verify ingredients before choosing a product." };
  const budgetText = profile.budget ?? "";
  const budget = budgetText === "No limit" ? Infinity : Number(budgetText.match(/\d+(?:\.\d+)?/)?.[0]);
  if (!(budget > 0)) return { matches: [], note: "Please enter a positive maximum budget, such as £25, or choose No limit." };
  const group = profile.goal === "Skincare" ? /\b(cleanser|cleansing|moisturis\w*|moisturiz\w*|serum|toner|sunscreen|spf|essence|skincare)\b/i
    : profile.goal === "Face makeup" ? /\b(face|foundation|cushion|blush|bronzer|concealer|highlighter)\b/i
    : profile.goal === "Lip products" ? /\b(lip\w*)\b/i : /\b(eye\w*|brow\w*|mascara|liner)\b/i;
  const preference = profile.preference ?? "No preference";
  const preferred = preference === "Matte" ? /\bmatte\b/i : preference === "Glossy" ? /gloss|shine/i
    : preference === "Hydrating / dewy" ? /hydrat|moisture|dewy|radiant|luminous/i
    : preference === "Lightweight / natural" ? /lightweight|weightless|natural|sheer|featherlight/i : null;
  const brand = profile.brand?.trim() ?? "No preference";
  const matches = products.flatMap((product) => {
    const price = Number(product.price);
    if (!Number.isFinite(price) || price < 0 || price > budget || !group.test(`${product.category} ${product.name}`)) return [];
    if (profile.goal === "Skincare" && /\b(foundation|cushion|lip\w*|makeup|concealer|blush|bronzer)\b/i.test(`${product.category} ${product.name}`)) return [];
    if (brand !== "No preference" && product.brand?.toLowerCase() !== brand.toLowerCase()) return [];
    const description = `${product.name} ${product.description ?? ""}`;
    if (preferred && !preferred.test(description)) return [];
    const reasons = [`Within your ${budget === Infinity ? "open" : `£${budget}`} budget`];
    if (preferred) reasons.push(`The product description matches your ${preference.toLowerCase()} preference`);
    if (brand !== "No preference") reasons.push(`Your preferred brand: ${product.brand}`);
    let score = 0;
    if ((profile.skin === "Dry" || profile.concern === "Dryness") && /hydrat|moisture/i.test(description)) {
      score += 2; reasons.push("The description mentions hydration or moisture; skin suitability is unverified");
    }
    if ((profile.skin === "Oily" || profile.concern === "Shine") && /matte/i.test(description)) {
      score += 2; reasons.push("The description mentions a matte finish; oil control is unverified");
    }
    if (profile.concern === "A natural everyday look" && /natural|sheer|lightweight/i.test(description)) score++;
    return [{ product: { ...product, price }, reasons, score }];
  }).sort((a, b) => b.score - a.score || a.product.price - b.product.price).slice(0, 3);
  return {
    matches,
    note: matches.length
      ? "These options match catalogue descriptions, your category, finish, brand and budget. Skin type and concerns help rank descriptive matches; they do not verify suitability or treatment benefits. Check ingredients, shades and availability on the product page."
      : "I couldn’t find a catalogue match for all your choices. Try changing your finish, brand or budget, or ask our beauty team. I won’t substitute makeup for missing skincare products.",
  };
}
