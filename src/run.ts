import * as core from '@actions/core';
import * as github from '@actions/github';

function getRepo(): string {
  const repo = core.getInput('repo');
  if (repo) {
    return repo;
  }
  if (!process.env.GITHUB_REPOSITORY) {
    throw "repo isn't set";
  }
  return process.env.GITHUB_REPOSITORY;
}

export const run = async (): Promise<void> => {
  const ghToken = core.getInput('github_token');
  const octokit = github.getOctokit(ghToken);
  const author = core.getInput('renovate_login');
  const skipLabels = core.getInput('skip_labels');
  const additionalQuery = core.getInput('additional_query');
  const createdBeforeMinutes = core.getInput('created_before_minutes');
  const now = new Date();
  const created = now.setTime(now.getTime() - parseInt(createdBeforeMinutes) * 60 * 1000);
  const repo = getRepo();
  // get pull requests
  const prs = await octokit.graphql(`
query {
  search(type: ISSUE, last: 100, query: "is:open is:pr author:${author} repo:${repo} -label:${skipLabels} created<=${created} ${additionalQuery}") {
    issueCount
    nodes {
      ... on PullRequest {
        number
        title
        url
      }
    }
  }
}`, {});
  core.info(JSON.stringify(prs));
}
