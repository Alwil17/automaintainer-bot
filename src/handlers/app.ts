import { Probot } from "probot";
import handleIssuesOpened from "../events/issueOpened.js";
import handlePush from "../events/push.js";
import handlePullRequestOpened from "../events/pullRequestOpened.js";

/**
 * Registers all event handlers with the Probot app.
 *
 * @param {Probot} app - The Probot app to register the event handlers with.
 */
export default function appHandler(app: Probot) {
  app.log.info("AutoMaintainer App Initialized");

  app.on("issues.opened", handleIssuesOpened);
  app.on("push", handlePush);
  app.on("pull_request.opened", handlePullRequestOpened);
}