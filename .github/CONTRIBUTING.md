# Contributing to this repository

First of all, thanks for taking the time to read this document and contributing to our codebase! :tada:

Please read each section carefully.

## Getting started

The first thing to do before starting to work on your feature would be to have a conversation with the codeowners about it, we may have some pointers or examples that might make your life much easier!

The other thing you will need before you start is to create an issue describing what it is that you're set to do, or if its a bug make sure there are clear reproduction steps on the description.

Things to talk about in our first conversation:

- Planned implementation
- Test plan

Be sure to check for existing issues before raising your own!

## Working on your feature

### Branching

On this project we follow mainline development (or trunk based development), and our default branch is `main`.

Therefore you need to branch from `main` and merge into `main`.

We use the following convention for branch names `feat/issue-#-short-description`, where the the `#` should be replaced with the GitHub issue number, and the short description should provide an idea of what the branch is for.

Here are some examples:

- `feat/issue-137-new-icon`, a new feature.
- `fix/issue-239-windows-bug`, a bug fix.
- `chore/issue-95-improve-docs`, a chore is something that doesn't add functionality to the user but needs to be done.

### Coding style

Generally try to match the style and conventions of the code around your changes. Ultimately we want code that is clear, concise, consistent and easy to read.

Broadly we're in-tune with the following style guides:

- <https://github.com/prettier/prettier>
- <https://github.com/airbnb/javascript>
- <https://github.com/ryanmcdermott/clean-code-javascript>

As this is a Deno project will also insist on meeting the Deno `fmt` standards.

### Format Code

To format the code run:

```bash
make fmt
```

To ensure that your code is properly formatted run:

```bash
make lint
```

### Tests

Before opening a PR, please run the following command to make sure your branch will build and pass all the tests:

```console
make test
```

If your change will impact server performance, you can use:

```bash
make benchmark
```

to get a benchmark report for your changes.

### Documentation

Before opening a PR, please delete your `./docs` directory and run the following command to make sure your branch will being fully documented:

```console
make typedoc
```

Please also ensure that the `./docs/_config.yaml` is re-instated.

### Run Tests

```bash
make test
```

## Opening a PR

Once you're confident your branch is ready to review, open a PR against `main` on this repo.

Please make sure you fill the PR template correctly.

## Merging and publishing

When your feature branch/PR has been tested and has an approval, it is then ready to merge. Please contact the maintainer to action the merge.
