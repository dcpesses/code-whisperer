<div align="center">

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/dcpesses/vite-react-ts-gh/blob/main/license)
[![ci](https://github.com/dcpesses/vite-react-ts-gh/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/dcpesses/vite-react-ts-gh/actions)
[![codecov.io](https://codecov.io/gh/dcpesses/vite-react-ts-gh/coverage.svg?branch=main)](https://codecov.io/gh/dcpesses/vite-react-ts-gh?branch=master)

<!-- # React - TypeScript and GitHub Actions Template with Vite -->
# Vite, React, Redux and GitHub Actions

This a React 18 + Redux Toolkit + TypeScript + Vitest and React Testing Library + GitHub Actions starter template built with Vite.

[Demo](https://dcpesses.github.io/vite-react-ts-gh/)

![image](https://github.com/dcpesses/vite-react-ts-gh/assets/184237/8817ca34-77e2-4eaa-b220-b94c31a9ba6a)

Based on [pchmn/vite-react-ts-ghactions-template](https://github.com/pchmn/vite-react-ts-ghactions-template/)

</div>

## Features

Designed as a nifty React/Vite starter template with the following furnishings:

- Simple single page application - no routing required
- Compiles TypeScript yet also allows Javascript
  - Allows transitioning existing .js(x) files
- Linting for both TypeScript & Javascript
- Automatic precommit linting and git message validation
- Deployment to Github Pages on commit/PR merge to primary branch
  - Workflow includes Codecov integration for coverage analysis
  - Automatically writes date & time of deployment to HTML
- Demo playground of example apps, with 100% unit-test coverage
  - Simple counter app using React state
  - Advanced counter app using Redux Toolkit
    - Includes Async Thunks to emulate API calls
  - To-do CRUD app using Redux Toolkit

### Overview

- ⚡️&nbsp; [Vite 4](https://vitejs.dev/)
- ⚛️&nbsp; [React 18](https://beta.reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- 🗄️&nbsp; [Redux](https://redux.js.org/) with [Redux Toolkit](https://redux-toolkit.js.org/)
- 🧪&nbsp; [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- 🚀&nbsp; [GitHub Actions](https://docs.github.com/en/actions) with deployment on [GitHub Pages](https://pages.github.com/)

### Coding Style

- VSCode settings & extensions recommendations
- [EditorConfig](https://editorconfig.org/)
- [ESLint](https://eslint.org/) configured

### Git Hooks

- [Husky](https://typicode.github.io/husky/#/)
  - [`commitlint`](https://commitlint.js.org/) @ `commit-msg`
  - [`lint-staged`](https://github.com/okonet/lint-staged) @ `precommit`

### GitHub Actions

- **Build**, **Test** and **Coverage Analysis** (with [Codecov](https://about.codecov.io/)) at each commit
- **Deploy** to [GitHub Pages](https://pages.github.com/) on main branch (see deployment of this repo [here](https://dcpesses.github.io/vite-react-ts-gh/))


<br>

## Getting Started

### Copy template

```
npx degit dcpesses/vite-react-ts-gh app_name
```

### Usage

 Project built using `npm`. If you want to use `pnpm` or `yarn`, just don't forget to update GitHub Actions workflow (`.github/workflows/ci.yml`).

#### Install

```sh
npm i
```

#### Dev

```sh
npm start
```

#### Build


```sh
# normal build
npm run build

# build with 404.html file added for GitHub Pages
npm run build:ci
```
> See explanation of `404.html` file [here](#github-pages)
#### Test

```sh
# without coverage
npm run test

# with coverage
npm run test:ci

# watch for changes
npm run test:watch
```
#### Serve

```sh
npm run serve
```

<br>

## Configuration for GitHub Actions

In order to use GitHub Actions in your repo, you'll need to first make a few configuration updates.

The actual [workflow](https://github.com/dcpesses/vite-react-ts-gh/blob/main/.github/workflows/ci.yml) can be found under [/.github/workflows/ci.yml](.github/workflows/ci.yml)

![image](https://github.com/dcpesses/vite-react-ts-gh/assets/184237/182f4ad6-adab-4270-9d3c-d83538d272b0)

### Build & Test

> Run on any branch

Build and test react app.

### Coverage Analysis

> Run on any branch

Run [Codecov](https://about.codecov.io/) analysis.

**Configuration**: <br>
[Create a Codecov token](https://docs.codecov.com/docs/quick-start#step-2-get-the-repository-upload-token) for your repo and add it as a `CODECOV_TOKEN` secret in your repo under Secrets and variables > Actions > Repository secrets.

![image](https://github.com/dcpesses/vite-react-ts-gh/assets/184237/bb9f7da1-8d90-455e-b131-43577842cc5e)

### Deploy

> Run only on main branch (manual approve)

Deploy react app to GitHub Pages.

**Configuration**: <br>
- Replace `base` config in `vite.config.ts` to match your repo name
- Manual approve
  - If you want to keep it, you need to create a [new environment with manual approve](https://devblogs.microsoft.com/devops/i-need-manual-approvers-for-github-actions-and-i-got-them-now/) in your repo, and then replace `environment` config of `deploy` job in `.github/workflows/ci.yml`:
    - `environment.name` = name of the environment created in your repo
    - `environment.url` = link to your github pages
  - If your want to remove it, just delete the `environment` config section of the `deploy` job in `.github/workflows/ci.yml`

Don't forget to [setup your repo](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-from-a-branch) to deploy from your GitHub Pages branch. (Defaults to `gh-pages` unless `publish_branch` is specified in the `peaceiris/actions-gh-pages` config.)

## GitHub Pages

There are additional modifications on `index.html`, and a new `404.html` file in the project to make it work well with GitHub Pages.

> See https://github.com/rafgraph/spa-github-pages for more info.
