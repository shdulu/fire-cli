const pluginRE = /^(@fire\/|fire-|@[\w-]+(\.)?[\w-]+\/fire-)cli-plugin-/;
const scopeRE = /^@[\w-]+(\.)?[\w-]+\//;
const officialRE = /^@fire\//;

exports.isPlugin = (id) => pluginRE.test(id);

exports.isOfficialPlugin = (id) => exports.isPlugin(id) && officialRE.test(id);

exports.toShortPluginId = (id) => id.replace(pluginRE, ""); // @fire/cli-plugin-eslint => eslint
