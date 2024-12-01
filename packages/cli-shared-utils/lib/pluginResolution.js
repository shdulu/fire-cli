const pluginRE = /^(@yqb\/|yqb-|@[\w-]+(\.)?[\w-]+\/yqb-)cli-plugin-/;
exports.isPlugin = (id) => pluginRE.test(id);

exports.toShortPluginId = function (id) {
  return id.replace(pluginRE, ""); // @yqb/cli-plugin-eslint => eslint
};
