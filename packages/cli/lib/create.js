const path = require("path");
const fs = require("fs-extra");
const validateProjectName = require("validate-npm-package-name");
const { chalk, error, stopSpinner } = require("@fire/cli-shared-utils");

const Creator = require("./Creator");
const { getPromptModules } = require("./util/createTools");

async function create(projectName, options) {
  const cwd = options.cwd || process.cwd(); // 当前命令执行目录
  const name = projectName; // 输入的项目名称
  const targetDir = path.resolve(cwd, projectName); // 完整的项目创建目录

  const result = validateProjectName(name);
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`));
    exit(1);
  }
  if (fs.existsSync(targetDir)) {
    console.log("当前文件夹已存在", options);
    if (options.force) {
      await fs.remove(targetDir);
    }
  }
  const creator = new Creator(name, targetDir, getPromptModules());
  await creator.create(options);
}

module.exports = (...args) => {
  return create(...args).catch((err) => {
    stopSpinner(false); // do not persist
    error(err);
    console.log(err);
    if (!process.env.FIRE_CLI_TEST) {
      process.exit(1);
    }
  });
};
