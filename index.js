const map = require("p-map");
const glob = require("glob");
const parseDatabase = require("./utils/parseDatabase");

async function main() {
  const args = process.argv.slice(2);
  const [input, output] = args;
  const files = glob.sync("DB/message_*.sqlite", {
    cwd: input,
    absolute: true,
  });
  console.log(`✅ Got ${files.length} message files`);

  await map(
    files,
    async (file) => {
      await parseDatabase(file, input, output);
    },
    { concurrency: 1 }
  );
  process.exit(0);
}

main();
