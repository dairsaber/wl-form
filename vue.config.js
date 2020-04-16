// eslint-disable-next-line @typescript-eslint/no-var-requires
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
      filename: "index.html"
    }
  }
};
if (currentEnv === "production") {
  config = {
    configureWebpack: {
      output: {
        libraryExport: "default"
      }
    }
  };
}
module.exports = {
  ...config
};
