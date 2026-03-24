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
import { setLocale } from './handler';
import { codeLoaderIcon } from './icons';

const PLUGIN_ID = 'jupyterlab-code-loader:plugin';

const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [ILayoutRestorer],
  optional: [INotebookTracker, ITranslator],
  activate: (
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer,
    notebookTracker: INotebookTracker | null,
    translator: ITranslator | null
  ) => {
    // Set locale from JupyterLab translator
    const locale = (translator && (translator as any).languageCode) || 'en';
    setLocale(locale);

    // Create the sidebar widget
    const widget = new CodeLoaderWidget(app, notebookTracker, locale);
    widget.id = 'jupyterlab-code-loader-sidebar';
    widget.title.icon = codeLoaderIcon;
    widget.title.caption = 'Examples & Snippets';

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
