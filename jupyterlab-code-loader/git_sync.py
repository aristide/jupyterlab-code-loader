"""Git sync manager for cloning and pulling the examples repository."""

import logging
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from .config import Config

logger = logging.getLogger(__name__)


class GitSync:
    """Handles cloning and pulling the examples repository."""

    def __init__(self, config: Config):
        self.config = config
        self.last_sync: str | None = None
        self.last_commit: str | None = None

    def clone_or_pull(self) -> dict:
        """Clone the repo if not cached, otherwise pull latest changes."""
        cache = self.config.cache_dir
        url = self.config.repo_url_with_auth()
        branch = self.config.branch

        if not url:
            return {
                "action": "skipped",
                "error": "No repository URL configured",
            }

        try:
            if (cache / ".git").exists():
                result = subprocess.run(
                    ["git", "-C", str(cache), "pull", "--ff-only",
                     "origin", branch],
                    capture_output=True, text=True, timeout=60
                )
                action = "pulled"
            else:
                cache.parent.mkdir(parents=True, exist_ok=True)
                result = subprocess.run(
                    ["git", "clone", "--depth", "1", "--branch", branch,
                     url, str(cache)],
                    capture_output=True, text=True, timeout=60
                )
                action = "cloned"

            if result.returncode != 0:
                logger.warning(f"Git sync failed: {result.stderr}")
                return {
                    "action": action,
                    "error": result.stderr.strip(),
                }

            # Get current commit hash
            commit_result = subprocess.run(
                ["git", "-C", str(cache), "rev-parse", "--short", "HEAD"],
                capture_output=True, text=True
            )
            self.last_commit = commit_result.stdout.strip()
            self.last_sync = datetime.now(timezone.utc).isoformat()

            logger.info(f"Git sync: {action} ({self.last_commit})")
            return {
                "action": action,
                "commit": self.last_commit,
                "synced_at": self.last_sync,
            }

        except subprocess.TimeoutExpired:
            logger.error("Git sync timed out (60s)")
            return {"action": "error", "error": "Git operation timed out"}
        except FileNotFoundError:
            logger.error("Git is not installed or not in PATH")
            return {"action": "error", "error": "Git not found"}
        except Exception as e:
            logger.error(f"Git sync error: {e}")
            return {"action": "error", "error": str(e)}

    def status(self) -> dict:
        """Return current sync status."""
        return {
            "last_sync": self.last_sync,
            "last_commit": self.last_commit,
            "cache_dir": str(self.config.cache_dir),
            "repo_url": self.config.repo_url,
            "branch": self.config.branch,
            "cache_exists": self.config.cache_dir.exists(),
        }
