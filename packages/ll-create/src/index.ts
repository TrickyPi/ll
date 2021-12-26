import { Command } from "commander";
const program = new Command();

program
  .command("create")
  .description("create react-ts or react-js template")
  .argument("<type>", "type")
  .argument("<destination>", "destination")
  .action(async (type, destination) => {
    const { default: create } = await import("./scripts/create");
    create({ type, destination });
  });

program.parse(process.argv);

