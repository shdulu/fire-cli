[
  "logger",
  "spinner",
  "module",
  "npm",
  "pluginResolution",
  "pluginOrder",
  "env",
].forEach((m) => {
  Object.assign(exports, require(`./lib/${m}`));
});

exports.execa = require("execa");
exports.chalk = require("chalk");
exports.semver = require("semver");
