# jupyterlab-code-loader

Jupyterlab-code-loader is a self-contained JupyterLab extension that provides a left sidebar panel for browsing, searching, and using code examples (notebooks, Python scripts, R scripts) and reusable code snippets. All content is sourced from a single open Git repository and organized by domain.

## Requirements

- JupyterLab >= 4.0

## Install

To install the extension, execute:

```bash
# from git
pip install jupyterlab-code-loader
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyterlab-code-loader
```

## Configuration

The extension is configured via the setup form on first launch, but all settings can also be controlled through environment variables. Environment variables override values in the config file (`~/.jupyter/code-loader.json`).

### Environment variables

| Variable                    | Description                                                    | Default                     |
| --------------------------- | -------------------------------------------------------------- | --------------------------- |
| `CLOADER_REPO_URL`          | Git repository URL containing code examples and snippets       | _(empty)_                   |
| `CLOADER_BRANCH`            | Branch to track                                                | `main`                      |
| `CLOADER_CACHE_DIR`         | Local directory for the cloned repository                      | `~/.jupyter/examples-cache` |
| `CLOADER_REFRESH_INTERVAL`  | Cache refresh interval in seconds                              | `3600`                      |
| `CLOADER_WORKSPACE_DIR`     | Directory where code examples are copied to                    | `~/examples`                |
| `CLOADER_GIT_TOKEN`         | GitHub/GitLab personal access token for private repos          | _(empty)_                   |
| `CLOADER_DEFAULT_LOCALE`    | Default content language code                                  | `en`                        |
| `CLOADER_SUPPORTED_LOCALES` | Comma-separated list of supported locale codes                 | `en,fr`                     |
| `CLOADER_ALLOW_RESET`       | Show reset button in sidebar (`1`, `true`, or `yes` to enable) | _(disabled)_                |

### Example

```bash
export CLOADER_REPO_URL=https://github.com/myorg/examples-registry.git
export CLOADER_BRANCH=main
export CLOADER_SUPPORTED_LOCALES=en,fr,es
export CLOADER_ALLOW_RESET=true
jupyter lab
```

### Language detection

The extension automatically detects the content language from JupyterLab's active language setting. If the detected language is not in the `CLOADER_SUPPORTED_LOCALES` list, English (`en`) is used as the fallback.

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab-code-loader directory
# create a virtual environment
# install jupyterlab
pip install "jupyterlab>=4.0.0,<5"
# Install package in development mode
pip install -e "."
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall jupyterlab-code-loader
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `jupyterlab-code-loader` within that folder.

### Testing the extension

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

To execute them, execute:

```sh
jlpm
jlpm test
```

#### Integration tests

This extension uses [Playwright](https://playwright.dev/docs/intro/) for the integration tests (aka user level tests).
More precisely, the JupyterLab helper [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used to handle testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)

## Claude Code Skill: Content Manager

This repository includes a Claude Code skill (`cloader-content`) that helps populate and manage Git repositories consumed by the extension.

### What the skill does

- Scaffold new examples repositories with the correct structure
- Add domains, code examples (notebooks, scripts), and snippets
- Add translations for existing content
- Validate repository structure against the expected schema
- Regenerate the `registry.json` index

### Installing the skill

From the extension repository root, run:

```bash
# Using the Claude Code CLI
claude skill install skills/cloader-content
```

Or manually symlink it:

```bash
mkdir -p ~/.claude/skills
ln -s "$(pwd)/skills/cloader-content" ~/.claude/skills/cloader-content
```

### Usage

Once installed, the skill triggers automatically in Claude Code when you ask to manage code-loader content. Examples:

```
> Scaffold a new examples repository at ~/my-examples
> Add a "data-science" domain with a pandas intro notebook
> Add a Python snippet for reading CSV files to the data-science domain
> Validate the repository at ~/my-examples
> Rebuild the registry for ~/my-examples
```

### Updating the skill

When the extension repository is updated with a new version of the skill, pull the latest changes and re-install:

```bash
# Pull latest changes
git pull

# If installed via CLI, re-install to pick up changes
claude skill install skills/cloader-content

# If installed via symlink, no action needed — the symlink already points
# to the latest version in the repo
```

### Standalone scripts

The skill includes helper scripts that can be run directly:

```bash
# Validate repository structure
python skills/cloader-content/scripts/validate.py /path/to/repo

# Rebuild registry.json from manifests
python skills/cloader-content/scripts/build_registry.py /path/to/repo --repo-url https://github.com/org/repo
```
