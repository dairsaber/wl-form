// const path = require("path");

// function resolve(dir) {
//   return path.join(__dirname, dir);
// }
const currentEnv = process.env.NODE_ENV;
console.log("currentEnv===>", currentEnv);
const commonConfig = {
  transpileDependencies: ["ant-design-vue"]
};
let config = {
  parallel: false,
  configureWebpack: {
    output: {
      libraryExport: "default",
      libraryTarget: "umd"
    },
    externals: {
      vue: {
        commonjs: "vue",
        commonjs2: "vue",
        amd: "vue",
        root: "Vue"
      },
      "ant-design-vue": "ant-design-vue",
      moment: "moment"
    }
  },
  chainWebpack: config => {
    config.module
      .rule("ts")
      .use("ts-loader")
      .loader("ts-loader")
      .tap(options => {
        options.happyPackMode = false;
        options.transpileOnly = false;
        return options;
      });
    config.module
      .rule("tsx")
      .use("ts-loader")
      .loader("ts-loader")
      .tap(options => {
        options.happyPackMode = false;
        options.transpileOnly = false;
        return options;
      });
  }
};
if (currentEnv === "development") {
  config = {
    pages: {
      index: {
        entry: "src/examples/main.ts",
        template: "public/index.html",
        filename: "index.html",
        chunks: ["chunk-vendors", "chunk-common", "index"]
      }
    }
  };
}
module.exports = {
  ...commonConfig,
  ...config
};
