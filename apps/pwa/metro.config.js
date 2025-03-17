const { withNxMetro } = require('@nx/expo');
const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const { mergeConfig } = require('metro-config');
const defaultConfig = getDefaultConfig(__dirname);

const cssConfig = withNativeWind(defaultConfig, { input: './global.css' });

const svgTransformer = require('react-native-svg-transformer');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
*
* @type {import('metro-config').MetroConfig}
*/
const { assetExts, sourceExts } = defaultConfig.resolver;
const customConfig = {
  cacheVersion: 'pwa',
  // transformer: {
  //   babelTransformerPath: {
  //     ...defaultConfig.transformer,
  //     // babelTransformerPath: require.resolve('react-native-svg-transformer'),
  //     // babelTransformerPath: require.resolve('nativewind/metro'), // For nativewind
  //   },
  // },
  resolver: {
    assetExts: [...assetExts.filter((ext) => ext !== 'svg'), 'css'],
    sourceExts: [...sourceExts, 'cjs', 'mjs', 'svg', 'css'],
    extraNodeModules: {
      '@': __dirname + '/src',
    },
  },
};

module.exports = withNxMetro(mergeConfig(cssConfig, customConfig), {
  // Change this to true to see debugging info.
  // Useful if you have issues resolving modules
  debug: false,
  // all the file extensions used for imports other than 'ts', 'tsx', 'js', 'jsx', 'json'
  extensions: [],
  // Specify folders to watch, in addition to Nx defaults (workspace libraries and node_modules)
  watchFolders: ["./src/"],
});
