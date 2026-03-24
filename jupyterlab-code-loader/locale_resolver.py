"""Locale resolver with per-file three-step fallback chain.

Resolution order:
1. {base}/{requested_locale}/{filename}
2. {base}/{default_locale}/{filename}
3. {base}/en/{filename}
"""

from pathlib import Path

from .config import Config


class LocaleResolver:
    """Resolve content files with locale fallback."""

    def __init__(self, config: Config):
        self.config = config

    def resolve_file(
        self,
        domain_id: str,
        content_type: str,  # "code" or "snippets"
        filename: str,
        locale: str
    ) -> tuple[Path, str, bool]:
        """Return (path, resolved_locale, is_translated)."""
        base = self.config.cache_dir / "domains" / domain_id / content_type
        default = self.config.default_locale

        # Step 1: requested locale
        candidate = base / locale / filename
        if candidate.exists():
            return candidate, locale, (locale != "en")

        # Step 2: configured default locale
        if locale != default:
            candidate = base / default / filename
            if candidate.exists():
                return candidate, default, False

        # Step 3: ultimate fallback to English
        candidate = base / "en" / filename
        return candidate, "en", False

    def list_available_locales(
        self, domain_id: str, content_type: str
    ) -> list[str]:
        """List locale folders that exist on disk for a domain."""
        base = self.config.cache_dir / "domains" / domain_id / content_type
        if not base.exists():
            return ["en"]
        return sorted([
            d.name for d in base.iterdir()
            if d.is_dir() and not d.name.startswith(".")
        ])

    def get_translation_coverage(
        self, domain_id: str, locale: str
    ) -> dict:
        """Compute translation coverage statistics for a domain/locale."""
        base = self.config.cache_dir / "domains" / domain_id

        en_code = base / "code" / "en"
        loc_code = base / "code" / locale
        en_snip = base / "snippets" / "en"
        loc_snip = base / "snippets" / locale

        en_c = set(f.name for f in en_code.glob("*")) if en_code.exists() else set()
        lo_c = set(f.name for f in loc_code.glob("*")) if loc_code.exists() else set()
        en_s = set(f.name for f in en_snip.glob("*.json")) if en_snip.exists() else set()
        lo_s = set(f.name for f in loc_snip.glob("*.json")) if loc_snip.exists() else set()

        total = len(en_c) + len(en_s)
        translated = len(lo_c & en_c) + len(lo_s & en_s)

        return {
            "locale": locale,
            "total_files": total,
            "translated_files": translated,
            "coverage_percent": round(translated / total * 100) if total else 0,
            "missing_code": sorted(en_c - lo_c),
            "missing_snippets": sorted(en_s - lo_s),
        }
