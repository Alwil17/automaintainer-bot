import { createNodeMiddleware, createProbot } from "probot";
import app from "./lib/handlers/app.js"; // Note le `.js` obligatoire

export const probotApp = createNodeMiddleware(app, {
  probot: createProbot(),
  webhooksPath: "/"
});
