"""REST API handlers for jupyterlab-code-loader."""

import json
import shutil
from pathlib import Path

import yaml
from jupyter_server.base.handlers import APIHandler

from .config import Config
from .git_sync import GitSync
from .locale_resolver import LocaleResolver


def _get_locale(handler) -> str:
    config = handler.settings["code_loader_config"]
    return handler.get_argument("locale", config.default_locale)


def _localize_item(item: dict, locale: str) -> dict:
    """Apply i18n overrides to title/description."""
    i18n = item.get("i18n", {})
    item = {**item}
    if locale in i18n:
        tr = i18n[locale]
        if "title" in tr:
            item["title"] = tr["title"]
        if "description" in tr:
            item["description"] = tr["description"]
        item["_content_lang"] = locale
        item["_is_translated"] = True
    else:
        item["_content_lang"] = "en"
        item["_is_translated"] = False
    return item


class RegistryHandler(APIHandler):
    """GET /api/examples/registry"""

    def get(self):
        config: Config = self.settings["code_loader_config"]
        sync: GitSync = self.settings["code_loader_git_sync"]

        registry = config.cache_dir / "registry.json"
        if not registry.exists():
            result = sync.clone_or_pull()
            if "error" in result:
                self.set_status(503)
                return self.finish(json.dumps({"error": result["error"]}))

        if registry.exists():
            self.finish(registry.read_text())
        else:
            self.set_status(503)
            self.finish(json.dumps({"error": "Registry not available"}))


class DomainHandler(APIHandler):
    """GET /api/examples/domains/{domain_id}"""

    def get(self, domain_id):
        config: Config = self.settings["code_loader_config"]
        manifest = config.cache_dir / "domains" / domain_id / "manifest.yaml"
        if not manifest.exists():
            self.set_status(404)
            return self.finish(json.dumps({"error": "Domain not found"}))

        data = yaml.safe_load(manifest.read_text())
        self.finish(json.dumps(data))


class CodeListHandler(APIHandler):
    """GET /api/examples/domains/{domain_id}/code?locale=fr"""

    def get(self, domain_id):
        config: Config = self.settings["code_loader_config"]
        resolver: LocaleResolver = self.settings["code_loader_locale_resolver"]
        locale = _get_locale(self)

        manifest = config.cache_dir / "domains" / domain_id / "manifest.yaml"
        if not manifest.exists():
            self.set_status(404)
            return self.finish(json.dumps({"error": "Domain not found"}))

        data = yaml.safe_load(manifest.read_text())
        items = []
        for item in data.get("code", []):
            loc = _localize_item(item, locale)
            path, resolved, is_tr = resolver.resolve_file(
                domain_id, "code", item["file"], locale
            )
            loc["_resolved_locale"] = resolved
            loc["_file_translated"] = is_tr
            loc["_tags_display"] = {
                "content_lang": resolved,
                "code_lang": item.get("code_lang", "python"),
            }
            items.append(loc)

        self.finish(json.dumps({
            "domain_id": domain_id,
            "locale": locale,
            "available_locales": resolver.list_available_locales(
                domain_id, "code"),
            "items": items,
        }))


class SnippetListHandler(APIHandler):
    """GET /api/examples/domains/{domain_id}/snippets?locale=fr"""

    def get(self, domain_id):
        config: Config = self.settings["code_loader_config"]
        resolver: LocaleResolver = self.settings["code_loader_locale_resolver"]
        locale = _get_locale(self)

        manifest = config.cache_dir / "domains" / domain_id / "manifest.yaml"
        if not manifest.exists():
            self.set_status(404)
            return self.finish(json.dumps({"error": "Domain not found"}))

        data = yaml.safe_load(manifest.read_text())
        snippets = []
        for sf in data.get("snippet_files", []):
            path, resolved, is_tr = resolver.resolve_file(
                domain_id, "snippets", sf["file"], locale
            )
            if path.exists():
                sd = json.loads(path.read_text())
                sd["_resolved_locale"] = resolved
                sd["_is_translated"] = is_tr
                localized_sf = _localize_item(sf, locale)
                sd["_display_title"] = localized_sf["title"]
                snippets.append(sd)

        self.finish(json.dumps({
            "domain_id": domain_id,
            "locale": locale,
            "available_locales": resolver.list_available_locales(
                domain_id, "snippets"),
            "items": snippets,
        }))


class SharedSnippetsHandler(APIHandler):
    """GET /api/examples/snippets?locale=xx — cross-domain shared snippets"""

    def get(self):
        config: Config = self.settings["code_loader_config"]
        resolver: LocaleResolver = self.settings["code_loader_locale_resolver"]
        locale = _get_locale(self)

        snippets_dir = config.cache_dir / "snippets"
        if not snippets_dir.exists():
            return self.finish(json.dumps({"locale": locale, "items": []}))

        # Resolve shared snippets using the same locale fallback
        items = []
        en_dir = snippets_dir / "en"
        if en_dir.exists():
            for f in sorted(en_dir.glob("*.json")):
                # Try locale version first
                locale_file = snippets_dir / locale / f.name
                if locale_file.exists():
                    sd = json.loads(locale_file.read_text())
                    sd["_resolved_locale"] = locale
                    sd["_is_translated"] = locale != "en"
                else:
                    sd = json.loads(f.read_text())
                    sd["_resolved_locale"] = "en"
                    sd["_is_translated"] = False
                items.append(sd)

        self.finish(json.dumps({"locale": locale, "items": items}))


