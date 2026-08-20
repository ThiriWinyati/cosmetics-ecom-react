import { Router } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { db } from "../db.js";
import { config } from "../config.js";
import { requireAuth, signToken, type AuthRequest } from "../middleware/auth.js";

export const authRouter = Router();
const googleClient = new OAuth2Client();

const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash.replace(/^\$2y\$/, "$2b$"));

authRouter.post("/customer/register", async (request, response) => {
  const name = String(request.body.name ?? "").trim();
  const email = String(request.body.email ?? "").trim().toLowerCase();
  const password = String(request.body.password ?? "");
  const { phone = "", address = "" } = request.body;
  if (!name || !email || !password) return response.status(400).json({ message: "Name, email and password are required" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return response.status(400).json({ message: "Please enter a valid email address" });
  if (password.length < 8) return response.status(400).json({ message: "Password must contain at least 8 characters" });
  const [existing] = await db.query("SELECT Customer_ID FROM customers WHERE Email = ?", [email]);
  if (Array.isArray(existing) && existing.length) return response.status(409).json({ message: "Email is already registered" });
  const hash = await bcrypt.hash(password, 12);
  const [result] = await db.execute("INSERT INTO customers (Name, Email, Password, Phone, Address) VALUES (?, ?, ?, ?, ?)", [name, email, hash, phone, address]);
  const id = (result as { insertId: number }).insertId;
  response.status(201).json({ token: signToken({ id, name, role: "customer" }), user: { id, name, email, role: "customer" } });
});

authRouter.post("/customer/login", async (request, response) => {
  const email = String(request.body.email ?? "").trim().toLowerCase();
  const [rows] = await db.query("SELECT Customer_ID id, Name name, Email email, Password password FROM customers WHERE Email = ? LIMIT 1", [email]);
  const user = (rows as Array<{ id: number; name: string; email: string; password: string }>)[0];
  if (!user || !(await verifyPassword(request.body.password ?? "", user.password))) return response.status(401).json({ message: "Invalid email or password" });
  response.json({ token: signToken({ id: user.id, name: user.name, role: "customer" }), user: { id: user.id, name: user.name, email: user.email, role: "customer" } });
});

authRouter.post("/customer/google", async (request, response) => {
  if (!config.googleClientId) return response.status(503).json({ message: "Google login is not configured yet" });
  const ticket = await googleClient.verifyIdToken({ idToken: request.body.credential, audience: config.googleClientId });
  const profile = ticket.getPayload();
  if (!profile?.sub || !profile.email || !profile.email_verified) return response.status(401).json({ message: "Google could not verify this account" });
  const [rows] = await db.query("SELECT Customer_ID id, Name name, Email email FROM customers WHERE Google_Sub=? OR Email=? LIMIT 1", [profile.sub, profile.email]);
  let user = (rows as Array<{ id: number; name: string; email: string }>)[0];
  if (user) {
    await db.execute("UPDATE customers SET Google_Sub=COALESCE(Google_Sub, ?), Profile_Picture=COALESCE(?, Profile_Picture) WHERE Customer_ID=?", [profile.sub, profile.picture ?? null, user.id]);
  } else {
    const unusablePassword = await bcrypt.hash(`${profile.sub}:${crypto.randomUUID()}`, 12);
    const [result] = await db.execute("INSERT INTO customers (Name, Email, Password, Phone, Address, Profile_Picture, Google_Sub) VALUES (?, ?, ?, '', '', ?, ?)", [profile.name ?? "Google customer", profile.email, unusablePassword, profile.picture ?? null, profile.sub]);
    user = { id: (result as { insertId: number }).insertId, name: profile.name ?? "Google customer", email: profile.email };
  }
  response.json({ token: signToken({ id: user.id, name: user.name, role: "customer" }), user: { ...user, role: "customer" } });
});

authRouter.post("/admin/login", async (request, response) => {
  const [rows] = await db.query("SELECT Admin_User_ID id, Name name, Password password FROM admin_users WHERE Name = ? LIMIT 1", [request.body.name]);
  const user = (rows as Array<{ id: number; name: string; password: string }>)[0];
  const valid = user && (user.password.startsWith("$2") ? await verifyPassword(request.body.password ?? "", user.password) : request.body.password === user.password);
  if (!valid) return response.status(401).json({ message: "Invalid administrator credentials" });
  response.json({ token: signToken({ id: user.id, name: user.name, role: "admin" }), user: { id: user.id, name: user.name, role: "admin" } });
});

authRouter.get("/me", requireAuth(), async (request: AuthRequest, response) => response.json({ user: request.user }));
