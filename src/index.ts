import { createNodeMiddleware, createProbot } from "probot";
import appHandler from "./handlers/app.js";

const middleware = createNodeMiddleware(appHandler, {
  probot: createProbot(),
  webhooksPath: "/",
});

import { IncomingMessage, ServerResponse } from "http";

export const probotApp = (req: IncomingMessage, res: ServerResponse) => {
  middleware(req, res, () => {
    res.writeHead(404);
    res.end();
  });
};
// TODO: Add a health check endpoint