class CopyHandler(APIHandler):
    """POST /api/examples/copy"""

    def post(self):
        config: Config = self.settings["code_loader_config"]
        resolver: LocaleResolver = self.settings["code_loader_locale_resolver"]

        body = self.get_json_body()
        domain_id = body["domain"]
        filename = body["file"]
        locale = body.get("locale", config.default_locale)

        src, resolved, is_tr = resolver.resolve_file(
            domain_id, "code", filename, locale
        )

        if not src.exists():
            self.set_status(404)
            return self.finish(json.dumps({"error": "File not found"}))

        dest_dir = config.workspace_dir / domain_id
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / filename

        if not dest.exists():
            shutil.copy2(src, dest)

        # Also copy dependency files
        for dep in ["requirements.txt", "install.R"]:
            dep_src = config.cache_dir / "domains" / domain_id / dep
            dep_dest = dest_dir / dep
            if dep_src.exists() and not dep_dest.exists():
                shutil.copy2(dep_src, dep_dest)

        self.finish(json.dumps({
            "path": str(dest),
            "filename": dest.name,
            "resolved_locale": resolved,
            "is_translated": is_tr,
        }))


class FileHandler(APIHandler):
    """GET /api/examples/file?domain=X&file=Y — raw file content"""

    def get(self):
        config: Config = self.settings["code_loader_config"]
        domain_id = self.get_argument("domain")
        filename = self.get_argument("file")
        locale = _get_locale(self)
        resolver: LocaleResolver = self.settings["code_loader_locale_resolver"]

        path, _, _ = resolver.resolve_file(domain_id, "code", filename, locale)
        if not path.exists():
            self.set_status(404)
            return self.finish(json.dumps({"error": "File not found"}))

        self.set_header("Content-Type", "application/octet-stream")
        self.finish(path.read_bytes())


class UILabelsHandler(APIHandler):
    """GET /api/examples/i18n?locale=fr"""

    def get(self):
        config: Config = self.settings["code_loader_config"]
        locale = _get_locale(self)

        path = config.cache_dir / "i18n" / f"{locale}.json"
        if not path.exists():
            path = config.cache_dir / "i18n" / "en.json"
        if path.exists():
            self.finish(path.read_text())
        else:
            self.finish(json.dumps({}))


class RefreshHandler(APIHandler):
    """POST /api/examples/refresh"""

    def post(self):
        sync: GitSync = self.settings["code_loader_git_sync"]
        self.finish(json.dumps(sync.clone_or_pull()))


class StatusHandler(APIHandler):
    """GET /api/examples/status"""

    def get(self):
        sync: GitSync = self.settings["code_loader_git_sync"]
        self.finish(json.dumps(sync.status()))


class CoverageHandler(APIHandler):
    """GET /api/examples/domains/{domain_id}/coverage?locale=xx"""

    def get(self, domain_id):
        resolver: LocaleResolver = self.settings["code_loader_locale_resolver"]
        locale = _get_locale(self)
        coverage = resolver.get_translation_coverage(domain_id, locale)
        self.finish(json.dumps(coverage))


class ConfigHandler(APIHandler):
    """GET/POST/DELETE /api/examples/config — read, update, or reset config."""

    def get(self):
        config: Config = self.settings["code_loader_config"]
        self.finish(json.dumps(config.to_dict()))

    def delete(self):
        new_config = Config.reset()
        self.settings["code_loader_config"] = new_config
        sync: GitSync = self.settings["code_loader_git_sync"]
        sync.config = new_config
        resolver: LocaleResolver = self.settings["code_loader_locale_resolver"]
        resolver.config = new_config
        self.finish(json.dumps(new_config.to_dict()))

    def post(self):
        config: Config = self.settings["code_loader_config"]
        sync: GitSync = self.settings["code_loader_git_sync"]

        body = self.get_json_body()

        if "repo_url" in body:
            config.repo_url = body["repo_url"]
        if "branch" in body:
            config.branch = body["branch"]
        if "git_token" in body:
            config.git_token = body["git_token"]
        if "default_locale" in body:
            config.default_locale = body["default_locale"]
        if "cache_dir" in body:
            config.cache_dir = Path(body["cache_dir"]).expanduser()
        if "workspace_dir" in body:
            config.workspace_dir = Path(body["workspace_dir"]).expanduser()
        if "refresh_interval" in body:
            config.refresh_interval = int(body["refresh_interval"])

        config.save()

        # If repo URL was just set, trigger initial sync
        result = {}
        if config.repo_url:
            sync.config = config
            result = sync.clone_or_pull()

        self.finish(json.dumps({
            "config": config.to_dict(),
            "sync": result,
        }))


def setup_handlers(web_app):
    """Register all API handlers."""
    base = web_app.settings["base_url"]
    prefix = f"{base}api/examples"

    handlers = [
        (f"{prefix}/registry", RegistryHandler),
        (f"{prefix}/domains/([^/]+)", DomainHandler),
        (f"{prefix}/domains/([^/]+)/code", CodeListHandler),
        (f"{prefix}/domains/([^/]+)/snippets", SnippetListHandler),
        (f"{prefix}/domains/([^/]+)/coverage", CoverageHandler),
        (f"{prefix}/snippets", SharedSnippetsHandler),
        (f"{prefix}/copy", CopyHandler),
        (f"{prefix}/file", FileHandler),
        (f"{prefix}/i18n", UILabelsHandler),
        (f"{prefix}/refresh", RefreshHandler),
        (f"{prefix}/status", StatusHandler),
        (f"{prefix}/config", ConfigHandler),
    ]
    web_app.add_handlers(".*$", handlers)
