import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export type AuthUser = { id: number; role: "admin" | "customer"; name: string };
export type AuthRequest = Request & { user?: AuthUser };

export function requireAuth(role?: AuthUser["role"]) {
  return (request: AuthRequest, response: Response, next: NextFunction) => {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) return response.status(401).json({ message: "Authentication required" });
    try {
      const user = jwt.verify(token, config.jwtSecret) as AuthUser;
      if (role && user.role !== role) return response.status(403).json({ message: "Insufficient permissions" });
      request.user = user;
      next();
    } catch {
      response.status(401).json({ message: "Invalid or expired session" });
    }
  };
}

export function signToken(user: AuthUser) { return jwt.sign(user, config.jwtSecret, { expiresIn: "7d" }); }
