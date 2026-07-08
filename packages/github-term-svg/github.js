import { cached } from "@tarun-sri-sai/function-cache";

const API_URL = "https://api.github.com/graphql";
const API_VERSION = "2022-11-28";
const API_KEY = process.env.API_GITHUB_GITHUB_TOKEN;
const USERNAME = process.env.API_GITHUB_GITHUB_USERNAME;

const isAuthenticated = !!API_KEY;

const makeGraphQLRequest = async (query, variables) => {
  const headers = isAuthenticated
    ? {
        Authorization: `Bearer ${API_KEY}`,
        "X-GitHub-Api-Version": API_VERSION,
        "Content-Type": "application/json",
      }
    : {
        "X-GitHub-Api-Version": API_VERSION,
        "Content-Type": "application/json",
      };
  const response = await fetch(API_URL, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ query, variables }),
  });

  const responseBody = await response.json();
  if (!response.ok || responseBody.message) {
    throw new Error(responseBody.message || `http ${response.status}`);
  }
  if (responseBody.errors) {
    const errors = JSON.stringify(responseBody.errors.map((e) => e.message));
    throw new Error(`github graphql error: ${errors}`);
  }

  return responseBody.data;
};

const getRepositories = async (top = 100) => {
  const affiliation = isAuthenticated ? ", affiliations: OWNER" : "";
  const query = `
    query($username: String!) {
      user(login: $username) {
        repositories(first: ${top}${affiliation}, visibility: PUBLIC) {
          nodes {
            name
          }
        }
      }
    }
  `;

  const data = await makeGraphQLRequest(query, { username: USERNAME });
  return data.user.repositories.nodes.map((repo) => repo.name);
};

const getRepositoriesCached = cached(getRepositories);

const getCommitsLastYear = async () => {
  try {
    const repos = await getRepositoriesCached();

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
          owner: USERNAME,
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

export const getCommitsLastYearCached = cached(getCommitsLastYear);

const getTopLanguages = async (top = 10) => {
  try {
    const repos = await getRepositoriesCached();

    const languageStats = {};
    let totalSize = 0;

    for (const repo of repos) {
      const query = `
        query($owner: String!, $name: String!, $top: Int!) {
          repository(owner: $owner, name: $name) {
            languages(first: $top, orderBy: {field: SIZE, direction: DESC}) {
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
          owner: USERNAME,
          name: repo,
          top,
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
      .slice(0, top);

    return languages;
  } catch (error) {
    throw new Error(`failed to get languages: ${error.message}`);
  }
};

export const getTopLanguagesCached = cached(getTopLanguages);

const getTopRepositories = async (top = 5) => {
  try {
    const repos = await getRepositoriesCached();

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
          owner: USERNAME,
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

    return repoStats.sort((a, b) => b.commits - a.commits).slice(0, top);
  } catch (error) {
    throw new Error(`failed to get repositories: ${error.message}`);
  }
};

export const getTopRepositoriesCached = cached(getTopRepositories);
