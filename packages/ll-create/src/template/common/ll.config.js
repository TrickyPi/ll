module.exports = {
  webpackConfig: (prevConfig, { isDev, isBuild }) => {
    //the best way is use webpack-merge to merge webpack config
    return prevConfig;
  },
  //webpack-dev-server config
  devServer: {}
};
