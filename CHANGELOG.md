# Changelog

## 0.2.0

### Added

- Data4Now design system applied to the sidebar and setup form (navy/teal/magenta palette, Montserrat/Roboto/JetBrains Mono fonts).
- New code-loader brand logo and wordmark (`style/code-loader-logo.svg`, `style/code-loader-wordmark.svg`) wired into the JupyterLab sidebar icon and topbar.
- Public-repository authentication mode (default), alongside Token and Login (username/password) modes.
- Inline "Test" button on the setup form: validates URL format, resolves the provider (GitHub/GitLab), and checks branch existence via REST APIs before connecting.
- Extended UI string set: rich-HTML descriptions, provider hints, test-connection statuses (resolving, branch found/missing, repo not found, auth required, rate-limited), credential field labels, and empty-state copy.
- French translations for all new strings in `i18n/fr.json` (89 keys total, full parity with `en.json`).

### Changed

- `en.json` bundled translation file synced with the current `DEFAULT_LABELS` set in `widget.ts` (was missing ~33 keys introduced by recent UI work).
- Setup form layout restructured into Repository / Authentication cards with a 3-option segmented auth control.

## 0.1.0

### Added

- Full French (fr) internationalization of all UI strings — setup form, tooltips, badges, status bar, error messages.
- Bundled i18n JSON files (en.json, fr.json) shipped with the extension as fallback when the content repository doesn't provide translations.
- "Open" button on code example rows to copy the file to the workspace and open it.
- Smart snippet insertion: inserts into compatible open notebook or creates a new notebook with the correct kernel. Empty active cells are populated in-place.
- Bash snippets get a "Copy for terminal" button that formats commands as a single pasteable line with `&&` joins.
- Bash script and snippet support (`bash` code_lang, `.sh` file type, bash/sh kernel mapping).
- Reset button on the sidebar toolbar to clear local configuration and return to the setup form. Visibility is controlled by the `CLOADER_ALLOW_RESET` environment variable (set to `1`, `true`, or `yes` to enable).
- `CLOADER_SUPPORTED_LOCALES` environment variable to define supported content languages as a comma-separated list (default: `en,fr`).
- Automatic content language detection from JupyterLab's active language. Falls back to English if the current JupyterLab language is not in the supported locales list.
- DELETE endpoint on `/api/examples/config` to reset configuration to env-var defaults.

### Changed

- Sidebar title changed from "Examples & snippets" to "Code & snippets".
- Reset button is now enabled by default; set `CLOADER_ALLOW_RESET=false` to hide it.
- Reset now also deletes the local cache directory to free disk space.
- Removed locale selection from the setup form. Content language is now auto-detected from JupyterLab settings.
- `supported_locales` and `allow_reset` fields are now included in the config API response.

### Fixed

- Corrected package name references in README and RELEASE docs (was `jupyterlab-disable-download`, now `jupyterlab-code-loader`).
- Fixed CSS lint issues (prettier formatting, stylelint modern color notation, kebab-case keyframes).
- Removed unused `updateStatusBar` import in widget.ts.
