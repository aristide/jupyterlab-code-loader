#!/usr/bin/env python3
"""Build registry.json from all domain manifests.

Usage:
    python build_registry.py /path/to/repo [--repo-url URL]
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import yaml
except ImportError:
    yaml = None


def build_registry(repo_root: Path, repo_url: str = "") -> dict:
    domains_dir = repo_root / "domains"
    domain_list = []

    if not domains_dir.exists():
        return _make_registry(repo_url, domain_list)

    for domain_dir in sorted(domains_dir.iterdir()):
        if not domain_dir.is_dir() or domain_dir.name.startswith("."):
            continue

        manifest_path = domain_dir / "manifest.yaml"
        if not manifest_path.exists():
            print(f"  SKIP: {domain_dir.name}/ has no manifest.yaml")
            continue

        if yaml is None:
            print("  Error: pyyaml is required. Install with: pip install pyyaml")
            sys.exit(1)

        try:
            manifest = yaml.safe_load(manifest_path.read_text())
        except Exception as e:
            print(f"  SKIP: {domain_dir.name}/manifest.yaml parse error: {e}")
            continue

        if not isinstance(manifest, dict):
            print(f"  SKIP: {domain_dir.name}/manifest.yaml is not a mapping")
            continue

        code_items = manifest.get("code", []) or []
        snippet_files = manifest.get("snippet_files", []) or []

        notebook_count = sum(
            1 for item in code_items if item.get("type") == "notebook"
        )
        script_count = sum(
            1 for item in code_items if item.get("type") == "script"
        )

        domain_summary = {
            "id": manifest.get("id", domain_dir.name),
            "name": manifest.get("name", domain_dir.name),
            "description": manifest.get("description", ""),
            "tags": manifest.get("tags", []),
            "locales": manifest.get("locales", ["en"]),
            "notebook_count": notebook_count,
            "script_count": script_count,
            "snippet_count": len(snippet_files),
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }
        domain_list.append(domain_summary)
        print(
            f"  OK: {domain_dir.name} "
            f"({notebook_count} notebooks, {script_count} scripts, "
            f"{len(snippet_files)} snippet files)"
        )

    return _make_registry(repo_url, domain_list)


def _make_registry(repo_url: str, domains: list) -> dict:
    return {
        "version": "1.0.0",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "repo_url": repo_url,
        "domains": domains,
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build registry.json from domain manifests"
    )
    parser.add_argument("repo_root", help="Path to the repository root")
    parser.add_argument(
        "--repo-url",
        default="",
        help="Git repository URL to include in registry",
    )
    args = parser.parse_args()

    repo_root = Path(args.repo_root).resolve()
    if not repo_root.is_dir():
        print(f"Error: {repo_root} is not a directory")
        return 1

    print(f"Building registry for: {repo_root}\n")
    registry = build_registry(repo_root, args.repo_url)

    output_path = repo_root / "registry.json"
    output_path.write_text(json.dumps(registry, indent=2) + "\n")
    print(f"\nWrote {output_path} ({len(registry['domains'])} domains)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
