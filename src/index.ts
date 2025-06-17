import { createNodeMiddleware, createProbot } from "probot";
import appHandler from "./handlers/app.js";

export default createNodeMiddleware(appHandler, { probot: createProbot() });
