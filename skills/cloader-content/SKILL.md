---
name: cloader-content
description: >
  Populate, update, and manage Git repositories that serve the JupyterLab Code Loader extension
  with code examples (notebooks, Python/R/Julia scripts) and reusable code snippets. Use this
  skill whenever someone wants to: scaffold a new examples repository, add a domain or code
  example, create or update snippets, add translations, validate repository structure, or
  regenerate the registry index. Trigger on phrases like "add a notebook", "create a new domain",
  "add snippets for pandas", "scaffold examples repo", "validate the repo", "build registry",
  or any mention of populating content for code-loader.
---

# Code Loader Content Manager

You manage Git repositories that feed the **JupyterLab Code Loader** extension. The extension
clones a repo and serves its content (code examples + snippets) in a sidebar panel, organized
by domain with multi-locale support.

## Before you start

Read `references/repo-structure.md` in this skill directory to understand the full repository
specification — directory layout, file formats, schemas, and naming conventions. That file is
your source of truth for every structural decision.

## Workflows

### 1. Scaffold a new repository

When the user wants to create a fresh examples repository:

1. Create the top-level structure:
   ```
   repo-root/
   ├── registry.json
   ├── domains/
   ├── snippets/
   │   └── en/
   ├── i18n/
   │   └── en.json
   └── meta/
       └── CONTRIBUTING.md
   ```
2. Generate `registry.json` with an empty domains array
3. Create `i18n/en.json` with all UI label keys (see reference)
4. Ask the user if they want to add a first domain

### 2. Add a new domain

When adding a domain (e.g., "geospatial", "data-science"):

1. Generate a URL-safe slug for the domain ID (lowercase, hyphens)
2. Create the directory structure:
   ```
   domains/{domain_id}/
   ├── manifest.yaml
   ├── code/
   │   └── en/
   └── snippets/
       └── en/
   ```
3. Write `manifest.yaml` with the domain metadata and empty `code:` and `snippet_files:` lists
4. Regenerate `registry.json` by running `scripts/build_registry.py`

### 3. Add a code example

When adding a notebook or script to a domain:

1. Determine the file type (`.ipynb`, `.py`, `.R`, `.jl`) and code language
2. Write the file to `domains/{domain_id}/code/en/{filename}`
   - For notebooks: create valid `.ipynb` JSON with appropriate kernel metadata
   - For scripts: write the script with a descriptive header comment
3. Update `domains/{domain_id}/manifest.yaml` — append to the `code:` list with all required
   fields: `file`, `title`, `description`, `type`, `code_lang`, and optional fields as appropriate
4. Regenerate `registry.json`
5. Run validation: `python scripts/validate.py {repo_root}`

When creating **notebook files**, always use this kernel metadata structure:

```json
{
  "metadata": {
    "kernelspec": {
      "display_name": "Python 3",
      "language": "python",
      "name": "python3"
    },
    "language_info": {
      "name": "python",
      "version": "3.12.0"
    }
  },
  "nbformat": 4,
  "nbformat_minor": 5,
  "cells": [...]
}
```

Adapt `kernelspec` for R (`ir`) or Julia (`julia-1.10`) as needed.

### 4. Add or update snippets

When adding snippets to a domain:

1. Decide if this belongs to an existing snippet file or a new one
2. Write or update the JSON file at `domains/{domain_id}/snippets/en/{filename}.json`
   following the snippet schema (see reference)
3. If it's a new file, add an entry to the `snippet_files:` list in `manifest.yaml`
4. Regenerate `registry.json`

Each snippet must have: `id`, `title`, `code_lang`, `lang`, `code`, `imports` (can be `[]`),
and `tags` (can be `[]`).

### 5. Add translations

When translating existing content to another locale:

1. Create the locale directory if needed: `domains/{domain_id}/code/{locale}/`
2. Copy and translate the file (same filename, different content language)
3. Update `manifest.yaml`:
   - Add the locale to the domain's `locales` list
   - Add `i18n.{locale}` entries for title/description on relevant code items
4. For snippets: create `domains/{domain_id}/snippets/{locale}/{filename}.json` with
   translated titles, descriptions, and `lang` field set to the locale code
5. Optionally create `i18n/{locale}.json` with translated UI labels

File names must match exactly between locales — the extension resolves per-file by name.

### 6. Validate the repository

Run the validation script to check for structural issues:

```bash
python {skill_dir}/scripts/validate.py {repo_root}
```

This checks:

- registry.json exists and is valid
- All manifest.yaml files have required fields and valid enums
- All code files referenced in manifests exist in en/
- Snippet JSON files have valid structure
- Locale filenames match en/ filenames
- Reports errors (blocking) and warnings (informational)

### 7. Build / regenerate registry

After any content change, regenerate the registry index:

```bash
python {skill_dir}/scripts/build_registry.py {repo_root} --repo-url https://github.com/org/repo
```

This scans all `domains/*/manifest.yaml`, counts items, and writes a fresh `registry.json`.

## Important conventions

- **English is canonical**: `en/` must contain every file. Other locales can be partial.
- **code_lang values**: Only `python`, `r`, or `julia`. No aliases.
- **type values**: Only `notebook` or `script`.
- **difficulty values**: Only `beginner`, `intermediate`, or `advanced`.
- **Domain IDs**: URL-safe slugs — lowercase alphanumeric with hyphens.
- **Snippet IDs**: URL-safe slugs — lowercase alphanumeric with underscores.
- **Always validate after changes** to catch structural issues early.
- **Always rebuild registry** after adding/removing domains or content.

## Cross-domain shared snippets

Snippets that aren't specific to one domain go in the top-level `snippets/` directory:

```
snippets/
├── en/
│   └── common_utils.json
└── fr/
    └── common_utils.json
```

These follow the same JSON schema as domain snippets.
