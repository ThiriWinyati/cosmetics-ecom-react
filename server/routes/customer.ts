import { Router } from "express";
import { db, transaction } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

export const customerRouter = Router();
customerRouter.use(requireAuth("customer"));

customerRouter.get("/profile", async (request: AuthRequest, response) => { const [rows] = await db.query("SELECT Customer_ID id, Name name, Email email, Phone phone, Address address, Profile_Picture profilePicture, Signup_time joined FROM customers WHERE Customer_ID=?", [request.user!.id]); response.json((rows as object[])[0]); });
customerRouter.put("/profile", async (request: AuthRequest, response) => { const { name, email, phone, address, profilePicture } = request.body; await db.execute("UPDATE customers SET Name=?, Email=?, Phone=?, Address=?, Profile_Picture=? WHERE Customer_ID=?", [name, email, phone, address, profilePicture, request.user!.id]); response.json({ message: "Profile updated" }); });
customerRouter.get("/cart", async (request: AuthRequest, response) => { const [rows] = await db.query("SELECT sc.Cart_ID id, sc.Quantity quantity, p.Product_ID productId, p.Name name, p.Price price, p.Image_Path image, s.shade_id shadeId, s.shade_name shade FROM shopping_cart sc JOIN products p ON p.Product_ID=sc.Product_ID LEFT JOIN shades s ON s.shade_id=sc.shade_id WHERE sc.Customer_ID=?", [request.user!.id]); response.json(rows); });
customerRouter.post("/cart", async (request: AuthRequest, response) => { const { productId, shadeId = null, quantity = 1 } = request.body; const [existing] = await db.query("SELECT Cart_ID id, Quantity quantity FROM shopping_cart WHERE Customer_ID=? AND Product_ID=? AND shade_id <=> ? LIMIT 1", [request.user!.id, productId, shadeId]); const row = (existing as Array<{ id: number; quantity: number }>)[0]; if (row) await db.execute("UPDATE shopping_cart SET Quantity=? WHERE Cart_ID=?", [row.quantity + Number(quantity), row.id]); else await db.execute("INSERT INTO shopping_cart (Customer_ID, Product_ID, Quantity, shade_id) VALUES (?, ?, ?, ?)", [request.user!.id, productId, quantity, shadeId]); response.status(201).json({ message: "Added to cart" }); });
customerRouter.patch("/cart/:id", async (request: AuthRequest, response) => { await db.execute("UPDATE shopping_cart SET Quantity=? WHERE Cart_ID=? AND Customer_ID=?", [request.body.quantity, request.params.id, request.user!.id]); response.json({ message: "Cart updated" }); });
customerRouter.delete("/cart/:id", async (request: AuthRequest, response) => { await db.execute("DELETE FROM shopping_cart WHERE Cart_ID=? AND Customer_ID=?", [request.params.id, request.user!.id]); response.status(204).end(); });
customerRouter.get("/wishlist", async (request: AuthRequest, response) => { const [rows] = await db.query("SELECT f.FavouritesID id, f.DateAdded dateAdded, p.Product_ID productId, p.Name name, p.Price price, p.Image_Path image FROM favourites f JOIN products p ON p.Product_ID=f.Product_ID WHERE f.Customer_ID=?", [request.user!.id]); response.json(rows); });
customerRouter.post("/wishlist", async (request: AuthRequest, response) => { const [existing] = await db.query("SELECT FavouritesID FROM favourites WHERE Customer_ID=? AND Product_ID=? LIMIT 1", [request.user!.id, request.body.productId]); if (!(existing as object[]).length) await db.execute("INSERT INTO favourites (Customer_ID, Product_ID) VALUES (?, ?)", [request.user!.id, request.body.productId]); response.status(201).json({ message: "Added to wishlist" }); });
customerRouter.delete("/wishlist/:id", async (request: AuthRequest, response) => { await db.execute("DELETE FROM favourites WHERE FavouritesID=? AND Customer_ID=?", [request.params.id, request.user!.id]); response.status(204).end(); });
customerRouter.get("/orders", async (request: AuthRequest, response) => {
  const [rows] = await db.query(`SELECT o.Order_ID id, o.Order_Date date, o.Status status, o.Shipping_Address address,
    o.Total_Price total, o.Phone phone, cp.Coupon_Code coupon, pm.Method_Name payment,
    sm.Shipping_Method shippingMethod, s.Shipping_Status shippingStatus,
    GROUP_CONCAT(p.Product_ID ORDER BY oi.Order_Item_ID SEPARATOR '|||') productIds,
    GROUP_CONCAT(p.Name ORDER BY oi.Order_Item_ID SEPARATOR '|||') productNames,
    GROUP_CONCAT(REPLACE(p.Image_Path, '../', '/') ORDER BY oi.Order_Item_ID SEPARATOR '|||') productImages,
    GROUP_CONCAT(oi.Quantity ORDER BY oi.Order_Item_ID SEPARATOR '|||') quantities,
    GROUP_CONCAT(oi.Unit_Price ORDER BY oi.Order_Item_ID SEPARATOR '|||') prices
    FROM orders o
    LEFT JOIN coupons cp ON cp.Coupon_ID=o.cupon_id
    LEFT JOIN payment_methods pm ON pm.Payment_Method_ID=o.Payment_Method_ID
    LEFT JOIN shipping s ON s.Order_ID=o.Order_ID
    LEFT JOIN shippingmethods sm ON sm.Shipping_Method_ID=s.Shipping_Method_ID
    LEFT JOIN order_items oi ON oi.Order_ID=o.Order_ID
    LEFT JOIN products p ON p.Product_ID=oi.Product_ID
    WHERE o.Customer_ID=?
    GROUP BY o.Order_ID, o.Order_Date, o.Status, o.Shipping_Address, o.Total_Price, o.Phone, cp.Coupon_Code, pm.Method_Name, sm.Shipping_Method, s.Shipping_Status
    ORDER BY o.Order_Date DESC`, [request.user!.id]);
  const orders = (rows as Array<Record<string, unknown>>).map((order) => {
    const split = (value: unknown) => value ? String(value).split("|||") : [];
    const ids = split(order.productIds); const names = split(order.productNames); const images = split(order.productImages); const quantities = split(order.quantities); const prices = split(order.prices);
    return { ...order, items: names.map((name, index) => ({ productId: Number(ids[index]), name, image: images[index] ?? "", quantity: Number(quantities[index] ?? 1), price: Number(prices[index] ?? 0) })), productIds: undefined, productNames: undefined, productImages: undefined, quantities: undefined, prices: undefined };
  });
  response.json(orders);
});
customerRouter.post("/orders", async (request: AuthRequest, response) => {
  const shippingAddress = String(request.body.shippingAddress ?? "").trim();
  const phone = String(request.body.phone ?? "").trim();
  const paymentMethodId = Number(request.body.paymentMethodId);
  const shippingMethodId = Number(request.body.shippingMethodId);
  const couponId = request.body.couponId ? Number(request.body.couponId) : null;
  if (!shippingAddress || !phone || !paymentMethodId || !shippingMethodId) return response.status(400).json({ message: "Delivery address, phone, delivery and payment methods are required" });

  const order = await transaction(async (connection) => {
    const [cart] = await connection.query(`SELECT sc.Product_ID, sc.Quantity, sc.shade_id, p.Price, p.brand_id, s.Quantity stock
      FROM shopping_cart sc JOIN products p ON p.Product_ID=sc.Product_ID
      LEFT JOIN shades s ON s.shade_id=sc.shade_id WHERE sc.Customer_ID=? FOR UPDATE`, [request.user!.id]);
    const items = cart as Array<{ Product_ID: number; Quantity: number; Price: number; brand_id: number; shade_id: number | null; stock: number | null }>;
    if (!items.length) throw new Error("Your shopping bag is empty");
    if (items.some((item) => item.shade_id !== null && Number(item.stock) < Number(item.Quantity))) throw new Error("One or more products no longer have enough stock");

    const [shippingRows] = await connection.query("SELECT Cost cost FROM shippingmethods WHERE Shipping_Method_ID=? LIMIT 1", [shippingMethodId]);
    const shippingMethod = (shippingRows as Array<{ cost: number }>)[0];
    if (!shippingMethod) throw new Error("The selected delivery method is unavailable");
    const [paymentRows] = await connection.query("SELECT Payment_Method_ID FROM payment_methods WHERE Payment_Method_ID=? LIMIT 1", [paymentMethodId]);
    if (!(paymentRows as object[]).length) throw new Error("The selected payment method is unavailable");

    const subtotal = items.reduce((sum, item) => sum + Number(item.Price) * Number(item.Quantity), 0);
    let discount = 0;
    if (couponId) {
      const [couponRows] = await connection.query("SELECT Discount_Percentage discount, Minimum_Purchase_Amount minimum FROM coupons WHERE Coupon_ID=? AND NOW() BETWEEN Valid_From AND Valid_To LIMIT 1", [couponId]);
      const coupon = (couponRows as Array<{ discount: number; minimum: number }>)[0];
      if (!coupon) throw new Error("This discount code is no longer valid");
      if (subtotal < Number(coupon.minimum)) throw new Error(`This discount requires a minimum spend of £${Number(coupon.minimum).toFixed(2)}`);
      discount = subtotal * Number(coupon.discount) / 100;
    }
    const total = Math.max(0, subtotal - discount) + Number(shippingMethod.cost);
    const [result] = await connection.execute("INSERT INTO orders (Customer_ID, Status, Shipping_Address, Total_Price, cupon_id, Payment_Method_ID, Phone) VALUES (?, 'Pending', ?, ?, ?, ?, ?)", [request.user!.id, shippingAddress, total, couponId, paymentMethodId, phone]);
    const id = (result as { insertId: number }).insertId;
    for (const item of items) {
      await connection.execute("INSERT INTO order_items (Order_ID, Product_ID, Quantity, Unit_Price, Subtotal, brand_id, shade_id) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, item.Product_ID, item.Quantity, item.Price, Number(item.Price) * Number(item.Quantity), item.brand_id, item.shade_id]);
      if (item.shade_id !== null) await connection.execute("UPDATE shades SET Quantity=Quantity-? WHERE shade_id=?", [item.Quantity, item.shade_id]);
    }
    const [shipping] = await connection.execute("INSERT INTO shipping (Order_ID, Shipping_Status, Shipping_Method_ID) VALUES (?, 'Processing', ?)", [id, shippingMethodId]);
    await connection.execute("UPDATE orders SET shipping_id=? WHERE Order_ID=?", [(shipping as { insertId: number }).insertId, id]);
    await connection.execute("DELETE FROM shopping_cart WHERE Customer_ID=?", [request.user!.id]);
    return { id, total };
  });
  response.status(201).json(order);
});
customerRouter.post("/reviews", async (request: AuthRequest, response) => { const { productId, rating, text } = request.body; if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5 || !String(text ?? "").trim()) return response.status(400).json({ message: "A rating and review are required" }); const [delivered] = await db.query("SELECT o.Order_ID FROM orders o JOIN order_items oi ON oi.Order_ID=o.Order_ID JOIN shipping s ON s.Order_ID=o.Order_ID WHERE o.Customer_ID=? AND oi.Product_ID=? AND s.Shipping_Status='Delivered' LIMIT 1", [request.user!.id, productId]); if (!(delivered as object[]).length) return response.status(403).json({ message: "You can review this product after a delivered purchase" }); await db.execute("INSERT INTO reviews (Product_ID, Customer_ID, Rating, Review_Text) VALUES (?, ?, ?, ?)", [productId, request.user!.id, rating, String(text).trim()]); response.status(201).json({ message: "Review submitted" }); });
customerRouter.get("/chat", async (request: AuthRequest, response) => { const [rows] = await db.query("SELECT id, customer_id customerId, admin_id adminId, message, timestamp FROM chat_messages WHERE customer_id=? ORDER BY timestamp, id", [request.user!.id]); response.json(rows); });
customerRouter.post("/chat", async (request: AuthRequest, response) => {
  const message = String(request.body.message ?? "").trim();
  if (!message) return response.status(400).json({ message: "Please enter a message" });
  if (message.length > 2000) return response.status(400).json({ message: "Messages must be 2,000 characters or fewer" });
  const [result] = await db.execute("INSERT INTO chat_messages (customer_id, admin_id, message, admin_read) VALUES (?, NULL, ?, 0)", [request.user!.id, message]);
  const id = (result as { insertId: number }).insertId;
  const [rows] = await db.query("SELECT id, customer_id customerId, admin_id adminId, message, timestamp FROM chat_messages WHERE id=?", [id]);
  response.status(201).json((rows as object[])[0]);
});
