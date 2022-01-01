#!/usr/bin/env node
const params = process.argv.slice(2);
const [action] = params;

if (action === "start") {
  process.env.NODE_ENV = "development";
  require("../lib/scripts/start");
} else {
  process.env.NODE_ENV = "production";
  require("../lib/scripts/build");
}
