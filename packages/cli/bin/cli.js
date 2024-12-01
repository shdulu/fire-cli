#!/usr/bin/env node

const leven = require("leven");
const { semver, chalk } = require("@fire/cli-shared-utils");
const pkg = require("../package.json");
function checkNodeVersion(wanted, id) {
  if (!semver.satisfies(process.version, wanted, { includePrerelease: true })) {
    console.log(
      chalk.red(`You are using Node ${process.version}, but this version of  ${id}
       requires Node ${wanted}.\nPlease upgrade your Node version.`)
    );
    process.exit(1);
  }
}

checkNodeVersion(pkg.engines.node, "@fire/cli");

const program = require("commander");
program.version(`@fire/cli ${pkg.version}`).usage("<command> [options]");

program
  .command("create <app-name>")
  .option(
    "-f, --force",
    "是否强制初始化项目，如果文件目录已存在将会覆盖",
    false
  )
  .description("create a new project powered by fire-cli-service")
  .action((name, options) => {
    require("../lib/create")(name, options);
  });

// 监听未注册的命令 打印帮助信息
program.on("command:*", ([cmd]) => {
  program.outputHelp();
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
  console.log();
  suggestCommands(cmd);
  process.exitCode = 1;
});

// add some useful info on help
program.on("--help", () => {
  console.log();
  console.log(
    `  Run ${chalk.cyan(
      `fire <command> --help`
    )} for detailed usage of given command.`
  );
  console.log();
});

program.commands.forEach((c) => c.on("--help", () => console.log()));

program.parse(process.argv);

function suggestCommands(unknownCommand) {
  const availableCommands = program.commands.map((cmd) => cmd._name);

  let suggestion;

  availableCommands.forEach((cmd) => {
    const isBestMatch =
      leven(cmd, unknownCommand) < leven(suggestion || "", unknownCommand);
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd;
    }
  });

  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`));
  }
}
