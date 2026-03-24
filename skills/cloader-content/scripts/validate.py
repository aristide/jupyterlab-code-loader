#!/usr/bin/env python3
"""Validate a code-loader examples repository structure.

Usage:
    python validate.py /path/to/repo
"""

import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    yaml = None

VALID_CODE_LANGS = {"python", "r", "julia"}
VALID_TYPES = {"notebook", "script"}
VALID_DIFFICULTIES = {"beginner", "intermediate", "advanced"}

REQUIRED_CODE_FIELDS = {"file", "title", "description", "type", "code_lang"}
REQUIRED_SNIPPET_FIELDS = {"id", "title", "code_lang", "lang", "code"}
REQUIRED_SNIPPET_FILE_FIELDS = {"id", "title", "lang", "snippets"}
REQUIRED_MANIFEST_FIELDS = {"id", "name", "description"}


def error(msg: str) -> str:
    return f"  ERROR: {msg}"


def warn(msg: str) -> str:
    return f"  WARN:  {msg}"


def validate_repo(repo_root: Path) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    # 1. Check registry.json
    registry_path = repo_root / "registry.json"
    if not registry_path.exists():
        errors.append(error("registry.json not found at repo root"))
    else:
        try:
            registry = json.loads(registry_path.read_text())
            if "domains" not in registry:
                errors.append(error("registry.json missing 'domains' array"))
            if "version" not in registry:
                warnings.append(warn("registry.json missing 'version' field"))
        except json.JSONDecodeError as e:
            errors.append(error(f"registry.json is not valid JSON: {e}"))

    # 2. Check domains
    domains_dir = repo_root / "domains"
    if not domains_dir.exists():
        warnings.append(warn("No domains/ directory found"))
        return errors, warnings

    for domain_dir in sorted(domains_dir.iterdir()):
        if not domain_dir.is_dir() or domain_dir.name.startswith("."):
            continue

        domain_id = domain_dir.name
        prefix = f"[{domain_id}]"

        # 2a. Check manifest.yaml
        manifest_path = domain_dir / "manifest.yaml"
        if not manifest_path.exists():
            errors.append(error(f"{prefix} manifest.yaml not found"))
            continue

        if yaml is None:
            # Fallback: just check it's readable text
            warnings.append(
                warn(f"{prefix} pyyaml not installed, skipping YAML validation")
            )
            continue

        try:
            manifest = yaml.safe_load(manifest_path.read_text())
        except Exception as e:
            errors.append(error(f"{prefix} manifest.yaml parse error: {e}"))
            continue

        if not isinstance(manifest, dict):
            errors.append(error(f"{prefix} manifest.yaml is not a mapping"))
            continue

        for field in REQUIRED_MANIFEST_FIELDS:
            if field not in manifest:
                errors.append(error(f"{prefix} manifest.yaml missing '{field}'"))

        # 2b. Validate code items
        code_items = manifest.get("code", [])
        if not isinstance(code_items, list):
            errors.append(error(f"{prefix} 'code' must be a list"))
            code_items = []

        en_code_dir = domain_dir / "code" / "en"

        for i, item in enumerate(code_items):
            item_label = f"{prefix} code[{i}]"
            if not isinstance(item, dict):
                errors.append(error(f"{item_label} is not a mapping"))
                continue

            for field in REQUIRED_CODE_FIELDS:
                if field not in item:
                    errors.append(error(f"{item_label} missing '{field}'"))

            if item.get("type") and item["type"] not in VALID_TYPES:
                errors.append(
                    error(f"{item_label} invalid type '{item['type']}'")
                )

            if item.get("code_lang") and item["code_lang"] not in VALID_CODE_LANGS:
                errors.append(
                    error(
                        f"{item_label} invalid code_lang '{item['code_lang']}'"
                    )
                )

            if (
                item.get("difficulty")
                and item["difficulty"] not in VALID_DIFFICULTIES
            ):
                warnings.append(
                    warn(
                        f"{item_label} invalid difficulty '{item['difficulty']}'"
                    )
                )

            # Check file exists in en/
            if item.get("file") and en_code_dir.exists():
                file_path = en_code_dir / item["file"]
                if not file_path.exists():
                    errors.append(
                        error(
                            f"{item_label} file '{item['file']}' not found in code/en/"
                        )
                    )

        # 2c. Validate snippet files
        snippet_files = manifest.get("snippet_files", [])
        if not isinstance(snippet_files, list):
            errors.append(error(f"{prefix} 'snippet_files' must be a list"))
            snippet_files = []

        en_snippets_dir = domain_dir / "snippets" / "en"

        for i, sf in enumerate(snippet_files):
            sf_label = f"{prefix} snippet_files[{i}]"
            if not isinstance(sf, dict):
                errors.append(error(f"{sf_label} is not a mapping"))
                continue

            if "file" not in sf:
                errors.append(error(f"{sf_label} missing 'file'"))
                continue
            if "title" not in sf:
                errors.append(error(f"{sf_label} missing 'title'"))

            # Check snippet JSON exists and is valid
            if en_snippets_dir.exists():
                snippet_path = en_snippets_dir / sf["file"]
                if not snippet_path.exists():
                    errors.append(
                        error(
                            f"{sf_label} file '{sf['file']}' not found in snippets/en/"
                        )
                    )
                else:
                    _validate_snippet_json(snippet_path, sf_label, errors, warnings)

        # 2d. Check locale consistency
        code_dir = domain_dir / "code"
        if code_dir.exists() and en_code_dir.exists():
            en_files = {f.name for f in en_code_dir.iterdir() if f.is_file()}
            for locale_dir in code_dir.iterdir():
                if (
                    not locale_dir.is_dir()
                    or locale_dir.name == "en"
                    or locale_dir.name.startswith(".")
                ):
                    continue
                locale_files = {
                    f.name for f in locale_dir.iterdir() if f.is_file()
                }
                extra = locale_files - en_files
                if extra:
                    warnings.append(
                        warn(
                            f"{prefix} code/{locale_dir.name}/ has files "
                            f"not in en/: {extra}"
                        )
                    )

    return errors, warnings


