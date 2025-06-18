import { createNodeMiddleware, createProbot } from "probot";
import appFn from "./dist/handlers/app.js";

export const probotApp = createNodeMiddleware(appFn, {
  probot: createProbot(),
  webhooksPath: "/",
});
