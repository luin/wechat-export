const shell = require("shelljs");
const mkdirp = require("mkdirp");
const map = require("p-map");
const path = require("path");
const fs = require("fs/promises");
const fse = require("fs-extra");
const generateHTMLFromJSON = require("./generateHTMLFromJSON");

const convertVoice = async (sourceDir, targetDir) => {
  new Promise((resolve) => {
    const silkSh = path.join(__dirname, "..", "silk", "converter.sh");
    shell.exec(
      `sh "${silkSh}" "${sourceDir}" "${targetDir}" mp3`,
      {
        async: true,
        silent: true,
      },
      () => resolve()
    );
  });
};

const TYPES = {
  10000: "system",
  10002: "system-complex",
  34: "voice",
  47: "emoji",
  62: "video",
  64: "other",
  3: "picture",
  48: "location",
  42: "contact",
  49: "link",
  1: "text",
};

const guessName = (messages) => {
  const message = messages.find(({ Type, Des }) => Type === 1 && !!Des);
  if (!message) return null;
  const text = message.Message.split(/[\r\n]/)[0];
  const match1 = text.match(/我是.+的([^，。,]+)/);
  if (match1) return match1[1];
  const match2 = text.match(/我是([^，。,]+)/);
  if (match2) return match2[1];
  const match6 = text.match(/I'm "([^，。,]+)"/);
  if (match6) return match6[1];
  const match4 = text.match(/I'm ([^，。,]+) from/);
  if (match4) return match4[1];
  const match5 = text.match(/已添加了(.+)，/);
  if (match5) return match5[1];
  const match3 = text.match(/([李王杨张赵孙刘高][^，。,]+)/);
  if (match3 && match3[1].indexOf("？" === -1) && match3[1].indexOf("?" === -1))
    return match3[1];
  return null;
};

const parseMessages = async (messages, input, output, messageId) => {
  const name = guessName(messages);
  const msgOutput = path.join(output, name || messageId);
  if (name && (await fse.pathExists(path.join(output, messageId)))) {
    await fse.rmdir(path.join(output, messageId));
  }
  await mkdirp(msgOutput);
  await mkdirp(path.join(msgOutput, "img"));
  await mkdirp(path.join(msgOutput, "video"));

  const sourceDir = path.join(input, "Audio", messageId);
  if (await fse.pathExists(sourceDir)) {
    const targetDir = path.join(msgOutput, "voice");
    await mkdirp(targetDir);
    await convertVoice(sourceDir, targetDir);
  }

  const parsed = await map(
    messages,
    async (message) => {
      const type = TYPES[message.Type] || "unkown";
      const data = {};

      const date = new Date(message.CreateTime * 1000);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      const dateStr = date.toISOString();
      const time = `${dateStr.slice(0, 10)} ${dateStr.slice(11, -5)}`;

      switch (type) {
        case "picture": {
          const sourceDir = path.join(input, "Img", messageId);
          const filename = `${message.MesLocalID}.jpg`;
          const imgTarget = path.join(msgOutput, "img", filename);
          try {
            await fs.copyFile(
              path.join(sourceDir, `${message.MesLocalID}.pic`),
              imgTarget
            );
          } catch (err) {
            try {
              await fs.copyFile(
                path.join(sourceDir, `${message.MesLocalID}.pic_thum`),
                imgTarget
              );
              data.original = false;
            } catch (err) {}
          }
          data.picture = `img/${filename}`;
          break;
        }
        case "video": {
          const sourceDir = path.join(input, "Video", messageId);
          const filename = `${message.MesLocalID}.mp4`;
          const videoTarget = path.join(msgOutput, "video", filename);
          try {
            await fs.copyFile(path.join(sourceDir, filename), videoTarget);
            data.video = `video/${filename}`;
          } catch (err) {
            try {
              await fs.copyFile(
                path.join(sourceDir, `${message.MesLocalID}.video_thum`),
                path.join(msgOutput, "video", `${message.MesLocalID}.jpg`)
              );
              data.thum = `video/${message.MesLocalID}.jpg`;
            } catch (err) {}
          }
          break;
        }
        case "voice": {
          try {
            const text = await fs.readFile(
              path.join(input, "Audio", messageId, `${message.MesLocalID}.txt`),
              "utf-8"
            );
            data.text = text;
          } catch (err) {}
          data.voice = `voice/${message.MesLocalID}.mp3`;
        }
        case "other": {
          const index = message.Message.indexOf("{");
          if (index >= 0) {
            try {
              data.content = JSON.parse(
                message.Message.slice(index)
              ).msgContent;
            } catch (err) {}
          }
        }
      }

      return { ...message, type, data, time };
    },
    { concurrency: 2 }
  );

  await fs.writeFile(
    path.join(msgOutput, "message.json"),
    JSON.stringify({ id: messageId, messages: parsed }, null, "  ")
  );

  await generateHTMLFromJSON(msgOutput);
};

module.exports = parseMessages;
