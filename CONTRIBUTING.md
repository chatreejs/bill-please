# Contributing to the Check Bill Enhanced

Thanks for taking the time to contribute ! You can start by reading our Contribution guidelines first.

## Contributing Guidelines

Check Bill Enhanced is an open-source project. If you want to contribute to the project, this section is here to guide you through your first steps with the Check Bill Enhanced team

### Setup your dev environment

Install [npm](https://www.npmjs.com/get-npm) and [Node.js](https://nodejs.org/en/download/) If you haven't

1. Fork and clone the [repository](https://github.com/chatreejs/check-bill-enhanced)
   ```bash
   git clone [fork_repo_url]
   ```
2. Add [upstream](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/configuring-a-remote-for-a-fork) remote. E.g.
   ```bash
   git remote add upstream git@github.com:chatreejs/check-bill-enhanced.git
   ```
3. Make sure you have the latest version of the default branch
   ```bash
   git checkout develop
   git pull upstream develop
   ```
4. Create your own branch and install dependencies
   ```bash
   git checkout -b [your_branch_name]
   npm install
   ```
5. Happy coding 🎉

### Coding rules

We try to maintain as much consistency as we can between each of our repository. Your pull request has more chances to be accepted if you follow the following rules, and write high quality code. **Let's get started** 💪

#### Some good practices

- Keep components as small and ["dumb"](https://en.wikipedia.org/wiki/Pure_function) as possible
- Keep in mind that your code will be read and maintained by several other developers. Make it as clear and easy to update as possible.

### Creating your pull request

Your code is ready to be submitted for review, congratulations🥳

- All pull requests **must** have a description of what the PR is trying to accomplish.
- Keep pull requests **as small as possible**. Larger pull requests should be broken up into smaller chunks with a dedicated base branch. Please tag the PR's that are merging into your base branch with the `epic` tag.
- If possible self-review your PR and **add comments** where additional clarification is needed.

> Create a [draft PR](https://github.blog/2019-02-14-introducing-draft-pull-requests/) as soon as possible so we can view your ongoing progress.

### Pull Request Title

Our Pull Request Title follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) using [commitlint](https://commitlint.js.org/#/).

_More at [Angular's guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#type)_

| Type     | Description                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| build    | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)         |
| ci       | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) |
| docs     | Documentation only changes                                                                                  |
| feat     | A new feature                                                                                               |
| fix      | A bug fix                                                                                                   |
| perf     | A code change that improves performance                                                                     |
| refactor | A code change that neither fixes a bug nor adds a feature                                                   |
| style    | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)      |
| test     | Adding missing tests or correcting existing tests                                                           |

**Thanks for helping us making Check Bill Enhanced even more awesome ❤**

## Issue Report

A bug is a _demonstrable problem_ that is caused by the code in the repository. Good bug reports are extremely helpful - thank you!

Guidelines for bug reports:

1. **Use the GitHub issue search** — check if the issue has already been reported.
2. **Check if the issue has been fixed** — try to reproduce it using the latest `main` or development branch in the repository.
3. **Isolate the problem** — create a [reduced test case](https://css-tricks.com/reduced-test-cases/) and a live example.
4. **Add attachments** — add photos or videos

A good bug report shouldn't leave others needing to chase you up for more information. Please try to be as detailed as possible in your report. What is your environment? What steps will reproduce the issue? What browser(s) and OS experience the problem? What would you expect to be the outcome? All these details will help people to fix any potential bugs.

Template:

```
**Environment:**
Device and OS:
Browser:
Reproducibility rate:

**Steps to reproduce:**
1.
2.
3.

**Expected result:**
```

A good bug report shouldn't leave others needing to chase you up for more.
