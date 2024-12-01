const { semver, getNpmLatestVersion } = require("@fire/cli-shared-utils");
const { loadOptions } = require("../options");

let sessionCached;

module.exports = async function getVersions() {
  if (sessionCached) {
    return sessionCached;
  }

  let latest;
  const local = require(`../../package.json`).version;
  if (process.env.FIRE_CLI_TEST || process.env.FIRE_CLI_DEBUG) {
    return (sessionCached = {
      current: local,
      latest: local,
      latestMinor: local,
    });
  }

  // 检查插件是否包含预发版本
  const includePrerelease = !!semver.prerelease(local);

  const { latestVersion = local, lastChecked = 0 } = loadOptions();
  const cached = latestVersion;
  const daysPassed = (Date.now() - lastChecked) / (60 * 60 * 1000 * 24);

  let error;
  if (daysPassed > 1) {
    try {
      latest = await getAndCacheLatestVersion(cached, includePrerelease);
    } catch (e) {
      latest = cached;
      error = e;
    }
  } else {
    getAndCacheLatestVersion(cached, includePrerelease).catch(() => {});
    latest = cached;
  }

  // if the installed version is updated but the cache doesn't update
  if (semver.gt(local, latest) && !semver.prerelease(local)) {
    latest = local;
  }

  let latestMinor = `${semver.major(latest)}.${semver.minor(latest)}.0`;
  if (
    // if the latest version contains breaking changes
    /major/.test(semver.diff(local, latest)) ||
    // or if using `next` branch of cli
    (semver.gte(local, latest) && semver.prerelease(local))
  ) {
    // fallback to the local cli version number
    latestMinor = local;
  }

  return (sessionCached = {
    current: local,
    latest,
    latestMinor,
    error,
  });
};

// fetch the latest version and save it on disk
// so that it is available immediately next time
async function getAndCacheLatestVersion(cached, includePrerelease) {
  let version = await getNpmLatestVersion("@fire/cli-service");

  if (includePrerelease) {
    const next = await getNpmLatestVersion("@fire/cli-service");
    version = semver.gt(next, version) ? next : version;
  }

  if (semver.valid(version) && version !== cached) {
    saveOptions({ latestVersion: version, lastChecked: Date.now() });
    return version;
  }
  return cached;
}