def _validate_snippet_json(
    path: Path,
    label: str,
    errors: list[str],
    warnings: list[str],
) -> None:
    try:
        data = json.loads(path.read_text())
    except json.JSONDecodeError as e:
        errors.append(error(f"{label} {path.name} invalid JSON: {e}"))
        return

    if not isinstance(data, dict):
        errors.append(error(f"{label} {path.name} root must be an object"))
        return

    for field in REQUIRED_SNIPPET_FILE_FIELDS:
        if field not in data:
            errors.append(error(f"{label} {path.name} missing '{field}'"))

    snippets = data.get("snippets", [])
    if not isinstance(snippets, list):
        errors.append(error(f"{label} {path.name} 'snippets' must be an array"))
        return

    for j, snippet in enumerate(snippets):
        s_label = f"{label} {path.name} snippets[{j}]"
        if not isinstance(snippet, dict):
            errors.append(error(f"{s_label} is not an object"))
            continue
        for field in REQUIRED_SNIPPET_FIELDS:
            if field not in snippet:
                errors.append(error(f"{s_label} missing '{field}'"))
        if (
            snippet.get("code_lang")
            and snippet["code_lang"] not in VALID_CODE_LANGS
        ):
            errors.append(
                error(
                    f"{s_label} invalid code_lang '{snippet['code_lang']}'"
                )
            )


def main() -> int:
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <repo_root>")
        return 1

    repo_root = Path(sys.argv[1]).resolve()
    if not repo_root.is_dir():
        print(f"Error: {repo_root} is not a directory")
        return 1

    print(f"Validating: {repo_root}\n")
    errors, warnings = validate_repo(repo_root)

    for w in warnings:
        print(w)
    for e in errors:
        print(e)

    print(f"\n{'=' * 40}")
    print(f"  Errors:   {len(errors)}")
    print(f"  Warnings: {len(warnings)}")

    if errors:
        print("\nValidation FAILED")
        return 1
    else:
        print("\nValidation PASSED")
        return 0


if __name__ == "__main__":
    sys.exit(main())
