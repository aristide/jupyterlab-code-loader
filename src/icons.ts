import { LabIcon } from '@jupyterlab/ui-components';

// Code-loader sidebar icon — the "load-into-code" glyph from the
// Data4Now brand mark: angle brackets framing a downward chevron arrow.
// Monochrome (currentColor → JupyterLab theme color) so it reads on both
// light and dark themes. Scaled to 24×24 from the canonical 128×128 mark.
const codeLoaderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--jp-inverse-layout-color3)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8.25 7 L5 12 L8.25 17"/>
  <path d="M15.75 7 L19 12 L15.75 17"/>
  <path d="M12 9 L12 13"/>
  <path d="M10 12 L12 14 L14 12"/>
</svg>`;

export const codeLoaderIcon = new LabIcon({
  name: 'jupyterlab-code-loader:icon',
  svgstr: codeLoaderSvg
});
