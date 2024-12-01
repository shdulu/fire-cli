const { execSync } = require("child_process");

let _hasYarn;

exports.hasYarn = () => {
  if (process.env.YQB_CLI_TEST) {
    return true;
  }
  if (_hasYarn != null) {
    return _hasYarn;
  }
  try {
    execSync("yarn --version", { stdio: "ignore" });
    return (_hasYarn = true);
  } catch (e) {
    return (_hasYarn = false);
  }
};
