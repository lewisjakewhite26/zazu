const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Metro's default disk-based FileStore writes one file per cached module under
// %TEMP%/metro-cache. On Windows this project's node_modules tree (~60k files)
// makes a full bundle open enough cache files concurrently to hit Node's file
// handle ceiling (EMFILE), crashing the dev server. An in-memory store avoids
// the disk I/O burst entirely; the only cost is losing the cache across restarts.
class MemoryCacheStore {
  constructor() {
    this.cache = new Map();
  }
  async get(key) {
    return this.cache.get(key.toString('hex')) ?? null;
  }
  async set(key, value) {
    this.cache.set(key.toString('hex'), value);
  }
  clear() {
    this.cache.clear();
  }
}

config.cacheStores = [new MemoryCacheStore()];

module.exports = config;
