import fse from "fs-extra";
import { Configuration } from "webpack";
import paths from "./paths";
import getCommonConfig from "./webpack.common";

export interface BaseParams {
  isDev: boolean;
  isBuild: boolean;
}
export interface WebpackConfig {
  (arg0: Configuration, arg1: BaseParams): Configuration;
}

export default () => {
  const isBuild = process.env.NODE_ENV === "production";
  const isDev = process.env.NODE_ENV === "development";
  const isTs = fse.pathExistsSync(paths.tsconfigFile);

  //公用的webpack配置
  const commonConfig = getCommonConfig({ isDev, isBuild, isTs });
  let outputConfig = commonConfig;

  let webpackConfig: WebpackConfig | null = null;
  if (fse.pathExistsSync(paths.llConfig)) {
    try {
      webpackConfig = require(paths.llConfig).webpackConfig;
    } catch (err) {
      console.log(err);
    }
  }

  if (typeof webpackConfig === "function") {
    outputConfig = webpackConfig(commonConfig, { isDev, isBuild });
  }

  //最后的配置
  return outputConfig;
};
