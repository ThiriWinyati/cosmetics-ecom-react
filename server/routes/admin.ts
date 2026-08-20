import { Router } from "express";
import { db, transaction } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

export const adminRouter = Router();
adminRouter.use(requireAuth("admin"));

const resources = {
  categories: { table: "categories", id: "Category_ID", fields: ["Category_Name"], select: "Category_ID id, Category_Name name" },
  brands: { table: "brands", id: "brand_id", fields: ["brand_name"], select: "brand_id id, brand_name name, created_at createdAt" },
  coupons: { table: "coupons", id: "Coupon_ID", fields: ["Coupon_Code", "Discount_Percentage", "Valid_From", "Valid_To", "Minimum_Purchase_Amount"], select: "Coupon_ID id, Coupon_Code code, Discount_Percentage discount, Valid_From `from`, Valid_To `to`, Minimum_Purchase_Amount minimum" },
  customers: { table: "customers", id: "Customer_ID", fields: ["Name", "Email", "Phone", "Address", "Profile_Picture"], select: "Customer_ID id, Name name, Email email, Phone phone, Address address, Profile_Picture profilePicture, Signup_time joined" },
  "payment-methods": { table: "payment_methods", id: "Payment_Method_ID", fields: ["Method_Name"], select: "Payment_Method_ID id, Method_Name name" },
  "delivery-methods": { table: "shippingmethods", id: "Shipping_Method_ID", fields: ["Shipping_Method", "DeliveryTime", "Cost"], select: "Shipping_Method_ID id, Shipping_Method name, DeliveryTime time, Cost cost" },
} as const;

adminRouter.get("/dashboard", async (_request, response) => {
  const [[sales], [orders], [customers], [average], [daily], [monthly], [yearly], [categories], [payments], [topProducts], [topCustomers]] = await Promise.all([
    db.query("SELECT COALESCE(SUM(Total_Price),0) totalSales FROM orders"), db.query("SELECT COUNT(*) totalOrders FROM orders"), db.query("SELECT COUNT(*) totalCustomers FROM customers"), db.query("SELECT COALESCE(AVG(Total_Price),0) averageOrder FROM orders"),
    db.query("SELECT DATE(Order_Date) label, SUM(Total_Price) value FROM orders GROUP BY DATE(Order_Date) ORDER BY label DESC LIMIT 30"), db.query("SELECT DATE_FORMAT(Order_Date,'%Y-%m') label, SUM(Total_Price) value FROM orders GROUP BY label ORDER BY label DESC LIMIT 12"), db.query("SELECT YEAR(Order_Date) label, SUM(Total_Price) value FROM orders GROUP BY label ORDER BY label"),
    db.query("SELECT c.Category_Name label, COALESCE(SUM(s.Quantity),0) value FROM categories c LEFT JOIN products p ON p.Category_ID=c.Category_ID LEFT JOIN shades s ON s.product_id=p.Product_ID GROUP BY c.Category_ID"), db.query("SELECT pm.Method_Name label, COUNT(o.Order_ID) value FROM payment_methods pm LEFT JOIN orders o ON o.Payment_Method_ID=pm.Payment_Method_ID GROUP BY pm.Payment_Method_ID"),
    db.query("SELECT p.Name name, SUM(oi.Quantity) quantity, SUM(oi.Subtotal) sales FROM order_items oi JOIN products p ON p.Product_ID=oi.Product_ID GROUP BY p.Product_ID ORDER BY quantity DESC LIMIT 5"), db.query("SELECT c.Name name, SUM(o.Total_Price) purchases FROM orders o JOIN customers c ON c.Customer_ID=o.Customer_ID GROUP BY c.Customer_ID ORDER BY purchases DESC LIMIT 5"),
  ]);
  response.json({ summary: { ...(sales as object[])[0], ...(orders as object[])[0], ...(customers as object[])[0], ...(average as object[])[0] }, daily, monthly, yearly, categoryStock: categories, paymentUsage: payments, topProducts, topCustomers });
});

