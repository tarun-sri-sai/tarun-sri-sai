const { cached } = require("./cache");

const API_URL = process.env.GITHUB_API_URL || "https://api.github.com/graphql";
const API_VERSION = process.env.GITHUB_API_VERSION || "2022-11-28";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const makeGraphQLRequest = async (query, variables) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": API_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const responseBody = await response.json();
  if (responseBody.errors) {
    const errors = JSON.stringify(responseBody.errors.map((e) => e.message));
    throw new Error(`github graphql error: ${errors}`);
  }

  return responseBody.data;
};

const getRepositories = async (username, top = 100) => {
  const query = `
    query($username: String!) {
      user(login: $username) {
        repositories(first: ${top}, affiliations: OWNER, visibility: PUBLIC) {
          nodes {
            name
          }
        }
      }
    }
  `;

  const data = await makeGraphQLRequest(query, { username });
  return data.user.repositories.nodes.map((repo) => repo.name);
};

const getCommitsLastYear = async (username) => {
  try {
    const repos = await cached(getRepositories)(username);

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 365);
    const sinceDate = fromDate.toISOString();

    let totalCommits = 0;

    for (const repo of repos) {
      const query = `
        query($owner: String!, $name: String!, $since: GitTimestamp!) {
          repository(owner: $owner, name: $name) {
            defaultBranchRef {
              target {
                ... on Commit {
                  history(since: $since) {
                    totalCount
                  }
                }
              }
            }
          }
        }
      `;

      try {
        const data = await makeGraphQLRequest(query, {
          owner: username,
          name: repo,
          since: sinceDate,
        });

        if (data.repository?.defaultBranchRef?.target?.history) {
          totalCommits +=
            data.repository.defaultBranchRef.target.history.totalCount;
        }
      } catch (error) {
        console.error(`error fetching commits for ${repo}:`, error.message);
      }
    }

    return totalCommits;
  } catch (error) {
    throw new Error(`failed to get commits: ${error.message}`);
  }
};

const getTopLanguages = async (username, top = 10) => {
  try {
    const repos = await cached(getRepositories)(username);

    const languageStats = {};
    let totalSize = 0;

    for (const repo of repos) {
      const query = `
        query($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            languages(first: ${top}, orderBy: {field: SIZE, direction: DESC}) {
              totalSize
              edges {
                size
                node {
                  name
                }
              }
            }
          }
        }
      `;

      try {
        const data = await makeGraphQLRequest(query, {
          owner: username,
          name: repo,
        });

        if (data.repository?.languages) {
          totalSize += data.repository.languages.totalSize;

          data.repository.languages.edges.forEach((edge) => {
            const language = edge.node.name;
            const size = edge.size;

            if (!languageStats[language]) {
              languageStats[language] = 0;
            }
            languageStats[language] += size;
          });
        }
      } catch (error) {
        console.error(`error fetching languages for ${repo}:`, error.message);
      }
    }

    const languages = Object.entries(languageStats)
      .map(([name, size]) => ({
        name,
        bytes: size,
        percentage: totalSize > 0 ? ((size / totalSize) * 100).toFixed(2) : 0,
      }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 10);

    return languages;
  } catch (error) {
    throw new Error(`failed to get languages: ${error.message}`);
  }
};

const getTopRepositories = async (username) => {
  try {
    const repos = await cached(getRepositories)(username);

    const repoStats = [];
    for (const repo of repos) {
      const query = `
        query($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            defaultBranchRef {
              target {
                ... on Commit {
                  history {
                    totalCount
                  }
                }
              }
            }
          }
        }
      `;

      try {
        const data = await makeGraphQLRequest(query, {
          owner: username,
          name: repo,
        });

        const commitCount =
          data.repository?.defaultBranchRef?.target?.history?.totalCount || 0;
        repoStats.push({
          name: repo,
          commits: commitCount,
        });
      } catch (error) {
        console.error(
          `error fetching commit count for ${repo}:`,
          error.message,
        );
        repoStats.push({
          name: repo,
          commits: 0,
        });
      }
    }

    return repoStats.sort((a, b) => b.commits - a.commits).slice(0, 5);
  } catch (error) {
    throw new Error(`failed to get repositories: ${error.message}`);
  }
};

module.exports = {
  getCommitsLastYear: cached(getCommitsLastYear),

  getTopLanguages: cached(getTopLanguages),

  getTopRepositories: cached(getTopRepositories),
};
