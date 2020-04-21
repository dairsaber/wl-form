// eslint-disable-next-line @typescript-eslint/no-var-requires
// const path = require("path");

// function resolve(dir) {
//   return path.join(__dirname, dir);
// }

module.exports = {
  pages: {
    index: {
      entry: "src/examples/main.ts",
      template: "public/index.html",
      filename: "index.html",
      chunks: ["chunk-vendors", "chunk-common", "index"]
    }
  }
};
