import { Configuration } from "webpack";
import CopyPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import paths from "./paths";

export default function getCommonConfig({
  isDev,
  isBuild,
  isTs
}: {
  isDev: boolean;
  isBuild: boolean;
  isTs: boolean;
}): Configuration {
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
      isBuild ? MiniCssExtractPlugin.loader : "style-loader",
      {
        loader: "css-loader",
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
        loader: "postcss-loader",
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
      extensions: [".tsx", ".ts", "jsx", ".js"],
      plugins: [isTs && new TsconfigPathsPlugin()].filter(Boolean)
    },
    output: {
      filename: isBuild
        ? "static/js/[name].[contenthash:8].js"
        : "static/js/[name].bundle.js",
      chunkFilename: isBuild
        ? "static/js/[name].[contenthash:8].chunk.js"
        : "static/js/[name].chunk.js",
      path: paths.dist,
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
            "less-loader"
          )
        },
        {
          test: /\.(scss|sass)$/,
          use: getStyleLoaders(
            {
              importLoaders: 1
            },
            "sass-loader"
          )
        },
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          include: paths.appSrc,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: [
                  [
                    "@babel/preset-env",
                    {
                      useBuiltIns: "entry",
                      corejs: 3
                    }
                  ],
                  [
                    "@babel/preset-react",
                    {
                      runtime: "automatic"
                    }
                  ],
                  isTs && "@babel/preset-typescript"
                ].filter(Boolean),
                plugins: [isDev && "react-refresh/babel"].filter(Boolean)
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
            filter: async (resourcePath) => !resourcePath.includes(".html"),
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
