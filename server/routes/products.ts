import { Router } from "express";
import { db, transaction } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const productsRouter = Router();

const productSelect = `SELECT p.Product_ID id, p.Name name, p.Price price, p.Description description, REPLACE(p.Image_Path, '../', '/') image,
  p.is_latest latest, p.is_popular popular, c.Category_ID categoryId, c.Category_Name category,
  b.brand_id brandId, b.brand_name brand,
  COALESCE(AVG(r.Rating), 0) rating, COUNT(DISTINCT r.Review_ID) reviews
  FROM products p LEFT JOIN categories c ON c.Category_ID=p.Category_ID LEFT JOIN brands b ON b.brand_id=p.brand_id
  LEFT JOIN reviews r ON r.Product_ID=p.Product_ID`;

productsRouter.get("/", async (request, response) => {
  const filters: string[] = []; const values: unknown[] = [];
  if (request.query.category) { filters.push("c.Category_Name = ?"); values.push(request.query.category); }
  if (request.query.brand) { filters.push("b.brand_name = ?"); values.push(request.query.brand); }
  if (request.query.search) { filters.push("(p.Name LIKE ? OR p.Description LIKE ?)"); values.push(`%${request.query.search}%`, `%${request.query.search}%`); }
  const where = filters.length ? ` WHERE ${filters.join(" AND ")}` : "";
  const [rows] = await db.query(`${productSelect}${where} GROUP BY p.Product_ID ORDER BY p.created_at DESC`, values);
  response.json(rows);
});

productsRouter.get("/:id", async (request, response) => {
  const [rows] = await db.query(`${productSelect} WHERE p.Product_ID=? GROUP BY p.Product_ID`, [request.params.id]);
  const product = (rows as object[])[0];
  if (!product) return response.status(404).json({ message: "Product not found" });
  const [shades] = await db.query("SELECT s.shade_id id, s.shade_name name, s.Quantity quantity, REPLACE(pi.image_path, '../', '/') image FROM shades s LEFT JOIN product_images pi ON pi.shade_id=s.shade_id WHERE s.product_id=?", [request.params.id]);
  const [images] = await db.query("SELECT DISTINCT REPLACE(image_path, '../', '/') image FROM product_images WHERE product_id=?", [request.params.id]);
  const [reviews] = await db.query("SELECT r.Review_ID id, r.Rating rating, r.Review_Text text, r.Review_Date date, c.Name customer FROM reviews r LEFT JOIN customers c ON c.Customer_ID=r.Customer_ID WHERE r.Product_ID=? ORDER BY r.Review_Date DESC", [request.params.id]);
  const categoryId = (product as { categoryId?: number }).categoryId;
  const [related] = await db.query(`${productSelect} WHERE p.Category_ID=? AND p.Product_ID<>? GROUP BY p.Product_ID ORDER BY p.created_at DESC LIMIT 4`, [categoryId, request.params.id]);
  response.json({ ...product, shades, images: (images as Array<{ image: string }>).map((item) => item.image), reviewsList: reviews, related });
});

productsRouter.post("/", requireAuth("admin"), async (request, response) => {
  const { name, categoryId, price, brandId, description, latest = false, popular = false, image = null, shades = [] } = request.body;
  const id = await transaction(async (connection) => {
    const [result] = await connection.execute("INSERT INTO products (Name, Category_ID, Price, Admin_User_ID, brand_id, Description, is_latest, Image_Path, is_popular) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [name, categoryId, price, 1, brandId, description, latest, image, popular]);
    const productId = (result as { insertId: number }).insertId;
    for (const shade of shades) { const [shadeResult] = await connection.execute("INSERT INTO shades (product_id, shade_name, Quantity) VALUES (?, ?, ?)", [productId, shade.name, shade.quantity]); const shadeId = (shadeResult as { insertId: number }).insertId; if (shade.image) await connection.execute("INSERT INTO product_images (product_id, image_path, shade_id) VALUES (?, ?, ?)", [productId, shade.image, shadeId]); }
    return productId;
  });
  response.status(201).json({ id });
});

productsRouter.put("/:id", requireAuth("admin"), async (request, response) => { const { name, categoryId, price, brandId, description, latest, popular, image } = request.body; await db.execute("UPDATE products SET Name=?, Category_ID=?, Price=?, brand_id=?, Description=?, is_latest=?, is_popular=?, Image_Path=COALESCE(?, Image_Path) WHERE Product_ID=?", [name, categoryId, price, brandId, description, latest, popular, image, request.params.id]); response.json({ message: "Product updated" }); });
productsRouter.delete("/:id", requireAuth("admin"), async (request, response) => { await transaction(async (connection) => { await connection.execute("DELETE FROM product_images WHERE product_id=?", [request.params.id]); await connection.execute("DELETE FROM shades WHERE product_id=?", [request.params.id]); await connection.execute("DELETE FROM products WHERE Product_ID=?", [request.params.id]); }); response.status(204).end(); });
