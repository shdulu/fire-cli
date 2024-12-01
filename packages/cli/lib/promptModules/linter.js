module.exports = (cli) => {
  cli.injectFeature({
    name: "Linter / Formatter",
    value: "linter",
    short: "Linter",
    description: "Check and enforce code quality with ESLint or Prettier",
    link: "https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint",
    plugins: ["eslint"],
    checked: true,
  });

  cli.injectPrompt({
    name: "eslintConfig",
    when: (answers) => answers.features.includes("linter"),
    type: "list",
    message: "Pick a linter / formatter config:",
    description:
      "Checking code errors and enforcing an homogeoneous code style is recommended.",
    choices: (answers) => [
      {
        name: "ESLint with error prevention only",
        value: "base",
        short: "Basic",
      },
      {
        name: "ESLint + Airbnb config",
        value: "airbnb",
        short: "Airbnb",
      },
      {
        name: "ESLint + Standard config",
        value: "standard",
        short: "Standard",
      },
      {
        name: "ESLint + Prettier",
        value: "prettier",
        short: "Prettier",
      },
    ],
  });

  cli.injectPrompt({
    name: "lintOn",
    message: "Pick additional lint features:",
    when: (answers) => answers.features.includes("linter"),
    type: "checkbox",
    choices: [
      {
        name: "Lint on save",
        value: "save",
        checked: true,
      },
      {
        name: "Lint and fix on commit",
        value: "commit",
      },
    ],
  });

  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes("linter")) {
      options.plugins["@yqb/cli-plugin-eslint"] = {
        config: answers.eslintConfig,
        lintOn: answers.lintOn,
      };
    }
  });
};
