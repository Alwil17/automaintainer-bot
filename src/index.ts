import { Probot } from "probot";
import appHandler from "./handlers/app.js";

export default (app: Probot) => {
  appHandler(app);
};

