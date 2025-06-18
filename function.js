// function.js
const { Probot } = require("probot");
const appFn = require("./lib/index");
const probot = new Probot({});

probot.load(appFn);

module.exports.webhook = (req, res) => {
  probot.webhooks
    .receive({
      id: req.get("x-github-delivery"),
      name: req.get("x-github-event"),
      payload: req.body,
    })
    .then(() => res.status(200).send("OK"))
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error");
    });
};

const { probotApp } = require("./lib/index.js");

exports.probotApp = probotApp;
