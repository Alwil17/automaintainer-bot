import { createNodeMiddleware, createProbot } from "probot";
import app from "./dist/handlers/app.js";

export const probotApp = createNodeMiddleware(app, {
  probot: createProbot(),
  webhooksPath: "/",
});
