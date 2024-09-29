import { Hono } from "hono";
import { handle } from "hono/vercel";
import users from "@/app/api/[[...route]]/users";

const app = new Hono().basePath("/api");

const routes = app.route("/users", users);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const PUT = handle(app);

export type AppType = typeof routes;
