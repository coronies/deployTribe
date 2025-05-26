const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallbacks for node polyfills
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        process: false,
        zlib: require.resolve('browserify-zlib'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util'),
        buffer: require.resolve('buffer'),
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        url: require.resolve('url'),
        crypto: require.resolve('crypto-browserify')
      };

      // Add process and Buffer polyfills
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser.js'
        }),
        new webpack.DefinePlugin({
          'process.env': JSON.stringify(process.env)
        })
      ];

      return webpackConfig;
    }
  }
}; 