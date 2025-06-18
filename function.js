const { createNodeMiddleware, createProbot } = require("probot");
const app = require("./lib/handlers/app");

exports.probotApp = createNodeMiddleware(app, { probot: createProbot(), webhooksPath: "/" });