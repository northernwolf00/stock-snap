const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const srcDir = path.resolve(__dirname, 'src');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@/')) {
    return context.resolveRequest(
      context,
      path.resolve(srcDir, moduleName.slice(2)),
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
