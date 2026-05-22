const {
  getCommitsLastYear,
  getTopLanguages,
  getTopRepositories,
} = require("./api");

const getCommitsLastYearText = async () => {
  const data = await getCommitsLastYear();

  return ["$ commits get --from=last-year", `${data}`, "$ "];
};

const getTopLanguagesText = async (top = 10) => {
  const data = await getTopLanguages(top);

  return [
    `$ languages list | sort -hr | head -n ${top}`,
    ...data.map((x) => `${x.percentage}%\t${x.name}`),
    "$ ",
  ];
};

const getTopRepositoriesText = async (top = 5) => {
  const data = await getTopRepositories(top);

  return [
    `$ repos list | sort -hr | head -n ${top}`,
    ...data.map((x) => `${x.commits}\t${x.name}`),
    "$ ",
  ];
};

module.exports = {
  getCommitsLastYearText,
  getTopLanguagesText,
  getTopRepositoriesText,
};
