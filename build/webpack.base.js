/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config();

const os = require("os");
const HappyPack = require("happypack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");

exports.happyThreadPool = HappyPack.ThreadPool({
  size: Math.min(os.cpus().length, 4)
});

const cssLoaders = [
  MiniCssExtractPlugin.loader,
  { loader: "css-loader", options: { sourceMap: false } },
  { loader: "postcss-loader", options: { sourceMap: false } }
];

const lessLoaders = [
  ...cssLoaders,
  {
    loader: "less-loader",
    options: {
      implementation: require("less"),
      fiber: require("fibers"),
      indentedSyntax: false
    }
  }
];

const plugins = [
  new FriendlyErrorsWebpackPlugin({
    clearConsole: true
  })
];

exports.config = {
  mode: "production",
  resolve: {
    extensions: [".js", ".vue", ".ts", "json", "tsx"]
  },
  module: {
    rules: [
      // css
      {
        test: /\.css$/,
        use: cssLoaders
      },
      {
        test: /\.less$/,
        use: lessLoaders
      },
      // vue
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          compilerOptions: {
            preserveWhitespace: true
          }
        }
      },
      {
        test: /\.(ico|png|jpe?g|gif|svg)$/,
        loader: "url-loader",
        options: {
          limit: 8192,
          name: "images/[name]_[hash:7].[ext]"
        }
      },
      // 字体
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        loader: "url-loader",
        options: {
          limit: 8192,
          name: "fonts/[name]_[hash:7].[ext]"
        }
      }
      // {
      //   test: /\.vue$/,
      //   loader: "vue-loader",
      //   options: {
      //     compilerOptions: {
      //       preserveWhitespace: true
      //     },
      //     loaders: {
      //       ts: "ts-loader",
      //       tsx: "babel-loader!ts-loader"
      //     }
      //   }
      // },
      // {
      //   test: /\.tsx?$/,
      //   exclude: /node_modules/,
      //   use: [
      //     "babel-loader",
      //     {
      //       loader: "ts-loader",
      //       options: { appendTsxSuffixTo: [/\.vue$/] }
      //     }
      //   ]
      // }
    ]
  },
  plugins,
  performance: {
    hints: false
  },
  stats: { children: false }
};