adminRouter.get("/orders", async (request, response) => { const search = `%${request.query.search ?? ""}%`; const [rows] = await db.query(`SELECT o.Order_ID id, o.Order_Date date, o.Status status, o.Shipping_Address address, o.Total_Price total, o.Phone phone, c.Name customer, c.Email email, cp.Coupon_Code coupon, pm.Method_Name payment, sm.Shipping_Method shipping, GROUP_CONCAT(p.Name ORDER BY oi.Order_Item_ID SEPARATOR ', ') products, GROUP_CONCAT(oi.Quantity ORDER BY oi.Order_Item_ID SEPARATOR ', ') quantities FROM orders o LEFT JOIN customers c ON c.Customer_ID=o.Customer_ID LEFT JOIN coupons cp ON cp.Coupon_ID=o.cupon_id LEFT JOIN payment_methods pm ON pm.Payment_Method_ID=o.Payment_Method_ID LEFT JOIN shipping s ON s.Shipping_ID=o.shipping_id LEFT JOIN shippingmethods sm ON sm.Shipping_Method_ID=s.Shipping_Method_ID LEFT JOIN order_items oi ON oi.Order_ID=o.Order_ID LEFT JOIN products p ON p.Product_ID=oi.Product_ID WHERE COALESCE(c.Name,'') LIKE ? OR COALESCE(c.Email,'') LIKE ? OR CAST(o.Order_ID AS CHAR) LIKE ? GROUP BY o.Order_ID, o.Order_Date, o.Status, o.Shipping_Address, o.Total_Price, o.Phone, c.Name, c.Email, cp.Coupon_Code, pm.Method_Name, sm.Shipping_Method ORDER BY o.Order_Date DESC`, [search, search, search]); response.json(rows); });
adminRouter.patch("/orders/:id/status", async (request, response) => {
  const status = String(request.body.status ?? "");
  if (!["Accepted", "Rejected"].includes(status)) return response.status(400).json({ message: "Order status must be Accepted or Rejected" });
  const orderId = Number(request.params.id);
  if (!Number.isInteger(orderId) || orderId < 1) return response.status(400).json({ message: "Invalid order" });
  try {
    await transaction(async (connection) => {
      const [rows] = await connection.query("SELECT Status status FROM orders WHERE Order_ID=? FOR UPDATE", [orderId]);
      const order = (rows as Array<{ status: string }>)[0];
      if (!order) throw new Error("ORDER_NOT_FOUND");
      if (order.status !== "Pending") throw new Error("ORDER_ALREADY_REVIEWED");
      if (status === "Rejected") {
        const [items] = await connection.query("SELECT shade_id shadeId, Quantity quantity FROM order_items WHERE Order_ID=? AND shade_id IS NOT NULL", [orderId]);
        for (const item of items as Array<{ shadeId: number; quantity: number }>) await connection.execute("UPDATE shades SET Quantity=Quantity+? WHERE shade_id=?", [item.quantity, item.shadeId]);
        await connection.execute("UPDATE shipping SET Shipping_Status='Cancelled' WHERE Order_ID=?", [orderId]);
      }
      await connection.execute("UPDATE orders SET Status=? WHERE Order_ID=?", [status, orderId]);
    });
    response.json({ message: `Order ${status.toLowerCase()}`, status });
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") return response.status(404).json({ message: "Order not found" });
    if (error instanceof Error && error.message === "ORDER_ALREADY_REVIEWED") return response.status(409).json({ message: "This order has already been reviewed" });
    throw error;
  }
});
adminRouter.delete("/orders/:id", async (request, response) => { await db.execute("DELETE FROM orders WHERE Order_ID=?", [request.params.id]); response.status(204).end(); });
adminRouter.get("/reviews", async (_request, response) => { const [rows] = await db.query("SELECT r.Review_ID id, r.Rating rating, r.Review_Text comment, r.Review_Date date, p.Name product, c.Name customer FROM reviews r LEFT JOIN products p ON p.Product_ID=r.Product_ID LEFT JOIN customers c ON c.Customer_ID=r.Customer_ID ORDER BY r.Review_Date DESC"); response.json(rows); });
adminRouter.delete("/reviews/:id", async (request, response) => { await db.execute("DELETE FROM reviews WHERE Review_ID=?", [request.params.id]); response.status(204).end(); });
adminRouter.get("/deliveries", async (_request, response) => { const [rows] = await db.query("SELECT s.Shipping_ID id, s.Order_ID `order`, s.Shipping_Status status, s.Shipping_Date date, sm.Shipping_Method method, c.Name customer, c.Email email, o.Shipping_Address address, GROUP_CONCAT(p.Name SEPARATOR ', ') products FROM shipping s LEFT JOIN shippingmethods sm ON sm.Shipping_Method_ID=s.Shipping_Method_ID LEFT JOIN orders o ON o.Order_ID=s.Order_ID LEFT JOIN customers c ON c.Customer_ID=o.Customer_ID LEFT JOIN order_items oi ON oi.Order_ID=o.Order_ID LEFT JOIN products p ON p.Product_ID=oi.Product_ID GROUP BY s.Shipping_ID, s.Order_ID, s.Shipping_Status, s.Shipping_Date, sm.Shipping_Method, c.Name, c.Email, o.Shipping_Address ORDER BY s.Shipping_Date DESC"); response.json(rows); });
adminRouter.patch("/deliveries/:id/status", async (request, response) => { await db.execute("UPDATE shipping SET Shipping_Status=? WHERE Shipping_ID=?", [request.body.status, request.params.id]); response.json({ message: "Delivery updated" }); });
adminRouter.get("/messages", async (_request, response) => { const [rows] = await db.query("SELECT id, name, email, subject, message, submission_date submittedAt, customer_id customerId FROM contactmessages ORDER BY submission_date DESC"); response.json(rows); });
adminRouter.delete("/messages/:id", async (request, response) => { await db.execute("DELETE FROM contactmessages WHERE id=?", [request.params.id]); response.status(204).end(); });
adminRouter.get("/chat", async (request, response) => { const readCustomerId = Number(request.query.readCustomerId); if (Number.isInteger(readCustomerId) && readCustomerId > 0) await db.execute("UPDATE chat_messages SET admin_read=1 WHERE customer_id=? AND admin_id IS NULL AND (admin_read=0 OR admin_read IS NULL)", [readCustomerId]); const [rows] = await db.query("SELECT m.id, m.customer_id customerId, m.admin_id adminId, m.message, m.timestamp, m.admin_read adminRead, c.Name customer, c.Email email, a.Name admin FROM chat_messages m LEFT JOIN customers c ON c.Customer_ID=m.customer_id LEFT JOIN admin_users a ON a.Admin_User_ID=m.admin_id WHERE m.customer_id IS NOT NULL ORDER BY m.timestamp, m.id"); response.json(rows); });
adminRouter.patch("/chat/:customerId/read", async (request, response) => {
  const customerId = Number(request.params.customerId);
  if (!Number.isInteger(customerId) || customerId < 1) return response.status(400).json({ message: "Invalid customer" });
  await db.execute("UPDATE chat_messages SET admin_read=1 WHERE customer_id=? AND admin_id IS NULL AND (admin_read=0 OR admin_read IS NULL)", [customerId]);
  response.json({ message: "Conversation marked as read" });
});
adminRouter.post("/chat", async (request: AuthRequest, response) => {
  const message = String(request.body.message ?? "").trim();
  const customerId = Number(request.body.customerId);
  if (!Number.isInteger(customerId) || customerId < 1 || !message) return response.status(400).json({ message: "A customer and message are required" });
  if (message.length > 2000) return response.status(400).json({ message: "Messages must be 2,000 characters or fewer" });
  const [customers] = await db.query("SELECT Customer_ID FROM customers WHERE Customer_ID=? LIMIT 1", [customerId]);
  if (!(customers as object[]).length) return response.status(404).json({ message: "Customer account not found" });
  const [result] = await db.execute("INSERT INTO chat_messages (customer_id, admin_id, message, admin_read) VALUES (?, ?, ?, 1)", [customerId, request.user!.id, message]);
  const id = (result as { insertId: number }).insertId;
  const [rows] = await db.query("SELECT m.id, m.customer_id customerId, m.admin_id adminId, m.message, m.timestamp, m.admin_read adminRead, c.Name customer, c.Email email, a.Name admin FROM chat_messages m LEFT JOIN customers c ON c.Customer_ID=m.customer_id LEFT JOIN admin_users a ON a.Admin_User_ID=m.admin_id WHERE m.id=?", [id]);
  response.status(201).json((rows as object[])[0]);
});

