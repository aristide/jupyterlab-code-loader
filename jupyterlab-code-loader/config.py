"""Configuration management for jupyterlab-code-loader.

Resolution order: config file → environment variables → defaults.
If environment variables are set at startup, they are persisted to the config file.
"""

import json
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

CONFIG_FILE_PATH = Path.home() / ".jupyter" / "code-loader.json"

DEFAULTS = {
    "repo_url": "",
    "branch": "main",
    "cache_dir": str(Path.home() / ".jupyter" / "examples-cache"),
    "refresh_interval": 3600,
    "workspace_dir": str(Path.home() / "examples"),
    "git_token": "",
    "default_locale": "en",
}

ENV_MAP = {
    "CLOADER_REPO_URL": "repo_url",
    "CLOADER_BRANCH": "branch",
    "CLOADER_CACHE_DIR": "cache_dir",
    "CLOADER_REFRESH_INTERVAL": "refresh_interval",
    "CLOADER_WORKSPACE_DIR": "workspace_dir",
    "CLOADER_GIT_TOKEN": "git_token",
    "CLOADER_DEFAULT_LOCALE": "default_locale",
}


class Config:
    """Extension configuration with file + env var resolution."""

    def __init__(self):
        self.repo_url: str = DEFAULTS["repo_url"]
        self.branch: str = DEFAULTS["branch"]
        self.cache_dir: Path = Path(DEFAULTS["cache_dir"])
        self.refresh_interval: int = DEFAULTS["refresh_interval"]
        self.workspace_dir: Path = Path(DEFAULTS["workspace_dir"])
        self.git_token: str = DEFAULTS["git_token"]
        self.default_locale: str = DEFAULTS["default_locale"]

    @classmethod
    def load(cls) -> "Config":
        """Load config: file → env vars → defaults. Persist if env vars set."""
        config = cls()

        # Step 1: Load from config file
        file_data = _read_config_file()
        if file_data:
            _apply_dict(config, file_data)

        # Step 2: Override with environment variables
        env_overrides = _read_env_vars()
        if env_overrides:
            _apply_dict(config, env_overrides)
            # Persist merged config back to file
            config.save()

        return config

    def save(self):
        """Persist current config to ~/.jupyter/code-loader.json."""
        data = {
            "repo_url": self.repo_url,
            "branch": self.branch,
            "cache_dir": str(self.cache_dir),
            "refresh_interval": self.refresh_interval,
            "workspace_dir": str(self.workspace_dir),
            "git_token": self.git_token,
            "default_locale": self.default_locale,
        }
        try:
            CONFIG_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
            CONFIG_FILE_PATH.write_text(json.dumps(data, indent=2))
            logger.info(f"Config saved to {CONFIG_FILE_PATH}")
        except Exception as e:
            logger.warning(f"Failed to save config: {e}")

    @classmethod
    def reset(cls) -> "Config":
        """Delete config file and reload from env vars / defaults."""
        try:
            if CONFIG_FILE_PATH.exists():
                CONFIG_FILE_PATH.unlink()
                logger.info(f"Config file deleted: {CONFIG_FILE_PATH}")
        except Exception as e:
            logger.warning(f"Failed to delete config file: {e}")
        return cls.load()

    def to_dict(self) -> dict:
        """Return config as a dictionary (excluding sensitive git_token)."""
        return {
            "repo_url": self.repo_url,
            "branch": self.branch,
            "cache_dir": str(self.cache_dir),
            "refresh_interval": self.refresh_interval,
            "workspace_dir": str(self.workspace_dir),
            "default_locale": self.default_locale,
            "has_token": bool(self.git_token),
            "is_configured": bool(self.repo_url),
            "allow_reset": _read_allow_reset(),
            "supported_locales": _read_supported_locales(),
        }

    def repo_url_with_auth(self) -> str:
        """Return repo URL with token injected for HTTPS GitHub/GitLab URLs."""
        if self.git_token and "https://" in self.repo_url:
            return self.repo_url.replace(
                "https://", f"https://{self.git_token}@"
            )
        return self.repo_url


def _read_config_file() -> dict:
    """Read config from file, return empty dict if missing or invalid."""
    if not CONFIG_FILE_PATH.exists():
        return {}
    try:
        return json.loads(CONFIG_FILE_PATH.read_text())
    except Exception as e:
        logger.warning(f"Failed to read config file: {e}")
        return {}


def _read_env_vars() -> dict:
    """Read CLOADER_* environment variables, return only those that are set."""
    overrides = {}
    for env_key, config_key in ENV_MAP.items():
        value = os.environ.get(env_key)
        if value is not None:
            if config_key == "refresh_interval":
                try:
                    overrides[config_key] = int(value)
                except ValueError:
                    logger.warning(f"Invalid integer for {env_key}: {value}")
            else:
                overrides[config_key] = value
    return overrides


def _apply_dict(config: Config, data: dict):
    """Apply a dictionary of values to a Config instance."""
    if "repo_url" in data:
        config.repo_url = data["repo_url"]
    if "branch" in data:
        config.branch = data["branch"]
    if "cache_dir" in data:
        config.cache_dir = Path(data["cache_dir"]).expanduser()
    if "refresh_interval" in data:
        config.refresh_interval = int(data["refresh_interval"])
    if "workspace_dir" in data:
        config.workspace_dir = Path(data["workspace_dir"]).expanduser()
    if "git_token" in data:
        config.git_token = data["git_token"]
    if "default_locale" in data:
        config.default_locale = data["default_locale"]


def _read_allow_reset() -> bool:
    """Read CLOADER_ALLOW_RESET env var. Truthy values: 1, true, yes."""
    value = os.environ.get("CLOADER_ALLOW_RESET", "").strip().lower()
    return value in ("1", "true", "yes")


def _read_supported_locales() -> list:
    """Read CLOADER_SUPPORTED_LOCALES env var. Default: en,fr."""
    raw = os.environ.get("CLOADER_SUPPORTED_LOCALES", "en,fr")
    return [loc.strip() for loc in raw.split(",") if loc.strip()]
