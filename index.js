const core = require('@actions/core');
const github = require('@actions/github');

try {
  core.setOutput("targets", [
    {
      runs_on: 'ubuntu-latest',
      target: 'foo',
      envs: {
        'YOO': 'FOO',
      },
    }, {
      runs_on: 'ubuntu-18.04',
      target: 'bar',
      envs: {
        'YOO': 'BAR',
      },
    }]);
} catch (error) {
  core.setFailed(error.message);
}
