import { Router } from "express";
import { db } from "../db.js";

export const publicRouter = Router();
publicRouter.get("/categories", async (_request, response) => { const [rows] = await db.query("SELECT Category_ID id, Category_Name name FROM categories ORDER BY Category_Name"); response.json(rows); });
publicRouter.get("/brands", async (_request, response) => { const [rows] = await db.query("SELECT brand_id id, brand_name name FROM brands ORDER BY brand_name"); response.json(rows); });
publicRouter.get("/coupons", async (_request, response) => { const [rows] = await db.query("SELECT Coupon_ID id, Coupon_Code code, Discount_Percentage discount, Valid_From validFrom, Valid_To validTo, Minimum_Purchase_Amount minimumPurchase FROM coupons WHERE NOW() BETWEEN Valid_From AND Valid_To ORDER BY Discount_Percentage DESC"); response.json(rows); });
publicRouter.get("/shipping-methods", async (_request, response) => { const [rows] = await db.query("SELECT Shipping_Method_ID id, Shipping_Method name, DeliveryTime deliveryTime, Cost cost FROM shippingmethods ORDER BY Cost"); response.json(rows); });
publicRouter.get("/payment-methods", async (_request, response) => { const [rows] = await db.query("SELECT Payment_Method_ID id, Method_Name name FROM payment_methods ORDER BY Method_Name"); response.json(rows); });
publicRouter.post("/contact", async (request, response) => { const { name, email, subject, message, customerId = null } = request.body; if (!name || !email || !subject || !message) return response.status(400).json({ message: "All contact fields are required" }); const [result] = await db.execute("INSERT INTO contactmessages (name, email, subject, message, customer_id) VALUES (?, ?, ?, ?, ?)", [name, email, subject, message, customerId]); response.status(201).json({ id: (result as { insertId: number }).insertId }); });
publicRouter.post("/newsletter", async (request, response) => {
  const email = String(request.body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return response.status(400).json({ message: "Please enter a valid email address" });
  await db.execute("CREATE TABLE IF NOT EXISTS newsletter_subscribers (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE, discount_code VARCHAR(40) NOT NULL DEFAULT 'WELCOME10', subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
  const [result] = await db.execute("INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)", [email]);
  await db.execute("INSERT INTO coupons (Coupon_Code, Discount_Percentage, Valid_From, Valid_To, Minimum_Purchase_Amount) VALUES ('WELCOME10', 10, NOW(), DATE_ADD(NOW(), INTERVAL 10 YEAR), 0) ON DUPLICATE KEY UPDATE Discount_Percentage=10, Valid_To=DATE_ADD(NOW(), INTERVAL 10 YEAR), Minimum_Purchase_Amount=0");
  const subscribed = (result as { affectedRows: number }).affectedRows > 0;
  response.status(subscribed ? 201 : 200).json({ message: subscribed ? "You’re on the list!" : "You’re already subscribed.", code: "WELCOME10" });
});
