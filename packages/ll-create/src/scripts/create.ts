import fse from "fs-extra";
import path from "path";
import paths from "../config/path";

type Template = "react-ts" | "react-js";

export default function create({
  type,
  destination
}: {
  type: Template;
  destination: string;
}) {
  const cwd = process.cwd();
  const absDestination = path.resolve(cwd, destination);
  const temp = type === "react-ts" ? paths.reactTsDir : paths.reactJsDir;
  fse.ensureDirSync(absDestination);
  fse.copySync(temp, absDestination);
}
