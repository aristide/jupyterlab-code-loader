import { LabIcon } from '@jupyterlab/ui-components';

// Code-loader logo adapted from cloader.svg for JupyterLab theming.
// Uses jp-icon3 class so the fill reacts to the active theme via
// .jp-icon3[fill] { fill: var(--jp-inverse-layout-color3); }
const codeLoaderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <path class="jp-icon3" fill="var(--jp-inverse-layout-color3)" d="M9.1,24.0 L11.5,17.4 L11.9,16.5 L12.5,16.0 L13.0,15.8 L16.5,15.7 L17.2,15.3 L17.3,14.9 L17.3,8.5 L17.3,8.3 L14.6,8.3 L13.9,8.0 L13.4,7.2 L13.4,4.7 L7.3,4.7 L6.8,5.0 L6.7,19.0 L7.0,19.4 L7.5,19.6 L9.9,19.6 L9.5,20.7 L6.8,20.6 L6.0,20.0 L5.7,19.2 L5.7,4.9 L6.4,4.0 L7.1,3.6 L11.4,3.6 L12.4,1.2 L13.0,0.4 L13.8,0.0 L15.3,0.0 L14.0,3.5 L18.0,7.5 L18.3,8.0 L18.3,15.4 L18.1,15.9 L17.6,16.6 L14.2,19.7 L9.1,24.0Z"/>
</svg>`;

export const codeLoaderIcon = new LabIcon({
  name: 'jupyterlab-code-loader:icon',
  svgstr: codeLoaderSvg
});
