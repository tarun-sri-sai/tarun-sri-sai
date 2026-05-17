# Implementing the API to Get Reports of GitHub Stats

The folllowing reports must be provided by the API:

1. Number of commits in the last 365 days.
1. List of the top 10 languages by percentage of code.
1. List of the top 5 most committed repositories.

## Number of Commits in the Last 365 Days

1. Get the list of repos.
1. For each repo:
   1. Count the commits from the repo from the date 365 days ago.
1. Get the sum of the counts.

## List of the Top 10 Languages by Percentage of Code

1. Get the list of repos.
1. For each repo:
   1. Get the name and size of each language used.
1. Add up all the sizes by language name.
1. List the top 10 sizes.

## List of the Top 5 Most Committed Repositories

1. Get the list of repos.
1. For each repo:
   1. Count the commits from the repo.
1. List the top 5 counts.
