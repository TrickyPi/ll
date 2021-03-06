import { Configuration } from "webpack";
//@ts-ignore
import CopyPlugin from "copy-webpack-plugin";
//@ts-ignore
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import paths from "./paths";
import { BaseParams } from "./webpack.config";

interface TsParams extends BaseParams {
  isTs: boolean;
}

export default function getCommonConfig({
  isDev,
  isBuild,
  isTs
}: TsParams): Configuration {
  const { name: packageName } = require(paths.appPkg);

  //获取style处理的loader
  const getStyleLoaders = (
    cssOptions: {
      importLoaders: number;
    },
    extraLoader?: any
  ) => {
    isBuild && cssOptions.importLoaders++;
    const loaders = [
      isBuild ? MiniCssExtractPlugin.loader : require.resolve("style-loader"),
      {
        loader: require.resolve("css-loader"),
        options: {
          modules: {
            auto: true,
            localIdentName: isDev ? "[path][name]__[local]" : "[hash:base64]"
          },
          ...cssOptions
        }
      },
      /**
       * 优化运行时速度
       * dev环境就不需要postcss-loader了
       * 默认应该比较新的浏览器了
       */
      isBuild && {
        loader: require.resolve("postcss-loader"),
        options: {
          postcssOptions: {
            plugins: ["postcss-preset-env"]
          }
        }
      },
      extraLoader
    ].filter(Boolean);
    return loaders;
  };

  return {
    mode: isBuild ? "production" : "development",
    entry: "./src/index",
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"],
      plugins: [isTs && new TsconfigPathsPlugin()].filter(
        (value): value is any => Boolean(value)
      )
    },
    output: {
      filename: isBuild
        ? "static/js/[name].[contenthash:8].js"
        : "static/js/[name].bundle.js",
      chunkFilename: isBuild
        ? "static/js/[name].[contenthash:8].chunk.js"
        : "static/js/[name].chunk.js",
      path: paths.dist,
      publicPath: "/",
      clean: true,
      library: {
        name: packageName,
        type: "umd"
      }
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: getStyleLoaders({
            importLoaders: 0
          })
        },
        {
          test: /\.less$/,
          use: getStyleLoaders(
            {
              importLoaders: 1
            },
            require.resolve("less-loader")
          )
        },
        {
          test: /\.(scss|sass)$/,
          use: getStyleLoaders(
            {
              importLoaders: 1
            },
            require.resolve("sass-loader")
          )
        },
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          include: paths.appSrc,
          use: [
            {
              loader: require.resolve("babel-loader"),
              options: {
                presets: [
                  [
                    require.resolve("@babel/preset-env"),
                    {
                      useBuiltIns: "entry",
                      corejs: 3
                    }
                  ],
                  [
                    require.resolve("@babel/preset-react"),
                    {
                      runtime: "automatic"
                    }
                  ],
                  isTs && require.resolve("@babel/preset-typescript")
                ].filter(Boolean),
                plugins: [
                  isDev && require.resolve("react-refresh/babel")
                ].filter(Boolean)
              }
            }
          ]
        },
        {
          test: /\.(bmp|png|svg|jpg|jpeg|gif)$/i,
          type: "asset",
          parser: {
            dataUrlCondition: {
              maxSize: 10 * 1024
            }
          },
          generator: {
            filename: "static/img/[hash][ext][query]"
          }
        }
      ].filter(Boolean)
    },
    optimization: {
      runtimeChunk: "single",
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors-others",
            chunks: "all",
            priority: 0
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: "react-related",
            chunks: "all",
            priority: 1
          }
        }
      },
      minimizer: ["...", new CssMinimizerPlugin()]
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.spaHtml
      }),
      new CopyPlugin({
        patterns: [
          {
            from: paths.publicDir,
            filter: async (resourcePath: string) =>
              !resourcePath.includes(".html"),
            noErrorOnMissing: true
          }
        ]
      }),
      isBuild &&
        new MiniCssExtractPlugin({
          filename: "static/css/[name].[contenthash:8].css",
          chunkFilename: "static/css/[name].[contenthash:8].chunk.css"
        }),
      isDev && new ReactRefreshWebpackPlugin(),
      isTs &&
        new ForkTsCheckerWebpackPlugin({
          //https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#typescript-options
          typescript: {
            diagnosticOptions: {
              semantic: true,
              syntactic: true
            },
            mode: "write-references"
          }
        })
    ].filter(Boolean)
  };
}
