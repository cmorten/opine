# Contributing to this repository

First of all, thanks for taking the time to read this document and contributing to our codebase.

Please read each section carefully!

## Contents

<!-- toc -->

- [Getting started](#getting-started)
- [Working on your feature](#working-on-your-feature)
  - [Branching](#branching)
  - [Coding style](#coding-style)
  - [Unit tests](#unit-tests)
- [Opening a PR](#opening-a-pr)
- [Merging and publishing](#merging-and-publishing)

<!-- tocstop -->

## Getting started

The first thing to do before starting to work on your feature would be to have a conversation with the codeowners about it, we may have some pointers or examples that might make your life much easier!

The other thing you will need before you start is to create an issue describing what it is that you're set to do, or if its a bug make sure there are clear reproduction steps on the description.

Things to talk about in our first conversation:

- Planned implementation
- Test plan
- Q&A

## Working on your feature

### Branching

On this project we follow mainline development (or trunk based development), and our default branch is `master`.

Therefore you need to branch from `master` and merge into `master`.

We use the following convention for branch names `feature/short-description`, where short description is to have an idea what the branch is about and the `feature` part is for features, but it can vary on other kinds of issues.

Here are some examples:

- `feature/new-icon`, a new feature.
- `fix/windows-bug`, a bug fix
- `chore/upgrade-eslint`, a chore is something that doesn't add functionality to the user but needs to be done.

### Coding style

Generally try to match the style and conventions of the code around your changes. Ultimately we want code that is clear, concise, consistent and easy to read.

Broadly we're in-tune with the following style guides:

- JavaScript
  - <https://github.com/prettier/prettier>
  - <https://github.com/airbnb/javascript>
  - <https://github.com/ryanmcdermott/clean-code-javascript>

### Unit tests

Before opening a PR, please run the following command to make sure your branch will build and pass all the tests:

```console
make test
```

### Documentation

Before opening a PR, please run the following command to make sure your branch will being fully documented:

```console
make typedoc
```

## Opening a PR

Once you're confident your branch is ready to review, open a PR against `master` on this repo.

Please make sure you fill the PR template correctly.

## Merging and publishing

When your feature branch/PR has been tested and has an approval, it is then ready to merge. Please contact the maintainer to action the merge.
