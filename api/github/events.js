const {
  getCommitsLastYear,
  getTopLanguages,
  getTopRepositories,
} = require("./api");

const padString = (str, width = 8) => {
  const length = str.length;
  const paddingLength = (width - (length % width)) % width;
  return str + " ".repeat(paddingLength);
};

const getCommitsLastYearEvents = async () => {
  const data = await getCommitsLastYear();

  return {
    events: [
      { type: "type", text: "$ " },
      { type: "type", text: "commits get --from=last-year\r\n" },
      { type: "wait", ms: 1000 },
      { type: "output", text: `${data}\r\n` },
      { type: "output", text: "$ " },
      { type: "type", text: "" },
      { type: "wait", ms: 8000 },
      { type: "clear" },
    ],
    rows: 4,
  };
};

const getTopLanguagesEvents = async (top = 10) => {
  const data = await getTopLanguages(top);

  return {
    events: [
      { type: "type", text: "$ " },
      { type: "type", text: `languages list | sort -hr | head -n ${top}\r\n` },
      { type: "wait", ms: 1000 },
      ...data.map((x) => ({
        type: "output",
        text: `${padString(`${x.percentage}%`)}${x.name}\r\n`,
      })),
      { type: "output", text: "$ " },
      { type: "type", text: "" },
      { type: "wait", ms: 8000 },
      { type: "clear" },
    ],
    rows: 13,
  };
};

const getTopRepositoriesEvents = async (top = 5) => {
  const data = await getTopRepositories(top);

  return {
    events: [
      { type: "type", text: "$ " },
      { type: "type", text: `repos list | sort -hr | head -n ${top}\r\n` },
      { type: "wait", ms: 1000 },
      ...data.map((x) => ({
        type: "output",
        text: `${padString(`${x.commits}`)}${x.name}\r\n`,
      })),
      { type: "output", text: "$ " },
      { type: "type", text: "" },
      { type: "wait", ms: 8000 },
      { type: "clear" },
    ],
    rows: 8,
  };
};

module.exports = {
  getCommitsLastYearEvents,
  getTopLanguagesEvents,
  getTopRepositoriesEvents,
};
