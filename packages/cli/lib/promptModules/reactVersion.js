module.exports = (cli) => {
  cli.injectFeature({
    name: "Choose React version",
    value: "reactVersion",
    description:
      "Choose a version of React.js that you want to start the project with",
    checked: true,
  });
  //cli.injectPrompt 是根据选择的 featurePrompt 然后注入对应的 prompt，当选择了 unit，接下来会有以下的 prompt，选择 Mocha + Chai 还是 Jest
  cli.injectPrompt({
    name: "reactVersion",
    when: (answers) => answers.features.includes("reactVersion"),
    message:
      "Choose a version of React.js that you want to start the project with",
    type: "list",
    choices: [
      {
        name: "18.x",
        value: "18",
      },
    ],
    default: "18",
  });
  cli.onPromptComplete((answers, options) => {
    if (answers.reactVersion) {
      options.reactVersion = answers.reactVersion;
    }
  });
};
