import webpack, { Configuration } from "webpack";
import DevServer, {
  Configuration as DevServerConfig
} from "webpack-dev-server";
import fse from "fs-extra";
import ora from "ora";
import portfinder from "portfinder";
import paths from "../config/paths";
import getConfig from "../config/webpack.config";
import useMocks from "../module/mock";
export { Configuration } from "webpack-dev-server";

const config: Configuration = {
  ...getConfig(),
  //下面所有配置都是为了精简terminal输出
  infrastructureLogging: {
    level: "warn"
  },
  stats: "errors-warnings"
};

const compiler = webpack(config);

(async () => {
  let defaultPort = 9000;

  //检测端口占用情况
  const port = await portfinder.getPortPromise({
    port: defaultPort,
    stopPort: defaultPort + 100
  });

  const spinner = ora(`starting dev server in ${port} port`).start();

  let devServer: DevServerConfig = {};
  if (fse.pathExistsSync(paths.llConfig)) {
    try {
      devServer = require(paths.llConfig).devServer;
    } catch (err) {
      console.log(err);
    }
  }

  const { setupMiddlewares: userSetupMiddlewares, ...restDevServerConfig } =
    devServer;

  const server = new DevServer(
    {
      static: paths.dist,
      hot: true,
      liveReload: false,
      open: true,
      port,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      historyApiFallback: true,
      ...restDevServerConfig,
      setupMiddlewares(middleware, devServer) {
        //mock
        useMocks(devServer.app);

        return userSetupMiddlewares
          ? userSetupMiddlewares(middleware, devServer)
          : middleware;
      }
    },
    compiler
  );

  compiler.hooks.watchRun.tap("MyPlugin", () => {
    spinner.isSpinning && spinner.succeed();
    spinner.color = "yellow";
    spinner.text = "webpack compiling";
    spinner.start();
  });

  compiler.hooks.done.tap("MyPlugin", ({ endTime, startTime }) => {
    spinner.isSpinning && spinner.succeed();
    console.log(`compiled time ~${endTime - startTime}ms`);
  });

  server.start();
})().catch((err) => {
  console.log(err);
});
