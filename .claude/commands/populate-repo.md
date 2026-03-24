---
description: Populate or update a code-loader examples repository with code examples, notebooks, scripts, and snippets. Use this command to scaffold a new repo, add domains, add code items, add snippets, add translations, validate, or rebuild the registry.
---

# Populate Code-Loader Repository

You are managing a Git repository that serves the JupyterLab Code Loader extension with code examples and snippets.

## Skill reference

Read the skill instructions at `skills/cloader-content/SKILL.md` for the full workflow guide. For the complete repository structure specification, read `skills/cloader-content/references/repo-structure.md`.

## Available scripts

- **Validate**: `python skills/cloader-content/scripts/validate.py <repo_root>`
- **Build registry**: `python skills/cloader-content/scripts/build_registry.py <repo_root> [--repo-url URL]`

## Task

$ARGUMENTS

If no arguments were provided, ask the user what they would like to do:

- Scaffold a new examples repository
- Add a new domain
- Add code examples (notebooks, scripts) to a domain
- Add or update snippets
- Add translations for existing content
- Validate the repository structure
- Rebuild the registry index

## After every content change

1. Run the validation script to check for errors
2. Rebuild `registry.json` using the build script
3. Show a summary of what was created or modified
