/* eslint-disable @typescript-eslint/no-var-requires */
const merge = require("webpack-merge");
// const HappyPack = require("happypack");
const {
  config: baseWebpackConfig
  // happyThreadPool
} = require("./webpack.base");

// Helpers
const resolve = file => require("path").resolve(__dirname, file);

module.exports = merge(baseWebpackConfig, {
  entry: {
    main: resolve("../src/packages/install.ts")
  },
  output: {
    path: resolve("../lib"),
    // publicPath: "/",
    library: "wf",
    libraryTarget: "umd",
    filename: "index.js"
    // libraryExport: "default",
    // globalObject: "typeof self !== 'undefined' ? self : this"
  },
  // externals: {
  //   vue: {
  //     commonjs: "vue",
  //     commonjs2: "vue",
  //     amd: "vue",
  //     root: "Vue"
  //   }
  // },
  // module: {
  //   // rules: [
  //   //   // {
  //   //   //   test: /\.[tj]sx$/,
  //   //   //   use: "happypack/loader?id=scripts",
  //   //   //   exclude: /node_modules/
  //   //   // }
  //   // ]
  // },
  plugins: [
    // TODO: hangs build
    // new ForkTsCheckerWebpackPlugin({
    //   checkSyntacticErrors: true,
    //   tsconfig: resolve('../tsconfig.json')
    // }),
    // new HappyPack({
    //   id: "scripts",
    //   threadPool: happyThreadPool,
    //   loaders: [
    //     "babel-loader",
    //     {
    //       loader: "ts-loader",
    //       options: { happyPackMode: true, appendTsxSuffixTo: [/\.vue$/] }
    //     }
    //   ]
    // })
  ]
});
