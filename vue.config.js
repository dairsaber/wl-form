// const path = require("path");

// function resolve(dir) {
//   return path.join(__dirname, dir);
// }
const currentEnv = process.env.NODE_ENV;
console.log("currentEnv===>", currentEnv);
let config = {
  pages: {
    index: {
      entry: "src/examples/main.ts",
      template: "public/index.html",
      filename: "index.html",
      chunks: ["chunk-vendors", "chunk-common", "index"]
    }
  }
};
if (currentEnv === "production") {
  config = {
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
        aftool: "aftool",
        moment: "moment"
      }
    }
  };
}
module.exports = {
  ...config
};
