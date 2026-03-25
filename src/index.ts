/**
 * jupyterlab-code-loader: Plugin entry point.
 *
 * Registers the sidebar widget and wires up kernel detection.
 */

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';
import { ITranslator } from '@jupyterlab/translation';
import { INotebookTracker } from '@jupyterlab/notebook';
import { CodeLoaderWidget } from './widget';
import { requestAPI, setLocale } from './handler';
import { codeLoaderIcon } from './icons';
import { IConfig } from './model';

const PLUGIN_ID = 'jupyterlab-code-loader:plugin';

const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [ILayoutRestorer],
  optional: [INotebookTracker, ITranslator],
  activate: async (
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer,
    notebookTracker: INotebookTracker | null,
    translator: ITranslator | null
  ) => {
    // Detect JupyterLab language code and normalize BCP47 (fr-FR → fr)
    const rawLocale = translator?.languageCode || 'en';
    const jlLocale = rawLocale.split('-')[0].toLowerCase();
    console.log(
      `[CodeLoader] JupyterLab locale: raw=${rawLocale}, normalized=${jlLocale}`
    );

    // Fetch supported locales from backend and validate
    let locale = 'en';
    try {
      const config = await requestAPI<IConfig>('config');
      const supported = config.supported_locales || ['en', 'fr'];
      locale = supported.includes(jlLocale) ? jlLocale : 'en';
      console.log(
        `[CodeLoader] Supported: ${supported.join(',')}, using: ${locale}`
      );
    } catch {
      // Fallback to en if config fetch fails
    }
    setLocale(locale);

    // Create the sidebar widget
    const widget = new CodeLoaderWidget(app, notebookTracker, locale);
    widget.id = 'jupyterlab-code-loader-sidebar';
    widget.title.icon = codeLoaderIcon;
    widget.title.caption = 'Code & Snippets';

    // ---- Kernel detection ----
    if (notebookTracker) {
      notebookTracker.currentChanged.connect((_, notebook) => {
        if (notebook) {
          const session = notebook.sessionContext;
          session.ready.then(() => {
            widget.setActiveKernel(session.session?.kernel?.name || null);
          });
          session.kernelChanged.connect(() => {
            widget.setActiveKernel(session.session?.kernel?.name || null);
          });
        } else {
          widget.setActiveKernel(null);
        }
      });

      // Clear filter when focus moves to non-notebook
      app.shell.currentChanged.connect((_, change) => {
        const current = change.newValue;
        if (!current || !notebookTracker.has(current)) {
          widget.setActiveKernel(null);
        }
      });
    }

    // Add to left sidebar and register with restorer
    restorer.add(widget, PLUGIN_ID);
    app.shell.add(widget, 'left', { rank: 200 });

    console.log('jupyterlab-code-loader extension activated');
  }
};

export default plugin;
