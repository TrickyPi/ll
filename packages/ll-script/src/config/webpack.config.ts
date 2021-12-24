import fse from "fs-extra";
import paths from './paths'
import getCommonConfig from "./webpack.common";

export default () => {
  const isBuild = process.env.NODE_ENV === "production";
  const isDev = process.env.NODE_ENV === "development";
  const isTs = fse.pathExistsSync(paths.tsconfigFile);

  //公用的webpack配置
  const commonConfig = getCommonConfig({ isDev, isBuild, isTs });
  let outputConfig = commonConfig

  let webpackConfig = null
  if (fse.pathExistsSync(paths.llConfig)) {
    try {
      webpackConfig = require(paths.llConfig).webpackConfig
    } catch (err) {
      console.log(err)
    }
  }

  if (typeof webpackConfig === 'function') {
    outputConfig = webpackConfig(commonConfig, { isDev, isBuild })
  }

  //最后的配置
  return outputConfig;
};
