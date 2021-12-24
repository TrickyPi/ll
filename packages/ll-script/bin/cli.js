#!/usr/bin/env node
const params = process.argv.slice(2);
const [action] = params;

if (action === "start") {
  require("../lib/scripts/start");
} else {
  require("../lib/scripts/build");
}
