exports.getPromptModules = () => {
  return ["reactVersion", "linter", "typescript"].map((file) =>
    require(`../promptModules/${file}`)
  );
};