adminRouter.get("/:resource", async (request, response) => { const resource = resources[request.params.resource as keyof typeof resources]; if (!resource) return response.status(404).json({ message: "Admin resource not found" }); const [rows] = await db.query(`SELECT ${resource.select} FROM \`${resource.table}\` ORDER BY \`${resource.id}\` DESC`); response.json(rows); });
adminRouter.post("/:resource", async (request, response) => { const resource = resources[request.params.resource as keyof typeof resources]; if (!resource) return response.status(404).json({ message: "Admin resource not found" }); const fields = resource.fields.filter((field) => request.body[field] !== undefined); if (!fields.length) return response.status(400).json({ message: "No valid fields supplied" }); const [result] = await db.execute(`INSERT INTO \`${resource.table}\` (${fields.map((field) => `\`${field}\``).join(",")}) VALUES (${fields.map(() => "?").join(",")})`, fields.map((field) => request.body[field])); response.status(201).json({ id: (result as { insertId: number }).insertId }); });
adminRouter.put("/:resource/:id", async (request, response) => { const resource = resources[request.params.resource as keyof typeof resources]; if (!resource) return response.status(404).json({ message: "Admin resource not found" }); const fields = resource.fields.filter((field) => request.body[field] !== undefined); if (!fields.length) return response.status(400).json({ message: "No valid fields supplied" }); await db.execute(`UPDATE \`${resource.table}\` SET ${fields.map((field) => `\`${field}\`=?`).join(",")} WHERE \`${resource.id}\`=?`, [...fields.map((field) => request.body[field]), request.params.id]); response.json({ message: "Resource updated" }); });
adminRouter.delete("/:resource/:id", async (request, response) => { const resource = resources[request.params.resource as keyof typeof resources]; if (!resource) return response.status(404).json({ message: "Admin resource not found" }); await db.execute(`DELETE FROM \`${resource.table}\` WHERE \`${resource.id}\`=?`, [request.params.id]); response.status(204).end(); });
