const chalk = require("chalk");
const stripAnsi = require('strip-ansi')
const readline = require("readline");
const EventEmitter = require("events");

const { stopSpinner } = require("./spinner");

exports.events = new EventEmitter();

function _log(type, tag, message) {
  if (process.env.YQB_CLI_API_MODE && message) {
    exports.events.emit("log", {
      message,
      type,
      tag,
    });
  }
}

const format = (label, msg) => {
  return msg
    .split("\n")
    .map((line, i) => {
      return i === 0
        ? `${label} ${line}`
        : line.padStart(stripAnsi(label).length + line.length + 1);
    })
    .join("\n");
};

const chalkTag = msg => chalk.bgBlackBright.white.dim(` ${msg} `)

exports.log = (msg = "", tag = null) => {
  tag ? console.log(format(chalkTag(tag), msg)) : console.log(msg);
  _log("log", tag, msg);
};

exports.error = (msg, tag = null) => {
  stopSpinner();
  console.error(
    format(chalk.bgRed(" ERROR ") + (tag ? chalkTag(tag) : ""), chalk.red(msg))
  );
  _log("error", tag, msg);
  if (msg instanceof Error) {
    console.error(msg.stack);
    _log("error", tag, msg.stack);
  }
};
