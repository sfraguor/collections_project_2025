// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add additional file extensions to assetExts
config.resolver.assetExts.push(
  'db',
  'sqlite'
);

// Add additional file extensions to sourceExts
config.resolver.sourceExts = [
  'js',
  'jsx',
  'json',
  'ts',
  'tsx',
  ...config.resolver.sourceExts,
];

module.exports = config;
