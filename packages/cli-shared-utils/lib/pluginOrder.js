const orderParamsCache = new Map();

function getOrderParams(plugin) {
  if (!process.env.YQB_CLI_TEST && orderParamsCache.has(plugin.id)) {
    return orderParamsCache.get(plugin.id);
  }
  const apply = plugin.apply;

  let after = new Set();
  if (typeof apply.after === "string") {
    after = new Set([apply.after]);
  } else if (Array.isArray(apply.after)) {
    after = new Set(apply.after);
  }
  if (!process.env.YQB_CLI_TEST) {
    orderParamsCache.set(plugin.id, { after });
  }

  return { after };
}

function topologicalSorting(plugins) {
  const pluginsMap = new Map(plugins.map((p) => [p.id, p]));
  const indegrees = new Map();
  const graph = new Map();
  plugins.forEach((p) => {
    const after = getOrderParams(p).after;
    indegrees.set(p, after.size);
    if (after.size === 0) return;
    for (const id of after) {
      const prerequisite = pluginsMap.get(id);
      // remove invalid data
      if (!prerequisite) {
        indegrees.set(p, indegrees.get(p) - 1);
        continue;
      }

      if (!graph.has(prerequisite)) {
        graph.set(prerequisite, []);
      }
      graph.get(prerequisite).push(p);
    }
  });

  const res = [];
  const queue = [];
  indegrees.forEach((d, p) => {
    if (d === 0) queue.push(p);
  });
  while (queue.length) {
    const cur = queue.shift();
    res.push(cur);
    const neighbors = graph.get(cur);
    if (!neighbors) continue;

    neighbors.forEach((n) => {
      const degree = indegrees.get(n) - 1;
      indegrees.set(n, degree);
      if (degree === 0) {
        queue.push(n);
      }
    });
  }
  const valid = res.length === plugins.length;
  if (!valid) {
    console.error(`No proper plugin execution order found.`);
    return plugins;
  }
  return res;
}

function sortPlugins(plugins) {
  if (plugins.length < 2) return plugins;
  return topologicalSorting(plugins);
}

module.exports = {
  sortPlugins,
  topologicalSorting,
};
