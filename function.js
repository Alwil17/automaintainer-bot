import { createNodeMiddleware, Probot } from "probot";
import appFn from "./dist/handlers/app.js";

// Ensure environment variables are set
const probot = new Probot({
  appId: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
  secret: process.env.WEBHOOK_SECRET,
});

// Register the app function with Probot
export const probotApp = createNodeMiddleware(appFn, {
  probot: probot,
  webhooksPath: "/",
});
