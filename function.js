import { createNodeMiddleware, Probot } from "probot";
import appFn from "./dist/handlers/app.js";

console.log("AutoMaintainer App Initialized");
const probot = new Probot({
  appId: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY,
  secret: process.env.WEBHOOK_SECRET,
});

probot.load(appFn);

export const probotApp = createNodeMiddleware(appFn, {
  probot: probot,
  webhooksPath: "/",
});
