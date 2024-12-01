const fs = require("fs");
const { getRcPath } = require("./util/rcPath");
const { error } = require("@fire/cli-shared-utils/lib/logger");
const rcPath = (exports.rcPath = getRcPath(".firerc"));

exports.defaultPreset = {
  useConfigFiles: false,
  cssPreprocessor: undefined,
  plugins: {
    "@fire/cli-plugin-babel": {},
    "@fire/cli-plugin-eslint": {
      config: "base",
      lintOn: ["save"],
    },
  },
};

exports.defaults = {
  presets: {
    "Default (React 18)": Object.assign(
      { reactVersion: "18" },
      exports.defaultPreset
    ),
  },
};

let cachedOptions;
exports.loadOptions = () => {
  if (cachedOptions) {
    return cachedOptions;
  }
  if (fs.existsSync(rcPath)) {
    try {
      cachedOptions = JSON.parse(fs.readFileSync(rcPath, "utf-8"));
    } catch (e) {
      error(
        `Error loading saved preferences: ` +
          `~/.firerc may be corrupted or have syntax errors. ` +
          `Please fix/delete it and re-run fire-cli in manual mode.\n` +
          `(${e.message})`
      );
      exit(1);
    }
    // TODO: validate cachedOptions
    return cachedOptions;
  } else {
    return {};
  }
};
