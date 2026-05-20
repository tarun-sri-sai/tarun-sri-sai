const NodeCache = require('node-cache');

const API_URL = process.env.GITHUB_API_URL || 'https://api.github.com/graphql';
const API_VERSION = process.env.GITHUB_API_VERSION || '2022-11-28';

const cache = new NodeCache({ stdTTL: 604800 });

async function makeGraphQLRequest(query, variables, token) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': API_VERSION,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GitHub API error: ${data.errors.map(e => e.message).join(', ')}`);
  }

  return data.data;
}

async function _getRepositories(username, token, top = 100) {
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

  const data = await makeGraphQLRequest(query, { username }, token);
  return data.user.repositories.nodes.map(repo => repo.name);
}

async function _getCommitsLastYear(username, token) {
  try {
    const repos = await _getRepositories(username, token);
    
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
        const data = await makeGraphQLRequest(
          query,
          { owner: username, name: repo, since: sinceDate },
          token
        );

        if (data.repository?.defaultBranchRef?.target?.history) {
          totalCommits += data.repository.defaultBranchRef.target.history.totalCount;
        }
      } catch (error) {
        console.error(`error fetching commits for ${repo}:`, error.message);
      }
    }

    return totalCommits;
  } catch (error) {
    throw new Error(`failed to get commits: ${error.message}`);
  }
}

async function _getTopLanguages(username, token, top = 10) {
  try {
    const repos = await _getRepositories(username, token);

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
        const data = await makeGraphQLRequest(
          query,
          { owner: username, name: repo },
          token
        );

        if (data.repository?.languages) {
          totalSize += data.repository.languages.totalSize;
          
          data.repository.languages.edges.forEach(edge => {
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
        percentage: totalSize > 0 ? ((size / totalSize) * 100).toFixed(2) : 0
      }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 10);

    return languages;
  } catch (error) {
    throw new Error(`failed to get languages: ${error.message}`);
  }
}

async function _getTopRepositories(username, token) {
  try {
    const repos = await _getRepositories(username, token);
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
        const data = await makeGraphQLRequest(
          query,
          { owner: username, name: repo },
          token
        );

        const commitCount = data.repository?.defaultBranchRef?.target?.history?.totalCount || 0;
        repoStats.push({
          name: repo,
          commits: commitCount
        });
      } catch (error) {
        console.error(`error fetching commit count for ${repo}:`, error.message);
        repoStats.push({
          name: repo,
          commits: 0
        });
      }
    }

    return repoStats
      .sort((a, b) => b.commits - a.commits)
      .slice(0, 5);
  } catch (error) {
    throw new Error(`failed to get repositories: ${error.message}`);
  }
}

module.exports = {
  getCommitsLastYear: async (username, token, ...args) => {
    const cacheKey = `commits:${username}`;
    const cached = cache.get(cacheKey);
    if (cached !== undefined) return cached;
    
    const result = await _getCommitsLastYear(username, token, ...args);
    cache.set(cacheKey, result);
    return result;
  },
  
  getTopLanguages: async (username, token, top = 10) => {
    const cacheKey = `languages:${username}:${top}`;
    const cached = cache.get(cacheKey);
    if (cached !== undefined) return cached;
    
    const result = await _getTopLanguages(username, token, top);
    cache.set(cacheKey, result);
    return result;
  },
  
  getTopRepositories: async (username, token) => {
    const cacheKey = `topRepos:${username}`;
    const cached = cache.get(cacheKey);
    if (cached !== undefined) return cached;
    
    const result = await _getTopRepositories(username, token);
    cache.set(cacheKey, result);
    return result;
  },
  
  getRepositories: async (username, token, top = 100) => {
    const cacheKey = `repos:${username}:${top}`;
    const cached = cache.get(cacheKey);
    if (cached !== undefined) return cached;
    
    const result = await _getRepositories(username, token, top);
    cache.set(cacheKey, result);
    return result;
  }
};
