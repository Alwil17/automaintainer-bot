import { createNodeMiddleware, createProbot } from "probot";
import app from "./lib/handlers/app.js";

export const probotApp = createNodeMiddleware(app, {
  probot: createProbot(),
  webhooksPath: "/",
});
