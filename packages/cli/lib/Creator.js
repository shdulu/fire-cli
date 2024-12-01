const inquirer = require("inquirer");
const cloneDeep = require("lodash.clonedeep");
const {
  chalk,
  execa,
  log,
  loadModule,
  hasYarn,
  isOfficialPlugin,
} = require("@fire/cli-shared-utils");

const getVersions = require("./util/getVersions");

const { defaults, loadOptions } = require("./options");

const isManualMode = (answers) => answers.preset === "__manual__";

class Creator {
  constructor(name, context, promptModules) {
    this.name = name; // 创建的项目名称
    this.context = process.env.FIRE_CLI_CONTEXT = context; // 创建的项目目录
    const { presetPrompt, featurePrompt } = this.resolveIntroPrompts();

    this.presetPrompt = presetPrompt; // 预设 {name: 'preset', type: 'list', choices: [React18, React19]}
    this.featurePrompt = featurePrompt; // 此时的特性还是一个空数组，选完了预设之后才会有
    this.outroPrompts = this.resolveOutroPrompts();
    this.injectedPrompts = [];
    this.promptCompleteCbs = []; // 选择完所有的特性后的回调数组
    this.afterInvokeCbs = [];
    this.afterAnyInvokeCbs = [];

    this.run = this.run.bind(this);
  }
  run(command, args) {
    return execa(command, args, { cwd: this.context });
  }
  async create(cliOptions = {}, preset = null) {
    const { name, context, afterInvokeCbs, afterAnyInvokeCbs } = this;
    if (!preset) {
      preset = await this.promptAndResolvePreset(); // 弹出并解析预设
      console.log("preset: ", preset);
      preset = cloneDeep(preset);
      preset.plugins["@fire/cli-service"] = Object.assign(
        { projectName: name },
        preset
      );
      log(`✨  Creating project in ${chalk.yellow(context)}.`);

      // get latest CLI plugin version
      const { latestMinor } = await getVersions();

      // generate package.json with plugin dependencies
      const pkg = {
        name,
        version: "0.1.0",
        private: true,
        devDependencies: {},
      };
      const deps = Object.keys(preset.plugins);
      deps.forEach(async (dep) => {
        if (preset.plugins[dep]._isPreset) {
          return;
        }
        let { version } = preset.plugins[dep];
        if (!version) {
          debugger;
          if (isOfficialPlugin(dep) || dep === "@fire/cli-service") {
            version = `~${latestMinor}`; //TODO: 实现查询npm 包最新版本的方法
          } else {
            version = "latesst";
          }
        }
        pkg.devDependencies[dep] = version; //TODO: 待实现查询npm版本号的方法
      });
    }
  }
  resolveIntroPrompts() {
    const presets = this.getPresets();
    const presetChoices = Object.entries(presets).map(([name]) => {
      return {
        name: `${name}`,
        value: name,
      };
    });
    const presetPrompt = {
      name: "preset",
      type: "list",
      message: `Please pick a preset:`,
      choices: [
        ...presetChoices,
        {
          name: "Manually select features",
          value: "__manual__",
        },
      ],
    };
    const featurePrompt = {
      name: "features",
      when: isManualMode,
      type: "checkbox",
      message: "Check the features needed for your project:",
      choices: [],
      pageSize: 10,
    };
    return {
      presetPrompt,
      featurePrompt,
    };
  }
  resolveOutroPrompts() {
    const outroPrompts = [
      {
        name: "useConfigFiles",
        when: isManualMode,
        type: "list",
        message: "Where do you prefer placing config for Babel, ESLint, etc.?",
        choices: [
          {
            name: "In dedicated config files",
            value: "files",
          },
          {
            name: "In package.json",
            value: "pkg",
          },
        ],
      },
      {
        name: "save",
        when: isManualMode,
        type: "confirm",
        message: "Save this as a preset for future projects?",
        default: false,
      },
      {
        name: "saveName",
        when: (answers) => answers.save,
        type: "input",
        message: "Save preset as:",
      },
    ];

    const savedOptions = loadOptions();
    if (!savedOptions.packageManager && hasYarn()) {
      const packageManagerChoices = [];

      if (hasYarn()) {
        packageManagerChoices.push({
          name: "Use Yarn",
          value: "yarn",
          short: "Yarn",
        });
      }

      packageManagerChoices.push({
        name: "Use NPM",
        value: "npm",
        short: "NPM",
      });

      outroPrompts.push({
        name: "packageManager",
        type: "list",
        message:
          "Pick the package manager to use when installing dependencies:",
        choices: packageManagerChoices,
      });
    }

    return outroPrompts;
  }
  getPresets() {
    return Object.assign({}, defaults.presets);
  }
  async promptAndResolvePreset() {
    let preset;
    const answers = await inquirer.prompt(this.resolveFinalPrompts());
    if (answers.preset && answers.preset !== "__manual__") {
      preset = await this.resolvePreset(answers.preset);
    } else {
      preset = {
        useConfigFiles: answers.useConfigFiles === "files",
        plugins: {},
      };
      answers.features = answers.features || [];
      this.promptCompleteCbs.forEach((cb) => cb(answers, preset));
    }
    return preset;
  }
  resolveFinalPrompts() {
    this.injectedPrompts.forEach((prompt) => {
      const originalWhen = prompt.when || (() => true);
      prompt.when = (answers) => {
        return isManualMode(answers) && originalWhen(answers);
      };
    });
    const prompts = [
      this.presetPrompt,
      this.featurePrompt,
      ...this.injectedPrompts,
      ...this.outroPrompts,
    ];
    return prompts;
  }
  async resolvePreset(name) {
    const savedPresets = this.getPresets();
    return savedPresets[name];
  }
}

module.exports = Creator;
