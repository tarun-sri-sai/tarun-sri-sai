const {
  getCommitsLastYear,
  getTopLanguages,
  getTopRepositories,
} = require("./api");

const padString = (str, width = 8) => {
  const length = str.length;
  const paddingLength = (width - (length % width)) % width;
  return str + " ".repeat(paddingLength);
}

const getCommitsLastYearText = async () => {
  const data = await getCommitsLastYear();

  return ["$ commits get --from=last-year", `${data}`, "$ "];
};

const getTopLanguagesText = async (top = 10) => {
  const data = await getTopLanguages(top);

  return [
    `$ languages list | sort -hr | head -n ${top}`,
    ...data.map((x) => `${padString(`${x.percentage}%`)}${x.name}`),
    "$ ",
  ];
};

const getTopRepositoriesText = async (top = 5) => {
  const data = await getTopRepositories(top);

  return [
    `$ repos list | sort -hr | head -n ${top}`,
    ...data.map((x) => `${padString(`${x.commits}`)}${x.name}`),
    "$ ",
  ];
};

module.exports = {
  getCommitsLastYearText,
  getTopLanguagesText,
  getTopRepositoriesText,
};
