import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { config } from "./config.js";
import { db } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { productsRouter } from "./routes/products.js";
import { publicRouter } from "./routes/public.js";
import { customerRouter } from "./routes/customer.js";
import { adminRouter } from "./routes/admin.js";

export const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: "2mb" }));
app.get("/api/health", async (_request, response) => { await db.query("SELECT 1"); response.json({ status: "ok", database: "connected" }); });
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api", publicRouter);
app.use("/api/customer", customerRouter);
app.use("/api/admin", adminRouter);
app.use((_request, response) => response.status(404).json({ message: "API endpoint not found" }));

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);
  response.status(error?.code === "ER_DUP_ENTRY" ? 409 : 500).json({ message: error instanceof Error ? error.message : "Unexpected server error" });
};
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(config.port, "127.0.0.1", (error?: Error) => {
    if (error) {
      console.error(`Charm & Grace API could not start: ${error.message}`);
      process.exitCode = 1;
      return;
    }
    console.log(`Charm & Grace API listening on http://localhost:${config.port}`);
  });
}
