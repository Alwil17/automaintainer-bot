import { createNodeMiddleware, createProbot } from "probot";
import appHandler from "./handlers/app.js";
const middleware = createNodeMiddleware(appHandler, {
    probot: createProbot()
});
export const probotApp = (req, res) => {
    middleware(req, res, () => {
        res.writeHead(404);
        res.end();
    });
};
//# sourceMappingURL=index.js.map