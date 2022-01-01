import path from "path";
const cwd = process.cwd();

export default {
  llConfig: path.resolve(cwd, "ll.config.js"),
  tsconfigFile: path.resolve(cwd, "tsconfig.json"),
  dist: path.resolve(cwd, "dist/"),
  appPkg: path.resolve(cwd, "package.json"),
  appSrc: path.resolve(cwd, "src/"),
  mockFile: path.resolve(cwd, "mock/index.json"),
  publicDir: path.resolve(cwd, "public/"),
  spaHtml: path.resolve(cwd, "public/index.html")
};
