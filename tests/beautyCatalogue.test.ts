import assert from "node:assert/strict";
import { test } from "node:test";
import { products } from "../src/data/store.ts";
import { loadBeautyCatalogue } from "../src/lib/beautyCatalogue.ts";
import { findBeautyMatches } from "../src/data/beautyFinder.ts";

test("live catalogue prices normalize and an empty catalogue stays empty", async () => {
  const result = await loadBeautyCatalogue(async () => [{ ...products[0], price: "14.00" }]);
  assert.equal(result.source, "ready");
  assert.equal(result.products[0].price, 14);
  assert.deepEqual(await loadBeautyCatalogue(async () => []), { products: [], source: "ready" });
});

test("missing API, invalid data and timeouts use a labelled sample catalogue", async () => {
  for (const load of [
    async () => { throw new Error("404 Not Found"); },
    async () => { throw new DOMException("Timeout", "AbortError"); },
    async () => "<!doctype html>",
    async () => [{ ...products[0], price: "invalid" }],
    async () => [{ ...products[0], price: null }],
    async () => [{ id: 1 }],
  ]) {
    const result = await loadBeautyCatalogue(load);
    assert.equal(result.source, "sample");
    assert.deepEqual(result.products, products);
  }
});

const profile = { goal: "Lip products", skin: "Dry", concern: "Dryness", sensitivity: "None known", preference: "Matte", brand: "No preference", budget: "Up to £15" };
test("sample recommendations respect category, finish, budget and brand", async () => {
  const catalogue = await loadBeautyCatalogue(async () => { throw new Error("API unavailable"); });
  const result = findBeautyMatches(catalogue.products, profile);
  assert.ok(result.matches.length > 0);
  for (const { product } of result.matches) {
    assert.ok(product.price <= 15);
    assert.match(product.category, /lip/i);
    assert.match(product.description, /matte/i);
  }
  const branded = findBeautyMatches(products, { ...profile, brand: "Dior", budget: "No limit" });
  assert.ok(branded.matches.length > 0);
  assert.ok(branded.matches.every(({ product }) => product.brand === "Dior"));
});

test("sensitivity restrictions and missing skincare do not produce unsafe substitutes", () => {
  for (const sensitivity of ["Sensitive skin", "I need to avoid specific ingredients"]) {
    assert.equal(findBeautyMatches(products, { ...profile, sensitivity }).matches.length, 0);
  }
  assert.equal(findBeautyMatches(products, { ...profile, goal: "Skincare" }).matches.length, 0);
  assert.equal(findBeautyMatches(products, { ...profile, budget: "£1" }).matches.length, 0);
});
