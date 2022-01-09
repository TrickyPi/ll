import webpack from "webpack";
import chalk from "chalk";
import ora from "ora";
import getConfig from "../config/webpack.config";

const BUILD_FAIL_TIP = "糟糕：打包失败了，下面是具体信息";

const spinner = ora("building").start();

const config = getConfig();

webpack(config).run((err, stats) => {
  if (err) {
    spinner.fail();
    console.log(chalk.red(BUILD_FAIL_TIP));
    console.log(err.stack || err);
    return;
  }
  const { version, assets, warnings, errors } = stats!.toJson();
  if (stats!.hasErrors()) {
    spinner.fail();
    console.log(chalk.red(BUILD_FAIL_TIP));
    console.log(errors);
    return;
  }
  spinner.succeed();
  if (stats!.hasWarnings()) {
    console.log(chalk.yellow("难受：有告警信息，下面是具体信息"));
    console.log(warnings!.map((item) => item.message).join("\n"));
  }
  console.log(chalk.yellow(`当前打包工具:webpack@${version}`));
  console.log(chalk.blue("资源清单:"));
  const assetsInfo = assets!.map(({ size, name }) => {
    return `    ${name} ${chalk.white(
      size > 1024 ? `~${Math.floor(size / 1024)}KB` : `${size}B`
    )}`;
  });
  assetsInfo.map((item) => {
    console.log(chalk.blue(item));
  });
});
