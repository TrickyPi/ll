/** @typedef {import("ll-script/lib/config/webpack.config").WebpackConfig} WebpackConfig */
/** @typedef {import("ll-script/lib/scripts/start").Configuration} DevServerConfig */
module.exports = {
  /** @type {WebpackConfig} */
  webpackConfig: (prevConfig, { isDev, isBuild }) => {
    //the best way is use webpack-merge to merge webpack config
    return prevConfig;
  },
  /** @type {DevServerConfig} */
  devServer: {}
};
