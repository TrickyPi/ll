import fse from "fs-extra";
import { pathToRegexp } from "path-to-regexp";
import paths from "../config/paths";

const isPath = (url, path) => {
  const routePath = path.replace(/\${(.+?)}/g, (_, value) => ":" + value);
  const regexp = pathToRegexp(routePath);
  return !!regexp.exec(url);
};

interface MockItem {
  path: string;
  method: string;
  res: {
    [key: string]: string;
  };
  mock: boolean;
}

export default function useMocks(app) {
  if (!fse.pathExistsSync(paths.mockFile)) {
    return;
  }
  app.use("/*", function (req, res, next) {
    const { originalUrl: url, method: reqMethod } = req;
    const {
      mock,
      api: data
    }: {
      mock: boolean;
      api: MockItem[];
    } = fse.readJsonSync(paths.mockFile);
    if (!mock) {
      return next();
    }
    const mockItem = data.find((elem) => {
      const { path, mock, method: configMethod } = elem;
      return (
        configMethod.toUpperCase() === reqMethod && isPath(url, path) && mock
      );
    });
    if (mockItem) {
      res.status(200).send(mockItem.res);
    } else {
      next();
    }
  });
}
