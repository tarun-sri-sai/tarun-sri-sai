const express = require('express');
const {
  getCommitsLastYear,
  getTopLanguages,
  getTopRepositories
} = require('./github');

const app = express();

app.use(express.json());

const PORT = process.env.PORT;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = process.env.GITHUB_USERNAME;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/commits-last-year', async (req, res) => {
  try {
    const commits = await getCommitsLastYear(USERNAME, GITHUB_TOKEN);
    res.json({ commits, username: USERNAME });
  } catch (error) {
    console.error('error fetching commits:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/top-languages', async (req, res) => {
  try {
    const languages = await getTopLanguages(USERNAME, GITHUB_TOKEN);
    res.json({ languages, username: USERNAME });
  } catch (error) {
    console.error('error fetching languages:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/top-repos', async (req, res) => {
  try {
    const repos = await getTopRepositories(USERNAME, GITHUB_TOKEN);
    res.json({ repos, username: USERNAME });
  } catch (error) {
    console.error('error fetching repositories:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'GitHub Stats API',
    endpoints: {
      health: '/api/health',
      commits: '/api/commits-last-year',
      languages: '/api/top-languages',
      repositories: '/api/top-repos'
    }
  });
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

module.exports = app;
