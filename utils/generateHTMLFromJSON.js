const _ = require("lodash");
const path = require("path");
const fss = require("fs");
const fs = require("fs/promises");
const fse = require("fs-extra");

const template = _.template(
  fss.readFileSync(path.join(__dirname, "template", "index.html"))
);

const generateHTMLFromJSON = async (input) => {
  const json = require(path.join(input, "message.json"));
  const html = template(json);
  await fse.copy(
    path.join(__dirname, "template", "assets"),
    path.join(input, "assets")
  );
  await fs.writeFile(path.join(input, "index.html"), html);
};

module.exports = generateHTMLFromJSON;
