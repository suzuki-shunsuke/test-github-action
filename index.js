const core = require('@actions/core');
const github = require('@actions/github');

try {
  core.setOutput("targets", [{runs_on: 'ubuntu-latest', target: 'foo'}, {runs_on: 'ubuntu-18.04', target: 'bar'}]);
} catch (error) {
  core.setFailed(error.message);
}
