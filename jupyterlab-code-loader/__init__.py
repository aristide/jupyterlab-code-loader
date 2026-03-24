"""JupyterLab Code Loader - server extension entry point."""

try:
    from ._version import __version__
except ImportError:
    __version__ = "dev"

from .config import Config
from .git_sync import GitSync
from .handlers import setup_handlers
from .locale_resolver import LocaleResolver


def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": "jupyterlab-code-loader"
    }]


def _jupyter_server_extension_points():
    return [{
        "module": "jupyterlab-code-loader"
    }]


def _load_jupyter_server_extension(server_app):
    """Register handlers and perform initial git sync."""
    # Load configuration (file → env vars → defaults)
    config = Config.load()
    git_sync = GitSync(config)
    locale_resolver = LocaleResolver(config)

    # Store in web_app settings for handler access
    server_app.web_app.settings["code_loader_config"] = config
    server_app.web_app.settings["code_loader_git_sync"] = git_sync
    server_app.web_app.settings["code_loader_locale_resolver"] = locale_resolver

    # Register REST API handlers
    setup_handlers(server_app.web_app)

    # Initial sync if repo URL is configured
    if config.repo_url:
        try:
            git_sync.clone_or_pull()
            server_app.log.info("jupyterlab-code-loader: repository synced")
        except Exception as e:
            server_app.log.warning(
                f"jupyterlab-code-loader: initial sync failed: {e}"
            )
    else:
        server_app.log.info(
            "jupyterlab-code-loader: no repository URL configured, "
            "sidebar will show setup form"
        )

    server_app.log.info("Registered jupyterlab-code-loader server extension")
