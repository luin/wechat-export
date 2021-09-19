const map = require("p-map");
const Knex = require("knex");
const parseMessages = require("./parseMessages");

const preview = (messages) => {
  const message = messages.find(({ Type }) => Type === 1);
  return message ? message.Message.replace(/[\r\n]/g, " ") : "[Empty]";
};

const parseDatabase = async (filename, input, output) => {
  const knex = Knex({
    client: "sqlite3",
    connection: { filename },
    useNullAsDefault: true,
  });

  const names = (await knex("sqlite_master").distinct("tbl_name"))
    .map(({ tbl_name }) => tbl_name)
    .filter((name) => name.startsWith("Chat_"));

  await map(
    names,
    async (name) => {
      const messages = await knex(name).orderBy("CreateTime");
      await parseMessages(messages, input, output, name.replace("Chat_", ""));
      console.log(`Done ${name}: ` + preview(messages));
    },
    { concurrency: 5 }
  );
};

module.exports = parseDatabase;
