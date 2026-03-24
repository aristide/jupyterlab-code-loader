# Changelog

## 0.1.0

### Added

- Reset button on the sidebar toolbar to clear local configuration and return to the setup form. Visibility is controlled by the `CLOADER_ALLOW_RESET` environment variable (set to `1`, `true`, or `yes` to enable).
- `CLOADER_SUPPORTED_LOCALES` environment variable to define supported content languages as a comma-separated list (default: `en,fr`).
- Automatic content language detection from JupyterLab's active language. Falls back to English if the current JupyterLab language is not in the supported locales list.
- DELETE endpoint on `/api/examples/config` to reset configuration to env-var defaults.

### Changed

- Removed locale selection from the setup form. Content language is now auto-detected from JupyterLab settings.
- `supported_locales` and `allow_reset` fields are now included in the config API response.

### Fixed

- Corrected package name references in README and RELEASE docs (was `jupyterlab-disable-download`, now `jupyterlab-code-loader`).
- Fixed CSS lint issues (prettier formatting, stylelint modern color notation, kebab-case keyframes).
- Removed unused `updateStatusBar` import in widget.ts.
